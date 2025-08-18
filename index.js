require("dotenv").config({ path: "./.env" });
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Supabase Admin Client (para uso no backend)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } } // Não persistir sessão no servidor
);

// Middleware para parsear JSON (para requisições POST)
app.use(express.json());

// Configuração do CORS para permitir requisições do seu frontend
app.use(cors({
    origin: process.env.YOUR_DOMAIN, // Permite apenas requisições do seu domínio
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
}));

// Endpoint para criar uma sessão de Checkout da Stripe
app.post("/create-checkout-session", async (req, res) => {
    const { planType, priceId, userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required." });
    }

    let sessionConfig = {
        mode: "subscription",
        line_items: [
            {
                price: priceId, // ID do preço da Stripe
                quantity: 1,
            },
        ],
        success_url: `${process.env.YOUR_DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.YOUR_DOMAIN}/cancel.html`,
        metadata: { userId: userId }, // Passa o ID do usuário para o webhook
    };

    // Configurar trial para o plano de teste
    if (planType === "trial") {
        // Para o trial, associamos a um plano pago (ex: mensal) e adicionamos o trial_period_days
        // Certifique-se de que priceId aqui é o ID do seu plano mensal na Stripe
        sessionConfig.subscription_data = {
            trial_period_days: 3,
        };
    }

    try {
        const session = await stripe.checkout.sessions.create(sessionConfig);
        res.json({ url: session.url });
    } catch (e) {
        console.error("Erro ao criar sessão de checkout:", e);
        res.status(500).json({ error: e.message });
    }
});

// Endpoint para Webhooks da Stripe
// Use express.raw() para que o corpo da requisição não seja parseado antes da verificação da assinatura
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Lidar com os eventos da Stripe
    switch (event.type) {
        case "checkout.session.completed":
            const checkoutSession = event.data.object;
            const userIdFromMetadata = checkoutSession.metadata.userId;
            const customerId = checkoutSession.customer;
            const subscriptionId = checkoutSession.subscription;

            if (userIdFromMetadata && customerId && subscriptionId) {
                try {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const priceId = subscription.items.data[0].price.id;
                    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
                    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;

                    // Atualizar ou inserir no Supabase
                    const { data, error } = await supabaseAdmin
                        .from("subscriptions")
                        .upsert({
                            user_id: userIdFromMetadata,
                            stripe_customer_id: customerId,
                            stripe_subscription_id: subscriptionId,
                            plan_id: priceId,
                            status: subscription.status,
                            current_period_end: currentPeriodEnd,
                            trial_end: trialEnd,
                        }, { onConflict: "user_id" }); // Atualiza se user_id já existe

                    if (error) {
                        console.error("Erro ao salvar assinatura no Supabase:", error);
                    }
                } catch (e) {
                    console.error("Erro ao processar checkout.session.completed:", e);
                }
            }
            break;
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
            const subscriptionObject = event.data.object;
            const userIdFromSubscription = subscriptionObject.metadata?.userId; // Se você passar userId na criação da subscription

            if (userIdFromSubscription) {
                try {
                    const { data, error } = await supabaseAdmin
                        .from("subscriptions")
                        .update({
                            status: subscriptionObject.status,
                            current_period_end: new Date(subscriptionObject.current_period_end * 1000).toISOString(),
                            trial_end: subscriptionObject.trial_end ? new Date(subscriptionObject.trial_end * 1000).toISOString() : null,
                        })
                        .eq("stripe_subscription_id", subscriptionObject.id);

                    if (error) {
                        console.error("Erro ao atualizar assinatura no Supabase:", error);
                    }
                } catch (e) {
                    console.error("Erro ao processar customer.subscription.updated/deleted:", e);
                }
            }
            break;
        // Adicione outros eventos da Stripe que você queira lidar (ex: invoice.payment_failed)
        default:
            console.log(`Evento não tratado: ${event.type}`);
    }

    res.status(200).end();
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});

