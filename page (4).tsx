'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/auth'
import { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const checkAuth = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    setLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg flex flex-col z-10">
        <div className="p-6 border-b border-gray-200">
          <img 
            src="https://i.postimg.cc/KYqk4xX2/LOGO-LUCRE-CERTO-FOGUETE.png" 
            alt="Lucro Certo" 
            className="h-12 mx-auto mb-4"
          />
          <h2 className="text-lg font-semibold text-gray-900 text-center">Lucro Certo</h2>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="mr-3">🏠</span>
              Dashboard
            </button>
            <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="mr-3">📊</span>
              Calculadoras
            </button>
            <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="mr-3">📋</span>
              Relatórios
            </button>
            <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="mr-3">📄</span>
              Documentos
            </button>
            <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="mr-3">🔍</span>
              Pesquisar
            </button>
            <button 
              onClick={() => router.push('/planos')}
              className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="mr-3">⭐</span>
              Planos
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.user_metadata?.name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="mr-3">🚪</span>
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo, {user?.user_metadata?.name || 'Usuário'}!
          </h1>
          <p className="text-gray-600">
            Aqui você pode acessar todas as ferramentas da Calculadora Lucro Certo
          </p>
        </div>

        {/* Cards de Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-blue-600 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Calculadora de Preços</h3>
            <p className="text-gray-600">
              Calcule o preço ideal para seus produtos considerando custos e margem de lucro
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-green-600 text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Análise de Lucro</h3>
            <p className="text-gray-600">
              Analise a rentabilidade dos seus produtos e identifique oportunidades
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-purple-600 text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Relatórios</h3>
            <p className="text-gray-600">
              Gere relatórios detalhados sobre suas vendas e performance
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-orange-600 text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Metas de Vendas</h3>
            <p className="text-gray-600">
              Defina e acompanhe suas metas de vendas mensais e anuais
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-red-600 text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Controle de Estoque</h3>
            <p className="text-gray-600">
              Gerencie seu estoque e receba alertas de produtos em baixa
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="text-indigo-600 text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Configurações</h3>
            <p className="text-gray-600">
              Personalize a plataforma de acordo com suas necessidades
            </p>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Estatísticas Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
              <div className="text-gray-600">Produtos Cadastrados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">R$ 0,00</div>
              <div className="text-gray-600">Faturamento Mensal</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">0%</div>
              <div className="text-gray-600">Margem Média</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
              <div className="text-gray-600">Vendas Este Mês</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

