import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase' // Importe createServerClient

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, userName, userEmail } = await request.json()

    if (!priceId || !userId || !userName || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerClient() // Use createServerClient aqui

    // Criar um cliente Stripe se não existir
    let customerId: string | undefined
    const { data: existingCustomer, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (customerError && customerError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching existing customer:', customerError)
      return NextResponse.json({ error: 'Failed to retrieve customer' }, { status: 500 })
    }

    if (existingCustomer) {
      customerId = existingCustomer.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        name: userName,
        metadata: { userId: userId },
      })
      customerId = customer.id

      const { error: insertError } = await supabase
        .from('customers')
        .insert({ user_id: userId, stripe_customer_id: customer.id })
      
      if (insertError) {
        console.error('Error inserting new customer:', insertError)
        return NextResponse.json({ error: 'Failed to save customer' }, { status: 500 })
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/planos?canceled=true`,
      metadata: {
        userId: userId,
        planType: priceId, // Você pode passar o tipo de plano aqui se quiser
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
