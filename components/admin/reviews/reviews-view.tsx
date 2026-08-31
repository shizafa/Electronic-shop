"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { bulkUpdateReviewStatus } from "@/lib/actions/admin/reviews";
import { ReviewDetailDialog } from "@/components/admin/reviews/review-detail-dialog";
import { ReviewsTable } from "@/components/admin/reviews/reviews-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/lib/i18n";
import type { AdminReview, ReviewStatus } from "@/types/review";

interface ReviewsViewProps {
  reviews: AdminReview[];
}

type StatusTab = "all" | ReviewStatus;

export function ReviewsView({ reviews: initialReviews }: ReviewsViewProps) {
  const [reviews, setReviews] = useState(initialReviews);
  // Defaults to the actionable queue rather than "all" — this page exists to work through
  // pending reviews, not to browse everything.
  const [statusTab, setStatusTab] = useState<StatusTab>("pending");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [isBulkApproving, setIsBulkApproving] = useState(false);

  const counts = useMemo(
    () => ({
      all: reviews.length,
      pending: reviews.filter((review) => review.status === "pending").length,
      approved: reviews.filter((review) => review.status === "approved").length,
      rejected: reviews.filter((review) => review.status === "rejected").length,
    }),
    [reviews]
  );

  const filteredReviews = useMemo(
    () => (statusTab === "all" ? reviews : reviews.filter((review) => review.status === statusTab)),
    [reviews, statusTab]
  );

  function updateLocalReview(updated: AdminReview) {
    setReviews((current) => current.map((review) => (review.id === updated.id ? updated : review)));
    setSelectedReview((current) => (current && current.id === updated.id ? updated : current));
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((current) =>
      current.size === filteredReviews.length && filteredReviews.length > 0
        ? new Set()
        : new Set(filteredReviews.map((review) => review.id))
    );
  }

  // Switching tabs drops the selection — avoids "N selected" quietly referring to rows that
  // just scrolled out of view under a different filter.
  function handleTabChange(value: string) {
    setStatusTab(value as StatusTab);
    setSelectedIds(new Set());
  }

  async function handleBulkApprove() {
    const ids = Array.from(selectedIds);
    setIsBulkApproving(true);
    const result = await bulkUpdateReviewStatus(ids, "approved");
    setIsBulkApproving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    const reviewedAt = new Date().toISOString();
    setReviews((current) =>
      current.map((review) => (selectedIds.has(review.id) ? { ...review, status: "approved", reviewedAt } : review))
    );
    setSelectedIds(new Set());
    toast.success(t("admin.reviews.bulkApproved"));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("admin.reviews.heading")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.reviews.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={statusTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="pending">
              {t("admin.reviews.statusPending")} ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="approved">
              {t("admin.reviews.statusApproved")} ({counts.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              {t("admin.reviews.statusRejected")} ({counts.rejected})
            </TabsTrigger>
            <TabsTrigger value="all">
              {t("admin.reviews.statusAll")} ({counts.all})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {t("admin.reviews.selectedCount").replace("{count}", String(selectedIds.size))}
            </span>
            <Button size="sm" disabled={isBulkApproving} onClick={handleBulkApprove}>
              {t("admin.reviews.bulkApprove")}
            </Button>
          </div>
        )}
      </div>

      <ReviewsTable
        reviews={filteredReviews}
        selectedIds={selectedIds}
        onToggleSelected={toggleSelected}
        onToggleSelectAll={toggleSelectAll}
        onSelect={setSelectedReview}
      />

      <ReviewDetailDialog
        review={selectedReview}
        onOpenChange={(open) => !open && setSelectedReview(null)}
        onUpdate={updateLocalReview}
      />
    </div>
  );
}
