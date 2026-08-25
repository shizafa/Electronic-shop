import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ContactMessage } from "@/types/contact";

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessage["status"];
  created_at: string;
}

function mapContactMessageRow(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getAllContactMessages failed", error);
    return [];
  }
  return (data ?? []).map(mapContactMessageRow);
}
