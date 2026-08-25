import { MessagesView } from "@/components/admin/messages/messages-view";
import { getAllContactMessages } from "@/lib/admin/contact";

export default async function AdminMessagesPage() {
  const messages = await getAllContactMessages();
  return <MessagesView messages={messages} />;
}
