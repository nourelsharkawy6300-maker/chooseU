import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serverClientInstance: SupabaseClient | null = null;

/**
 * Returns a server-only Supabase client initialized with the SUPABASE_SERVICE_ROLE_KEY.
 * Falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY only if SERVICE_ROLE_KEY is not defined.
 * Bypasses RLS to execute parameterized backend queries safely.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  if (!serverClientInstance) {
    serverClientInstance = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          "X-Client-Info": "chooseu-server-orders-v1",
        },
      },
    });
  }

  return serverClientInstance;
}

/**
 * Backwards compatibility alias for getSupabaseServerClient.
 */
export const getSupabaseClient = getSupabaseServerClient;
