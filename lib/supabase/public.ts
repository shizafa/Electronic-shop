import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// Plain client for public, unauthenticated reads (product catalog, categories) in Server
// Components. Deliberately doesn't touch cookies()/next/headers like lib/supabase/server.ts
// does — calling cookies() opts a route into dynamic rendering, which would force every page
// (even ones with no per-user data, like /about) to be server-rendered on every request instead
// of statically generated. Safe here because catalog/category RLS policies are public-read
// regardless of auth state, so there's nothing user-specific this client needs from cookies.
//
// This also gets called from client components (e.g. compare/wishlist, which read products
// client-side). Module-scoped memoization keeps that to one instance per browser context —
// otherwise every call spins up its own GoTrueClient, which is what "Multiple GoTrueClient
// instances detected" is warning about. The anon key/URL are constant and there's no session
// state involved, so reusing one instance is safe on the server too.
let cached: SupabaseClient | undefined;

export function createClient() {
  if (!cached) {
    cached = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return cached;
}
