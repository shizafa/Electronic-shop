import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { t } from "@/lib/i18n";
import type { ContactMessage, ContactMessageStatus } from "@/types/contact";

interface MessagesTableProps {
  messages: ContactMessage[];
  onSelect: (message: ContactMessage) => void;
}

const STATUS_BADGE_VARIANT: Record<ContactMessageStatus, "default" | "secondary" | "outline"> = {
  new: "default",
  read: "secondary",
  handled: "outline",
};

const STATUS_LABEL_KEY: Record<ContactMessageStatus, string> = {
  new: "admin.messages.statusNew",
  read: "admin.messages.statusRead",
  handled: "admin.messages.statusHandled",
};

export function MessagesTable({ messages, onSelect }: MessagesTableProps) {
  if (messages.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.messages.noMessages")}</p>;
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.messages.status")}</TableHead>
            <TableHead>{t("admin.messages.from")}</TableHead>
            <TableHead>{t("admin.messages.subject")}</TableHead>
            <TableHead>{t("admin.messages.received")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow
              key={message.id}
              className="cursor-pointer"
              onClick={() => onSelect(message)}
            >
              <TableCell>
                <Badge variant={STATUS_BADGE_VARIANT[message.status]}>{t(STATUS_LABEL_KEY[message.status])}</Badge>
              </TableCell>
              <TableCell>
                <p className={message.status === "new" ? "font-semibold text-foreground" : "font-medium text-foreground"}>
                  {message.name}
                </p>
                <p className="text-xs text-muted-foreground">{message.email}</p>
              </TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">{message.subject}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(message.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
