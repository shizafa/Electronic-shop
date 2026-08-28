import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes the session cookie if it's expired — must be called to keep
  // Server Components' auth reads valid. Do not remove even though the
  // return value is unused here.
  //
  // Bounded with a timeout: this runs on every request (including the POST
  // requests behind Week Highlights / Brand Logos' lazy loading), so an
  // unbounded await here means one Supabase network blip stalls the entire
  // site — Supabase's auth client retries slow/failed fetches with backoff,
  // which turned a few seconds of bad network into 5+ minute page loads.
  // Racing it against a timeout lets the request proceed either way; the
  // getUser() call keeps running in the background and still refreshes the
  // cookie via setAll if it eventually resolves.
  const AUTH_REFRESH_TIMEOUT_MS = 5000;
  await Promise.race([
    supabase.auth.getUser().catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, AUTH_REFRESH_TIMEOUT_MS)),
  ]);

  return response;
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
