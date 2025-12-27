// ENSURES THIS MODULE CAN ONLY BE IMPORTED FROM CLIENT COMPONENTS
import "client-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseSingleton: SupabaseClient | null = null;

// ADDED: LAZY CREATION SO IT DOES NOT RUN DURING PRERENDER
export function getSupabaseBrowserClient(): SupabaseClient {
  if (supabaseSingleton) return supabaseSingleton;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // ADDED: CLEAR ERROR MESSAGE (WILL ONLY TRIGGER IN CLIENT USAGE)
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
  if (!anonKey) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");

  supabaseSingleton = createClient(url, anonKey);
  return supabaseSingleton;
}
