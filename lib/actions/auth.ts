"use server";

import { createClient } from "@/lib/supabase/server";

// Decides where to send a user right after they sign in. Runs server-side so the destination
// is based on the DB's profiles.is_admin (an RLS-scoped read under the caller's own just-set
// session), never on client-held state — the login form calls this after auth.signInWithPassword
// succeeds, so it can't be used to route someone before they actually have a session.
export async function resolveLoginRedirect(next: string | null): Promise<string> {
  if (next) return next;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/";

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  return profile?.is_admin ? "/admin" : "/";
}
