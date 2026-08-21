import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminGuardResult =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | { ok: false; error: string };

// Verifies the caller is authenticated and profiles.is_admin = true. Every admin Server
// Action and admin-only read function calls this first — RLS enforces the same rule
// server-side via is_admin(auth.uid()), this just gives callers a clean early-return.
export async function requireAdmin(): Promise<AdminGuardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { ok: false, error: "Forbidden" };

  return { ok: true, supabase, userId: user.id };
}
