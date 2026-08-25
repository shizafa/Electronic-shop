export type ContactMessageStatus = "new" | "read" | "handled";

// A submission from the storefront contact form, reviewed via the admin Messages inbox.
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
}
