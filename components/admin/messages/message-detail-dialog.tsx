"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteContactMessage, updateContactMessageStatus } from "@/lib/actions/admin/contact";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { t } from "@/lib/i18n";
import type { ContactMessage, ContactMessageStatus } from "@/types/contact";

interface MessageDetailDialogProps {
  message: ContactMessage | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (message: ContactMessage) => void;
  onDelete: (id: string) => void;
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

export function MessageDetailDialog({ message, onOpenChange, onUpdate, onDelete }: MessageDetailDialogProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  async function toggleHandled() {
    if (!message) return;
    setIsUpdating(true);
    const nextStatus: ContactMessageStatus = message.status === "handled" ? "read" : "handled";
    const result = await updateContactMessageStatus(message.id, nextStatus);
    setIsUpdating(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    onUpdate({ ...message, status: nextStatus });
    toast.success(t("admin.messages.updated"));
  }

  async function handleDelete() {
    if (!message) return;
    const result = await deleteContactMessage(message.id);
    if (!result.success) {
      toast.error(result.error);
      setDeleteOpen(false);
      return;
    }
    toast.success(t("admin.messages.deleted"));
    onDelete(message.id);
    setDeleteOpen(false);
  }

  return (
    <>
      <Dialog open={message !== null} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          {message && (
            <>
              <DialogHeader>
                <DialogTitle>{message.subject}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{message.name}</p>
                    <p className="text-muted-foreground">{message.email}</p>
                  </div>
                  <Badge variant={STATUS_BADGE_VARIANT[message.status]}>{t(STATUS_LABEL_KEY[message.status])}</Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>

                <p className="rounded-lg border border-border bg-muted/30 p-3 whitespace-pre-wrap text-foreground">
                  {message.message}
                </p>
              </div>

              <DialogFooter className="sm:justify-between">
                <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
                  {t("admin.messages.delete")}
                </Button>
                <Button type="button" onClick={toggleHandled} disabled={isUpdating}>
                  {t(message.status === "handled" ? "admin.messages.markNew" : "admin.messages.markHandled")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("admin.messages.deleteConfirm")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("admin.messages.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
