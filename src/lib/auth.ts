import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface AuthError {
  message: string
}

export interface AuthResponse {
  success: boolean
  error?: AuthError
  user?: User
}

// Função para fazer login
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: { message: error.message } }
  }
  return { success: true, user: data.user }
}

// Função para registrar um novo usuário
export async function signUp(email: string, password: string, name: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) {
    return { success: false, error: { message: error.message } }
  }
  return { success: true, user: data.user }
}

// Função para login com Google
export async function signInWithGoogle(): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    },
  })

  if (error) {
    return { success: false, error: { message: error.message } }
  }
  // O redirecionamento acontece automaticamente pelo Supabase
  return { success: true }
}

// Função para obter o usuário logado
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Função para fazer logout
export async function signOut(): Promise<{ success: boolean; error?: AuthError }> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    return { success: false, error: { message: error.message } }
  }
  return { success: true }
}


