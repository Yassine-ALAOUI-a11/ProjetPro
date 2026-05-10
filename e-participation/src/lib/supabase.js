import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Il manque les variables d\'environnement Supabase dans le fichier .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
