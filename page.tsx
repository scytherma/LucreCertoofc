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
          className="h-20 mx-auto mb-6"
        />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}

