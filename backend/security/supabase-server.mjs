import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !publishableKey) throw new Error('Supabase server configuration is incomplete');

// These clients are server-only. Never import this module from src/ or expose its keys.
export const supabaseAuth = createClient(url, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

export const supabaseAdmin = serviceRoleKey
  ? createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })
  : null;

export async function verifyAccessToken(accessToken) {
  if (!accessToken) return { user: null, error: new Error('Missing access token') };
  const { data, error } = await supabaseAuth.auth.getUser(accessToken);
  return { user: data.user || null, error: error || null };
}
