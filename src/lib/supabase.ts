import { createClient } from '@supabase/supabase-js'
import { headers, cookies } from 'next/headers'
import { cache } from 'react'

// Cliente Supabase para uso no lado do CLIENTE (browser)
// Este cliente não usa headers ou cookies do Next.js diretamente
export const createBrowserClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Cliente Supabase para uso em Server Components e API Routes (sem autenticação de usuário)
// Usa headers para contexto de requisição
export const createServerClient = cache(() => {
  const cookieStore = cookies()
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string) {
          cookieStore.set(name, '', { ...options, expires: new Date(0) })
        },
      },
    }
  )
})

// Cliente Supabase para uso em Server Actions ou API Routes que precisam de autenticação de usuário
// Este cliente é para interações autenticadas no servidor
export const createServerAuthClient = cache(() => {
  const cookieStore = cookies()
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string) {
          cookieStore.set(name, '', { ...options, expires: new Date(0) })
        },
      },
    }
  )
})
