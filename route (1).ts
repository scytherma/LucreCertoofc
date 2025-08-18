import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Erro na verificação do webhook:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Criar cliente Supabase para operações do servidor
    const supabase = createServerSupabaseClient()

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('Checkout session completed:', session.id)

        // Atualizar status da sessão no banco
        const { error: sessionUpdateError } = await supabase
          .from('checkout_sessions')
          .update({ 
            status: 'completed',
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', session.id)

        if (sessionUpdateError) {
          console.error('Erro ao atualizar sessão:', sessionUpdateError)
        }

        // Se for uma assinatura, processar a criação da assinatura
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
          await handleSubscriptionCreated(subscription, supabase)
        }

        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('Subscription created:', subscription.id)
        
        await handleSubscriptionCreated(subscription, supabase)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('Subscription updated:', subscription.id)
        
        await handleSubscriptionUpdated(subscription, supabase)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('Subscription deleted:', subscription.id)
        
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
        
        console.log('Invoice payment failed:', invoice.id)
        
        // Aqui você pode implementar lógica para lidar com falhas de pagamento
        // Por exemplo, enviar email de notificação, suspender acesso, etc.
        break
      }

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: ReturnType<typeof createServerSupabaseClient>) {
  try {
    const userId = subscription.metadata.userId
    const planType = subscription.metadata.planType

    if (!userId) {
      console.error('User ID não encontrado nos metadados da assinatura')
      return
    }

    // Calcular datas
    const now = new Date()
    const currentPeriodStart = new Date(subscription.current_period_start * 1000)
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null

    // Inserir ou atualizar assinatura no banco
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        plan_type: planType,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        trial_end: trialEnd?.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })

    if (error) {
      console.error('Erro ao salvar assinatura:', error)
    } else {
      console.log(`Assinatura criada para usuário ${userId}`)
    }

  } catch (error) {
    console.error('Erro ao processar criação de assinatura:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: ReturnType<typeof createServerSupabaseClient>) {
  try {
    const currentPeriodStart = new Date(subscription.current_period_start * 1000)
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null

    // Atualizar assinatura no banco
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        trial_end: trialEnd?.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Erro ao atualizar assinatura:', error)
    } else {
      console.log(`Assinatura ${subscription.id} atualizada`)
    }

  } catch (error) {
    console.error('Erro ao processar atualização de assinatura:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: ReturnType<typeof createServerSupabaseClient>) {
  try {
    // Marcar assinatura como cancelada
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Erro ao cancelar assinatura:', error)
    } else {
      console.log(`Assinatura ${subscription.id} cancelada`)
    }

  } catch (error) {
    console.error('Erro ao processar cancelamento de assinatura:', error)
  }
}

