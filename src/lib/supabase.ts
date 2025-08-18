import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { cache } from 'react'

// Cliente Supabase para uso no lado do CLIENTE (browser)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Cliente Supabase para uso no lado do SERVIDOR (API Routes, Server Components)
// Usa cache e headers, que são específicos do servidor
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

// Cliente Supabase para uso em Server Actions ou API Routes que precisam de autenticação de usuário
// Usa cookies para manter a sessão do usuário
export const createClientSupabaseClient = cache(() => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return eval(`typeof window !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1] : undefined`);
        },
        set(name: string, value: string, options: any) {
          eval(`typeof window !== 'undefined' ? document.cookie = name + '=' + value + '; Path=/;' + options.expires + ';' + options.secure : undefined`);
        },
        remove(name: string) {
          eval(`typeof window !== 'undefined' ? document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;' : undefined`);
        },
      },
    }
  )
})
