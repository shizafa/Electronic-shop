"use server";

import { createClient } from "@/lib/supabase/server";

export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactActionResult = { success: true } | { success: false; error: string };

// Public submission — the /contact page isn't login-gated, so this doesn't check for an
// authenticated user. RLS (contact_messages_public_insert) is what actually allows the
// insert; this action's only job is running it server-side.
export async function submitContactMessage(input: ContactFormInput): Promise<ContactActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("contact_messages").insert({
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
  });

  if (error) {
    console.error("submitContactMessage failed", error);
    return { success: false, error: "Failed to send your message. Please try again." };
  }
  return { success: true };
}
