import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase' // Importe createServerClient

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: '2025-07-30.basil',
  }
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const supabase = createServerClient() // Use createServerClient aqui
  const buf = await req.text()
  const sig = req.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  switch (event.type) {
    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionCreated(subscription, supabase)
      break
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdated(subscription, supabase)
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(subscription, supabase)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      
      console.log('Invoice payment succeeded:', invoice.id)
      
      const subscriptionId = (invoice as any).subscription
      if (subscriptionId && typeof subscriptionId === 'string') {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        await handleSubscriptionUpdated(subscription, supabase)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      // Opcional: Lidar com falha de pagamento (notificar usuário, etc.)
      console.log('Invoice payment failed:', invoice.id)
      break
    }
    // ... lidar com outros tipos de eventos
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: ReturnType<typeof createServerClient>) { // Tipo ajustado
  try {
    const userId = subscription.metadata.userId
    const planType = subscription.metadata.planType

    if (!userId || !planType) {
      console.error('Metadata missing for subscription created event')
      return
    }

    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        plan_type: planType,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })

    if (error) {
      console.error('Error inserting new subscription:', error)
    }
  } catch (error) {
    console.error('Erro ao processar criação de assinatura:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: ReturnType<typeof createServerClient>) { // Tipo ajustado
  try {
    const currentPeriodStart = new Date(subscription.current_period_start * 1000)
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan_type: subscription.metadata.planType,
        status: subscription.status,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating subscription:', error)
    }
  } catch (error) {
    console.error('Erro ao processar atualização de assinatura:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: ReturnType<typeof createServerClient>) { // Tipo ajustado
  try {
    // Marcar assinatura como cancelada
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: subscription.status })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error deleting subscription:', error)
    }
  } catch (error) {
    console.error('Erro ao processar exclusão de assinatura:', error)
  }
}
