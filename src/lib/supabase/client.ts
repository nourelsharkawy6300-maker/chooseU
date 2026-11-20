import { createBrowserClient } from "@supabase/ssr";

/**
 * Returns a browser-side Supabase client using public environment variables.
 * Safe to call from client components. Strictly zero service role keys.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
