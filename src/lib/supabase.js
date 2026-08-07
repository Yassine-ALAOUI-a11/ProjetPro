import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Il manque les variables d\'environnement Supabase dans le fichier .env');
}

// Fallback to a placeholder URL and key to prevent throwing a module-level initialization error.
// This allows the React app to mount and display the UI (with console warnings) instead of crashing with a blank screen.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
