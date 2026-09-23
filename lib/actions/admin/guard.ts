import "server-only";
import { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type AdminGuardResult =
  | { ok: true; supabase: ServerSupabaseClient; userId: string }
  | { ok: false; error: string };

// Reads profiles.is_admin for a user through the caller's own RLS-scoped client. Shared by
// requireAdmin below and lib/actions/auth.ts's resolveLoginRedirect. Lives here rather than in
// that "use server" file, where any export would become a callable Server Action.
export async function isProfileAdmin(supabase: ServerSupabaseClient, userId: string): Promise<boolean> {
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();
  return profile?.is_admin ?? false;
}

// Verifies the caller is authenticated and profiles.is_admin = true. Every admin Server
// Action and admin-only read function calls this first — RLS enforces the same rule
// server-side via is_admin(auth.uid()), this just gives callers a clean early-return.
export async function requireAdmin(): Promise<AdminGuardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  if (!(await isProfileAdmin(supabase, user.id))) return { ok: false, error: "Forbidden" };

  return { ok: true, supabase, userId: user.id };
}
