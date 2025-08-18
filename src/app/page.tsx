
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default function HomePage() {
  const router = useRouter()

  const checkAuthAndRedirect = async () => {
    const user = await getCurrentUser()
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  useEffect(() => {
    checkAuthAndRedirect()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <img 
          src="https://i.postimg.cc/KYqk4xX2/LOGO-LUCRE-CERTO-FOGUETE.png" 
          alt="Lucro Certo" 
          className="h-24 mx-auto mb-6 animate-bounce"
        />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Carregando...</h1>
        <p className="text-lg text-gray-700">Verificando sua sessão.</p>
      </div>
    </div>
  )
}


