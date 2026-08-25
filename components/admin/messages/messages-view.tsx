"use client";

import { useMemo, useState } from "react";
import { updateContactMessageStatus } from "@/lib/actions/admin/contact";
import { MessageDetailDialog } from "@/components/admin/messages/message-detail-dialog";
import { MessagesTable } from "@/components/admin/messages/messages-table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/lib/i18n";
import type { ContactMessage, ContactMessageStatus } from "@/types/contact";

interface MessagesViewProps {
  messages: ContactMessage[];
}

type StatusTab = "all" | ContactMessageStatus;

export function MessagesView({ messages: initialMessages }: MessagesViewProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const stats = useMemo(
    () => ({
      total: messages.length,
      new: messages.filter((message) => message.status === "new").length,
      read: messages.filter((message) => message.status === "read").length,
      handled: messages.filter((message) => message.status === "handled").length,
    }),
    [messages]
  );

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return messages.filter((message) => {
      if (statusTab !== "all" && message.status !== statusTab) return false;
      if (
        normalizedQuery &&
        !message.name.toLowerCase().includes(normalizedQuery) &&
        !message.email.toLowerCase().includes(normalizedQuery) &&
        !message.subject.toLowerCase().includes(normalizedQuery)
      )
        return false;
      return true;
    });
  }, [messages, query, statusTab]);

  function updateLocalMessage(updated: ContactMessage) {
    setMessages((current) => current.map((message) => (message.id === updated.id ? updated : message)));
    setSelected((current) => (current && current.id === updated.id ? updated : current));
  }

  // Opening a message marks it read — a normal click-handler side effect, not something
  // triggered from an effect, so there's nothing async-in-render to worry about.
  function handleSelect(message: ContactMessage) {
    setSelected(message);
    if (message.status !== "new") return;
    updateContactMessageStatus(message.id, "read").then((result) => {
      if (result.success) updateLocalMessage({ ...message, status: "read" });
    });
  }

  function handleDelete(id: string) {
    setMessages((current) => current.filter((message) => message.id !== id));
    setSelected(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("admin.messages.heading")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.messages.subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatChip labelKey="admin.messages.total" value={stats.total} dotClassName="bg-muted-foreground" />
        <StatChip labelKey="admin.messages.statusNew" value={stats.new} dotClassName="bg-chart-1" />
        <StatChip labelKey="admin.messages.statusRead" value={stats.read} dotClassName="bg-chart-3" />
        <StatChip labelKey="admin.messages.statusHandled" value={stats.handled} dotClassName="bg-status-good" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={statusTab} onValueChange={(value) => setStatusTab(value as StatusTab)}>
          <TabsList>
            <TabsTrigger value="all">
              {t("admin.messages.statusAll")} ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="new">
              {t("admin.messages.statusNew")} ({stats.new})
            </TabsTrigger>
            <TabsTrigger value="read">
              {t("admin.messages.statusRead")} ({stats.read})
            </TabsTrigger>
            <TabsTrigger value="handled">
              {t("admin.messages.statusHandled")} ({stats.handled})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("admin.messages.searchPlaceholder")}
          className="sm:max-w-xs"
        />
      </div>

      <MessagesTable messages={filteredMessages} onSelect={handleSelect} />

      <MessageDetailDialog
        message={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onUpdate={updateLocalMessage}
        onDelete={handleDelete}
      />
    </div>
  );
}

function StatChip({ labelKey, value, dotClassName }: { labelKey: string; value: number; dotClassName: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm">
      <span className={`size-1.5 rounded-full ${dotClassName}`} />
      <span className="text-muted-foreground">{t(labelKey)}</span>
      <span className="font-semibold text-foreground">{value.toLocaleString()}</span>
    </div>
  );
}
