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
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: { message: 'Erro inesperado ao fazer login' } }
  }
}

// Função para fazer login com Google
export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: { message: 'Erro inesperado ao fazer login com Google' } }
  }
}

// Função para fazer registro
export async function signUp(email: string, password: string, name: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    })

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: { message: 'Erro inesperado ao fazer registro' } }
  }
}

// Função para fazer logout
export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: { message: error.message } }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: { message: 'Erro inesperado ao fazer logout' } }
  }
}

// Função para obter o usuário atual
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    return null
  }
}

// Função para verificar se o usuário está autenticado
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

