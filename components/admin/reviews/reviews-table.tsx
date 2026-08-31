import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { t } from "@/lib/i18n";
import type { AdminReview, ReviewStatus } from "@/types/review";

interface ReviewsTableProps {
  reviews: AdminReview[];
  selectedIds: Set<string>;
  onToggleSelected: (id: string) => void;
  onToggleSelectAll: () => void;
  onSelect: (review: AdminReview) => void;
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

function excerpt(body: string, length = 80): string {
  return body.length > length ? `${body.slice(0, length).trimEnd()}…` : body;
}

export function ReviewsTable({ reviews, selectedIds, onToggleSelected, onToggleSelectAll, onSelect }: ReviewsTableProps) {
  if (reviews.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.reviews.noReviews")}</p>;
  }

  const allSelected = reviews.every((review) => selectedIds.has(review.id));

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleSelectAll}
                aria-label={t("admin.reviews.selectAll")}
              />
            </TableHead>
            <TableHead>{t("admin.reviews.product")}</TableHead>
            <TableHead>{t("admin.reviews.rating")}</TableHead>
            <TableHead>{t("admin.reviews.customer")}</TableHead>
            <TableHead>{t("admin.reviews.review")}</TableHead>
            <TableHead>{t("admin.reviews.status")}</TableHead>
            <TableHead>{t("admin.reviews.date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id} className="cursor-pointer" onClick={() => onSelect(review)}>
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(review.id)}
                  onCheckedChange={() => onToggleSelected(review.id)}
                  aria-label={t("admin.reviews.selectRow")}
                />
              </TableCell>
              <TableCell className="max-w-40 truncate font-medium text-foreground">{review.productName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`size-3.5 ${index < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{review.authorName}</TableCell>
              <TableCell className="max-w-xs">
                <p className="truncate font-medium text-foreground">{review.title}</p>
                <p className="truncate text-xs text-muted-foreground">{excerpt(review.body)}</p>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE_VARIANT[review.status]}>{t(STATUS_LABEL_KEY[review.status])}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
