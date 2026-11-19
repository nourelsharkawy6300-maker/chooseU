import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

export { createClient as createBrowserClient } from "./supabase/client";
export { createClient as createServerClient } from "./supabase/server";

let browserInstance: SupabaseClient | null = null;

/**
 * Returns a client-safe Supabase instance using the public anon key.
 * Strictly zero service role keys.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!browserInstance) {
    browserInstance = createBrowserClient(supabaseUrl, supabaseAnonKey) as unknown as SupabaseClient;
  }

  return browserInstance;
}
