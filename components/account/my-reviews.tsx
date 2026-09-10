"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import { deleteReview, updateReview } from "@/lib/actions/reviews";
import { t } from "@/lib/i18n";
import { getReviewsForUser } from "@/lib/reviews";
import type { UserReview } from "@/types/review";

const STATUS_BADGE_CLASS: Record<UserReview["status"], string> = {
  pending: "rbt-badge-bg-warning",
  approved: "rbt-badge-bg-green",
  rejected: "rbt-badge-bg-danger",
};

const STATUS_LABEL: Record<UserReview["status"], string> = {
  pending: "Pending review",
  approved: "Published",
  rejected: "Rejected",
};

// MyReviews — /account/reviews. Reads via lib/reviews.ts's getReviewsForUser (reviews_select_own
// RLS, added by supabase/migrations/0014_reviews_own_policies.sql — previously a user could only
// see their own reviews indirectly, once approved, on the product page). Edit/delete call the
// matching server actions in lib/actions/reviews.ts, which re-check ownership server-side and
// re-run RLS rather than trusting this component's own state. Ported to match the rest of
// /account (profile.tsx's rbt-single-info list, product-card.tsx's rbt-rating-icon-list stars),
// reusing the same Bootstrap-modal-without-Bootstrap-JS EditModal duplicated locally across this
// codebase's account/checkout/product components.
export function MyReviews() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ rating: number; title: string; body: string }>({
    rating: 5,
    title: "",
    body: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isFormOpen = editingId !== null;

  useEffect(() => {
    if (!user) return;
    let active = true;
    getReviewsForUser(user.id).then((result) => {
      if (active) {
        setReviews(result);
        setIsReviewsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!isFormOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") cancelForm();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFormOpen]);

  function startEditing(review: UserReview) {
    setDraft({ rating: review.rating, title: review.title, body: review.body });
    setError("");
    setEditingId(review.id);
  }

  function cancelForm() {
    setEditingId(null);
    setError("");
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this review?")) return;
    const result = await deleteReview(id);
    if (result.success) {
      setReviews((current) => current.filter((review) => review.id !== id));
    } else {
      window.alert(result.error);
    }
  }

  async function handleSubmit() {
    if (!editingId || !draft.title.trim() || !draft.body.trim()) return;
    setIsSubmitting(true);
    setError("");
    const result = await updateReview({
      reviewId: editingId,
      rating: draft.rating,
      title: draft.title,
      body: draft.body,
    });
    if (result.success) {
      setReviews((current) =>
        current.map((review) =>
          review.id === editingId
            ? {
                ...review,
                rating: draft.rating,
                title: draft.title.trim(),
                body: draft.body.trim(),
                status: "pending",
                reviewedAt: undefined,
              }
            : review
        )
      );
      setIsSubmitting(false);
      cancelForm();
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading || !user) {
    return (
      <div className="rbt-profile-content-area">
        <p className="b1 mb--0">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="rbt-profile-content-area">
      <div className="row row--12 mt_dec--24">
        <div className="col-12 mt--24">
          <div className="rbt-component-section-title rbt-gap--4 mb--0 p-0 border-0">
            <h2 className="rbt-title mb--0">
              <span className="rbt-text-bold">
                My reviews
              </span>
            </h2>
          </div>
        </div>
      </div>
      <hr className="mt--20 mb--16" />

      {isReviewsLoading && (
        <p className="b1 mb--0">{t("common.loading")}</p>
      )}

      {!isReviewsLoading && reviews.length === 0 && (
        <p className="b1 mb--0">
          You haven&apos;t written any reviews yet.
        </p>
      )}

      <div className="rbt-scrollable-content hide-scrollbar">
        {reviews.map((review, index) => (
          <div key={review.id}>
            {index > 0 && <hr />}
            <div className="rbt-single-info mb--24">
              <div className="rbt-single-info-header d-flex justify-content-between align-items-center mb--12 pt--4">
                <h2 className="h6 mb--0 d-flex align-items-center rbt-gap--8">
                  <Link href={`/product/${review.productSlug}`}>
                    {review.productName}
                  </Link>
                  <span className={`rbt-badge rbt-badge-border rbt-badge-small rbt-badge-rounded ${STATUS_BADGE_CLASS[review.status]}`}>
                    {STATUS_LABEL[review.status]}
                  </span>
                </h2>
                <div className="d-flex rbt-gap--8">
                  <button
                    type="button"
                    className="rbt-btn rbt-btn-sm rbt-btn-secondary"
                    onClick={() => startEditing(review)}
                    aria-label="Edit review"
                  >
                    <i className="fa-regular fa-pen-to-square mr--4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rbt-btn rbt-btn-sm rbt-bg-color-danger shadow-none"
                    onClick={() => handleDelete(review.id)}
                    aria-label="Delete review"
                  >
                    <i className="fa-regular fa-trash-can" />
                  </button>
                </div>
              </div>
              <div className="rbt-card-rating mb--8">
                <ul className="rbt-rating-icon-list">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <li key={i}>
                      <i className={i < review.rating ? "fa-solid fa-star rbt-rated-icon" : "fa-regular fa-star"} />
                    </li>
                  ))}
                </ul>
              </div>
              <p className="b1 rbt-text-medium mb--4">
                {review.title}
              </p>
              <p className="b1 mb--8">
                {review.body}
              </p>
              <p className="b4 rbt-text-color-gray-600 mb--0">
                {new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <EditModal id="reviewEditModal" title="Edit Review" isOpen={isFormOpen} onClose={cancelForm}>
        <div>
          <div className="mb-3">
            <label className="rbt-field-label">
              Rating
            </label>
            <div className="rbt-card-rating">
              <ul className="rbt-rating-icon-list">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", padding: 0 }}
                      onClick={() => setDraft({ ...draft, rating: i + 1 })}
                      aria-label={`${i + 1} star${i === 0 ? "" : "s"}`}
                    >
                      <i className={i < draft.rating ? "fa-solid fa-star rbt-rated-icon" : "fa-regular fa-star"} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="review-title" className="rbt-field-label">
              Title
              <span className="rbt-text-color-danger">*</span>
            </label>
            <input
              type="text"
              id="review-title"
              className="form-control form-control-lg"
              required
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="review-body" className="rbt-field-label">
              Review
              <span className="rbt-text-color-danger">*</span>
            </label>
            <textarea
              id="review-body"
              className="form-control form-control-lg"
              rows={4}
              required
              value={draft.body}
              onChange={(event) => setDraft({ ...draft, body: event.target.value })}
            />
          </div>
          {error && (
            <p className="rbt-text-color-danger mb--0">
              {error}
            </p>
          )}
          <div className="d-flex rbt-gap--12 mt--16">
            <button type="button" className="rbt-btn rbt-btn-sm" onClick={handleSubmit} disabled={isSubmitting}>
              Save Changes
            </button>
            <button type="button" className="rbt-btn rbt-btn-sm rbt-btn-secondary" onClick={cancelForm} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </div>
      </EditModal>
    </div>
  );
}

// Same Bootstrap-modal-without-Bootstrap-JS rebuild as profile.tsx's EditModal /
// address-book.tsx's EditModal: "show" class + inline display, a manually-rendered
// .modal-backdrop, backdrop click and Escape (handled by the parent) both close it.
function EditModal({
  id,
  title,
  isOpen,
  onClose,
  children,
}: {
  id: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <>
      {isOpen && <div className="modal-backdrop fade show" onClick={onClose} />}
      <div
        className={`rbt-default-modal modal fade has-rbt-top-folder-shape${isOpen ? " show" : ""}`}
        id={id}
        style={{ display: isOpen ? "block" : "none" }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}Label`}
        aria-hidden={!isOpen}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="rbt-folder-shape-right-portion">
              <svg xmlns="http://www.w3.org/2000/svg" width="85" height="90" viewBox="0 0 85 90" fill="none">
                <path d="M0 0H11.1844C14.5695 0 17.7971 1.42971 20.0716 3.93671L82.1927 72.4059C83.9992 74.397 84.9999 76.9893 84.9999 79.6778C84.9999 85.6547 85.0001 90 85.0001 90H0V0Z" fill="white" />
              </svg>
            </div>
            <div className="modal-header">
              <button type="button" className="rbt-round-btn rbt-modal-dis-btn" onClick={onClose} aria-label="Close">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="rbt-top-folder-shape-wrapper">
              <div className="rbt-bg-color-white rbt-content-trs-portion">
                <div className="rbt-title rbt-text-bold h5 mb--16" id={`${id}Label`}>
                  {title}
                </div>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
