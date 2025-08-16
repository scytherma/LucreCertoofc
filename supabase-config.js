// supabase-config.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Inicializa o cliente Supabase usando variáveis de ambiente da Vercel
export const supabase = createClient(
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://waixxytscfwwumzowejg.supabase.co",
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhaXh4eXRzY2Z3d3Vtem93ZWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjcxNDksImV4cCI6MjA3MDcwMzE0OX0.hhrzHxLqI7YcJgjZr_dAi7Qku3Q8UiMN0Qmyne71Vko"
);
