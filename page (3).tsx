'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { PLANS, Plan } from '@/lib/plans'
import { User } from '@supabase/supabase-js'

export default function PlanosPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cartao' | 'pix' | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const checkAuth = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan)
    setMessage({ text: `Plano ${plan.name} selecionado!`, type: 'success' })
  }

  const handlePaymentMethodSelect = (method: 'cartao' | 'pix') => {
    setSelectedPaymentMethod(method)
  }

  const handleFinalizePurchase = async () => {
    if (!selectedPlan || !selectedPaymentMethod) {
      setMessage({ text: 'Selecione um plano e método de pagamento', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: selectedPlan.id,
          priceId: selectedPlan.priceId,
          userId: user.id,
          paymentMethod: selectedPaymentMethod,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Erro ao processar pagamento')
      }
    } catch (error) {
      console.error('Erro ao finalizar compra:', error)
      setMessage({ text: 'Erro ao processar pagamento. Tente novamente.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const plans = Object.values(PLANS)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-20 bg-white shadow-lg flex flex-col items-center py-6 z-10">
        <img 
          src="https://i.postimg.cc/KYqk4xX2/LOGO-LUCRE-CERTO-FOGUETE.png" 
          alt="Lucro Certo" 
          className="h-12 w-12 mb-8"
        />
        <nav className="flex flex-col space-y-4">
          <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg">🏠</button>
          <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg">📊</button>
          <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg">📋</button>
          <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg">📄</button>
          <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg">🔍</button>
          <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg">⭐</button>
        </nav>
      </div>

      {/* Conteúdo Principal */}
      <div className="ml-20 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Finalize sua assinatura</h1>
          <p className="text-xl text-gray-600">
            Desbloqueie todos os recursos premium e venda mais com a Calculadora Lucro Certo!
          </p>
        </div>

        {/* Mensagem */}
        {message && (
          <div className={`max-w-4xl mx-auto mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Cards de Planos */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-xl ${
                selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500 transform scale-105' : ''
              } ${plan.badge ? 'border-2 border-yellow-400' : ''}`}
              onClick={() => handlePlanSelect(plan)}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                  {plan.badge}
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-sm text-gray-500">R$</span>
                  <span className="text-3xl font-bold text-gray-900">{plan.price.toFixed(2).replace('.', ',')}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
                {plan.savings && (
                  <div className="text-green-600 font-medium text-sm">{plan.savings}</div>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  selectedPlan?.id === plan.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedPlan?.id === plan.id ? `${plan.name} ✓` : `Escolher ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Botões de Pagamento */}
        {selectedPlan && (
          <div className="max-w-md mx-auto mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
              Escolha o método de pagamento
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handlePaymentMethodSelect('cartao')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPaymentMethod === 'cartao'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-medium">Cartão</div>
                </div>
              </button>
              <button
                onClick={() => handlePaymentMethodSelect('pix')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPaymentMethod === 'pix'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📱</div>
                  <div className="font-medium">PIX</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Botão Finalizar */}
        {selectedPlan && selectedPaymentMethod && (
          <div className="max-w-md mx-auto mb-8">
            <button
              onClick={handleFinalizePurchase}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processando...' : (
                selectedPaymentMethod === 'pix' ? '📱 Gerar PIX' : '💳 Assinar agora'
              )}
            </button>
          </div>
        )}

        {/* Selos de Segurança */}
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="text-lg mr-2">🔒</span>
              <span>Pagamento 100% seguro e criptografado</span>
            </div>
            <div className="flex items-center">
              <span className="text-lg mr-2">🛡️</span>
              <span>Compra protegida por criptografia SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

