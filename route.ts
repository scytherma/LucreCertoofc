import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { planType, priceId, userId, paymentMethod } = await request.json()

    if (!planType || !userId) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Criar cliente Supabase para operações do servidor
    const supabase = createServerSupabaseClient()

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
    
    if (userError || !userData.user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const user = userData.user
    const userEmail = user.email!
    const userName = user.user_metadata?.name || userEmail

    // Configurar parâmetros da sessão de checkout
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: paymentMethod === 'pix' ? ['pix'] : ['card'],
      line_items: [],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/planos?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        planType: planType,
      },
    }

    // Configurar linha de item baseada no tipo de plano
    if (planType === 'trial') {
      // Para teste grátis, criar uma assinatura com período de teste
      if (!priceId) {
        return NextResponse.json(
          { error: 'Price ID é obrigatório para teste grátis' },
          { status: 400 }
        )
      }

      sessionParams.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ]
      
      // Configurar período de teste de 3 dias
      sessionParams.subscription_data = {
        trial_period_days: 3,
        metadata: {
          userId: userId,
          planType: planType,
        },
      }
    } else {
      // Para planos pagos
      if (!priceId) {
        return NextResponse.json(
          { error: 'Price ID é obrigatório para planos pagos' },
          { status: 400 }
        )
      }

      sessionParams.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ]

      sessionParams.subscription_data = {
        metadata: {
          userId: userId,
          planType: planType,
        },
      }
    }

    // Criar a sessão de checkout
    const session = await stripe.checkout.sessions.create(sessionParams)

    // Salvar informações da sessão no Supabase para rastreamento
    const { error: sessionError } = await supabase
      .from('checkout_sessions')
      .insert({
        session_id: session.id,
        user_id: userId,
        plan_type: planType,
        price_id: priceId,
        payment_method: paymentMethod,
        status: 'pending',
        created_at: new Date().toISOString(),
      })

    if (sessionError) {
      console.error('Erro ao salvar sessão no Supabase:', sessionError)
      // Não retornar erro aqui, pois a sessão da Stripe foi criada com sucesso
    }

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Erro da Stripe: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

