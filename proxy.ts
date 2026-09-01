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

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  // Refreshes the session cookie if it's expired — must be called to keep
  // Server Components' auth reads valid. Do not remove even though the
  // return value is unused on non-admin routes.
  //
  // Bounded with a timeout on everything except /admin/*: this runs on every
  // request (including the POST requests behind Week Highlights / Brand
  // Logos' lazy loading), so an unbounded await here means one Supabase
  // network blip stalls the entire site — Supabase's auth client retries
  // slow/failed fetches with backoff, which turned a few seconds of bad
  // network into 5+ minute page loads. Racing it against a timeout lets the
  // request proceed either way; the getUser() call keeps running in the
  // background and still refreshes the cookie via setAll if it eventually
  // resolves.
  //
  // /admin/* can't take that shortcut — this is the real access-control
  // check (the useEffect redirect in app/admin/layout.tsx is convenience
  // only, since it only runs after the client has already received the
  // page), so it has to wait for the actual getUser() result.
  const AUTH_REFRESH_TIMEOUT_MS = 5000;
  const noUser = { data: { user: null } } as const;
  const { data } = isAdminRoute
    ? await supabase.auth.getUser().catch(() => noUser)
    : await Promise.race([
        supabase.auth.getUser().catch(() => noUser),
        new Promise<typeof noUser>((resolve) => setTimeout(() => resolve(noUser), AUTH_REFRESH_TIMEOUT_MS)),
      ]);

  if (isAdminRoute) {
    let redirectTo: URL | null = null;

    if (!data.user) {
      redirectTo = new URL("/login", request.url);
      redirectTo.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    } else {
      // Same profiles.is_admin read RLS lets any signed-in user do for their own row
      // (see lib/actions/admin/guard.ts's requireAdmin, used by every admin Server Action).
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).single();
      if (!profile?.is_admin) redirectTo = new URL("/", request.url);
    }

    if (redirectTo) {
      const redirectResponse = NextResponse.redirect(redirectTo);
      response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
