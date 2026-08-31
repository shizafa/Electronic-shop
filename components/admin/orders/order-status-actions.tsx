"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatus } from "@/lib/actions/admin/orders";
import { getOrderStatusActions } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import type { Order, OrderStatus } from "@/types/order";

interface OrderStatusActionsProps {
  order: Order;
}

type ConfirmState = { open: false } | { open: true; status: OrderStatus; title: string; confirmLabel: string };

// Status control for the admin order detail page. The forward "advance" action needs no
// confirmation; cancel/return go through a shared confirm dialog (same Dialog + useState
// pattern as CategoryForm's delete flow) with an optional note.
export function OrderStatusActions({ order }: OrderStatusActionsProps) {
  const router = useRouter();
  const actions = getOrderStatusActions(order);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false });
  const [note, setNote] = useState("");

  async function applyStatus(status: OrderStatus, noteValue?: string) {
    setIsSubmitting(true);
    const result = await updateOrderStatus(order.id, status, noteValue);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(t("admin.orders.statusUpdated"));
    setConfirmState({ open: false });
    setNote("");
    router.refresh();
  }

  function openConfirm(status: OrderStatus, title: string, confirmLabel: string) {
    setNote("");
    setConfirmState({ open: true, status, title, confirmLabel });
  }

  if (!actions.nextStatus && !actions.canCancel && !actions.canRequestReturn && !actions.canMarkReturned) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.nextStatus && (
        <Button disabled={isSubmitting} onClick={() => applyStatus(actions.nextStatus!)}>
          {t("admin.orders.markAs").replace("{status}", t(`orderStatus.${actions.nextStatus}`))}
        </Button>
      )}
      {actions.canRequestReturn && (
        <Button
          variant="outline"
          disabled={isSubmitting}
          onClick={() =>
            openConfirm("return_requested", t("admin.orders.requestReturnConfirm"), t("admin.orders.requestReturn"))
          }
        >
          {t("admin.orders.requestReturn")}
        </Button>
      )}
      {actions.canMarkReturned && (
        <Button
          variant="outline"
          disabled={isSubmitting}
          onClick={() =>
            openConfirm("returned_refunded", t("admin.orders.markReturnedConfirm"), t("admin.orders.markReturned"))
          }
        >
          {t("admin.orders.markReturned")}
        </Button>
      )}
      {actions.canCancel && (
        <Button
          variant="destructive"
          disabled={isSubmitting}
          onClick={() => openConfirm("cancelled", t("admin.orders.cancelOrderConfirm"), t("admin.orders.cancelOrder"))}
        >
          {t("admin.orders.cancelOrder")}
        </Button>
      )}

      <Dialog open={confirmState.open} onOpenChange={(open) => !open && setConfirmState({ open: false })}>
        <DialogContent className="sm:max-w-sm">
          {confirmState.open && (
            <>
              <DialogHeader>
                <DialogTitle>{confirmState.title}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="status-change-note">{t("admin.orders.noteOptional")}</Label>
                <Textarea id="status-change-note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmState({ open: false })}>
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={() => applyStatus(confirmState.status, note)}
                >
                  {confirmState.confirmLabel}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
