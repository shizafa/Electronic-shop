"use server";

import { isProfileAdmin } from "@/lib/actions/admin/guard";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/safe-redirect";

// Decides where to send a user right after they sign in. Runs server-side so the destination
// is based on the DB's profiles.is_admin (an RLS-scoped read under the caller's own just-set
// session), never on client-held state — the login form calls this after auth.signInWithPassword
// succeeds, so it can't be used to route someone before they actually have a session.
export async function resolveLoginRedirect(next: string | null): Promise<string> {
  if (next) return safeRedirectPath(next);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/";

  return (await isProfileAdmin(supabase, user.id)) ? "/admin" : "/";
}
