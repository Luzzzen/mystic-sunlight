/* ============================================
   MYSTIC SUNLIGHT — supabase-client.js
   Conexión al proyecto de Supabase.
   La "publishable key" es segura para exponer en el
   navegador — está diseñada para eso. La "secret key"
   NUNCA debe ir acá.
   ============================================ */

const SUPABASE_URL = 'https://buwkbhjokqlqiyfigcks.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_gp0wfVegRCee6xlsr6HicQ_q9i3m1gx';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
