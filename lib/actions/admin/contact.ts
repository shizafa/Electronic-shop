"use server";

import { requireAdmin } from "@/lib/actions/admin/guard";
import type { ContactMessageStatus } from "@/types/contact";

export type ContactAdminActionResult = { success: true } | { success: false; error: string };

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus
): Promise<ContactAdminActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from("contact_messages").update({ status }).eq("id", id);
  if (error) return { success: false, error: "Failed to update message" };
  return { success: true };
}

export async function deleteContactMessage(id: string): Promise<ContactAdminActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { success: false, error: "Failed to delete message" };
  return { success: true };
}
