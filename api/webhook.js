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
};
