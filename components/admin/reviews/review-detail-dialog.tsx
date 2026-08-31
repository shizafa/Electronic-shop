"use client";

import { useState } from "react";
import { Star, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { updateReviewStatus } from "@/lib/actions/admin/reviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { t } from "@/lib/i18n";
import type { AdminReview, ReviewStatus } from "@/types/review";

interface ReviewDetailDialogProps {
  review: AdminReview | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (review: AdminReview) => void;
}

const STATUS_BADGE_VARIANT: Record<ReviewStatus, "default" | "secondary" | "outline"> = {
  pending: "default",
  approved: "secondary",
  rejected: "outline",
};

const STATUS_LABEL_KEY: Record<ReviewStatus, string> = {
  pending: "admin.reviews.statusPending",
  approved: "admin.reviews.statusApproved",
  rejected: "admin.reviews.statusRejected",
};

export function ReviewDetailDialog({ review, onOpenChange, onUpdate }: ReviewDetailDialogProps) {
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  async function applyStatus(status: "approved" | "rejected") {
    if (!review) return;
    setIsUpdating(true);
    const result = await updateReviewStatus(review.id, status);
    setIsUpdating(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    onUpdate({ ...review, status, reviewedAt: new Date().toISOString() });
    setRejectConfirmOpen(false);
    toast.success(t(status === "approved" ? "admin.reviews.approved" : "admin.reviews.rejected"));
  }

  return (
    <>
      <Dialog open={review !== null} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          {review && (
            <>
              <DialogHeader>
                <DialogTitle>{review.title}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{review.productName}</p>
                    <p className="text-muted-foreground">
                      {review.authorName}
                      {review.isVerifiedPurchase && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-status-good">
                          <ShieldCheck className="size-3.5" />
                          {t("product.verifiedPurchase")}
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge variant={STATUS_BADGE_VARIANT[review.status]}>{t(STATUS_LABEL_KEY[review.status])}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`size-4 ${index < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>

                <p className="rounded-lg border border-border bg-muted/30 p-3 whitespace-pre-wrap text-foreground">
                  {review.body}
                </p>
              </div>

              <DialogFooter>
                {review.status !== "approved" && (
                  <Button type="button" disabled={isUpdating} onClick={() => applyStatus("approved")}>
                    {t("admin.reviews.approve")}
                  </Button>
                )}
                {review.status !== "rejected" && (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isUpdating}
                    onClick={() => setRejectConfirmOpen(true)}
                  >
                    {t("admin.reviews.reject")}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectConfirmOpen} onOpenChange={setRejectConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("admin.reviews.rejectConfirm")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectConfirmOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" disabled={isUpdating} onClick={() => applyStatus("rejected")}>
              {t("admin.reviews.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
