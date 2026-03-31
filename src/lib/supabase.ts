import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://omhhmvwnatgyksexwbly.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9taGhtdnduYXRneWtzZXh3Ymx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDcyNzczMCwiZXhwIjoyMDkwMzAzNzMwfQ.6rSvCF5YuiT43K1RG7CGuQow1hL7wprCjF2LBdkHdls'

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})