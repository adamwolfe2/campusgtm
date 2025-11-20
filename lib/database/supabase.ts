/**
 * Supabase Client Configuration
 * Provides singleton client instance for database operations
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials not found. Using localStorage fallback mode."
  );
}

/**
 * Creates a Supabase client instance
 * Returns null if credentials not configured (allows localStorage fallback)
 */
export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * Singleton Supabase client instance
 */
export const supabase = createSupabaseClient();

/**
 * Checks if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
