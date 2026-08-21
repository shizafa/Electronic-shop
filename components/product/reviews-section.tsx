"use client";

import { useState, type FormEvent } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";

// A real review, once a reviews table exists. Empty array today — this component already
// renders a correct empty state and a real rating breakdown for whenever that data shows up.
export interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState("");

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => review.rating === stars).length;
    return { stars, count, percent: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0 };
  });

  // TODO: no reviews table exists yet — this just resets the form. Wire up to a real
  // submission once the backend for reviews is built.
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setDraftRating(0);
    setDraftComment("");
    setIsFormOpen(false);
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
              <div className="mt-1 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`size-3.5 ${index < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{t("product.reviewsComingSoon")}</p>

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
            <p className="mb-1.5 text-sm font-medium text-foreground">{t("product.yourReview")}</p>
            <Textarea
              value={draftComment}
              onChange={(event) => setDraftComment(event.target.value)}
              placeholder={t("product.reviewPlaceholder")}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={draftRating === 0}>
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
