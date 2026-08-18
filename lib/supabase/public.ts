import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Plain client for public, unauthenticated reads (product catalog, categories) in Server
// Components. Deliberately doesn't touch cookies()/next/headers like lib/supabase/server.ts
// does — calling cookies() opts a route into dynamic rendering, which would force every page
// (even ones with no per-user data, like /about) to be server-rendered on every request instead
// of statically generated. Safe here because catalog/category RLS policies are public-read
// regardless of auth state, so there's nothing user-specific this client needs from cookies.
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
