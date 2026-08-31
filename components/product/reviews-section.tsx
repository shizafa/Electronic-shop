"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { submitReview } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";
import type { Review } from "@/types/review";

interface ReviewsSectionProps {
  productId: string;
  reviews: Review[];
}

export function ReviewsSection({ productId, reviews }: ReviewsSectionProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => review.rating === stars).length;
    return { stars, count, percent: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0 };
  });

  // reviews here is approved-only (what the storefront ever sees), so this only catches an
  // already-*approved* review — a still-pending one is caught reactively by submitReview's
  // unique-constraint error instead, since pending rows aren't visible to re-check against.
  const alreadyReviewed = user ? reviews.some((review) => review.userId === user.id) : false;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    const result = await submitReview({ productId, rating: draftRating, title: draftTitle, body: draftBody });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setDraftRating(0);
    setDraftTitle("");
    setDraftBody("");
    setIsFormOpen(false);
    setJustSubmitted(true);
    toast.success(t("product.reviewSubmitted"));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-8">
        <div className="flex flex-col items-center gap-1">
          <p className="text-4xl font-semibold text-foreground">{averageRating.toFixed(1)}</p>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`size-4 ${index < Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {reviews.length} {t("product.reviews").toLowerCase()}
          </p>
        </div>

        <div className="flex flex-1 min-w-48 flex-col gap-1.5">
          {breakdown.map(({ stars, count, percent }) => (
            <div key={stars} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-3">{stars}</span>
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
              </div>
              <span className="w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("product.reviewsEmpty")}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{review.authorName}</p>
                <p className="text-xs text-muted-foreground">{review.createdAt}</p>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`size-3.5 ${index < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                {review.isVerifiedPurchase && (
                  <span className="flex items-center gap-1 text-xs font-medium text-status-good">
                    <ShieldCheck className="size-3.5" />
                    {t("product.verifiedPurchase")}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">{review.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
            </li>
          ))}
        </ul>
      )}

      {justSubmitted && <p className="text-sm text-muted-foreground">{t("product.reviewAwaitingApproval")}</p>}

      {!user ? (
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => router.push(`/login?redirect=${pathname}`)}
        >
          {t("product.signInToReview")}
        </Button>
      ) : alreadyReviewed ? (
        <p className="text-sm text-muted-foreground">{t("product.alreadyReviewed")}</p>
      ) : isFormOpen ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">{t("product.yourRating")}</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;
                return (
                  <button key={value} type="button" onClick={() => setDraftRating(value)} aria-label={String(value)}>
                    <Star
                      className={`size-5 ${value <= draftRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">{t("product.reviewTitle")}</p>
            <Input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder={t("product.reviewTitlePlaceholder")}
              required
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">{t("product.yourReview")}</p>
            <Textarea
              value={draftBody}
              onChange={(event) => setDraftBody(event.target.value)}
              placeholder={t("product.reviewPlaceholder")}
              rows={3}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={draftRating === 0 || isSubmitting}>
              {t("product.submitReview")}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setIsFormOpen(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" className="w-fit" onClick={() => setIsFormOpen(true)}>
          {t("product.writeReview")}
        </Button>
      )}
    </div>
  );
}
