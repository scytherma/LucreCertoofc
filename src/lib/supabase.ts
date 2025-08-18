import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"
import { cache } from "react"

// Função para criar o cliente Supabase para uso no lado do cliente (browser)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Função para criar o cliente Supabase para uso no lado do servidor (API Routes, Server Components)
// Isso é necessário para lidar com a autenticação de sessão no servidor
export const createServerSupabaseClient = cache(() => {
  const heads = headers()
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  )
})


