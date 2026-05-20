import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabaseConfigured =
  supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://");

export function createClient() {
  if (!supabaseConfigured) {
    throw new Error("Supabase is not configured. Add real credentials to .env.local.");
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
}
