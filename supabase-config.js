// supabase-config.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Função para obter URL correta baseada no ambiente
export const getURL = () => {
  let url =
    // Use window.location.origin para obter a URL base do navegador
    window.location.origin ??
    'http://localhost:3000/' // Fallback para desenvolvimento local
  
  // Garante que a URL começa com 'https://' (exceto para localhost)
  url = url.startsWith('http') ? url : `https://${url}`
  
  // Garante que a URL termina com '/'
  url = url.endsWith('/') ? url : `${url}/`
  
  return url
}

// Inicializa o cliente Supabase com as chaves fornecidas
export const supabase = createClient(
  "https://waixxytscfwwumzowejg.supabase.co", // NEXT_PUBLIC_SUPABASE_URL fornecida pelo usuário
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhaXh4eXRzY2Z3d3Vtem93ZWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjcxNDksImV4cCI6MjA3MDcwMzE0OX0.hhrzHxLqI7YcJgjZr_dAi7Qku3Q8UiMN0Qmyne71Vko" // NEXT_PUBLIC_SUPABASE_ANON_KEY fornecida pelo usuário
);
