const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

// Configuração do Supabase Admin Client (para uso no backend)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } } // Não persistir sessão no servidor
);

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

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
};
