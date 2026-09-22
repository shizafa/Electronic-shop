"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import { addPaymentMethod, deletePaymentMethod, updatePaymentMethod } from "@/lib/actions/payment-methods";
import { t } from "@/lib/i18n";
import { getPaymentMethodsForUser, type CardBrand, type PaymentMethodRecord } from "@/lib/payment-methods";

const BRAND_ICON: Record<CardBrand, string> = {
  visa: "fa-brands fa-cc-visa",
  mastercard: "fa-brands fa-cc-mastercard",
};

const BRAND_LABEL: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
};

interface CardDraft {
  brand: CardBrand;
  holder: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

const emptyDraft: CardDraft = {
  brand: "visa",
  holder: "",
  last4: "",
  expiry: "",
  isDefault: false,
};

// PaymentMethods — /account/payment-methods. Reads/writes via lib/payment-methods.ts and
// lib/actions/payment-methods.ts, backed by the payment_methods table (supabase/migrations/
// 0016_payment_methods.sql) — brand/last4/expiry/holder only, never a full card number or CVC
// (see that migration's comment: there's no payment gateway in this app, so this stays a
// saved-card-label list). Ported to match the rest of /account (profile.tsx's rbt-single-info
// list, address-book.tsx's add/edit modal), reusing the same
// Bootstrap-modal-without-Bootstrap-JS EditModal duplicated locally across this codebase's
// account/checkout/product components.
export function PaymentMethods() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [cards, setCards] = useState<PaymentMethodRecord[]>([]);
  const [isCardsLoading, setIsCardsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<CardDraft>(emptyDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isFormOpen = isAdding || editingId !== null;

  useEffect(() => {
    if (!user) return;
    let active = true;
    getPaymentMethodsForUser(user.id)
      .then((result) => {
        if (active) {
          setCards(result);
          setIsCardsLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        if (active) {
          setLoadError(true);
          setIsCardsLoading(false);
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

  function startAdding() {
    setDraft(emptyDraft);
    setError("");
    setIsAdding(true);
    setEditingId(null);
  }

  function startEditing(card: PaymentMethodRecord) {
    setDraft({ brand: card.brand, holder: card.holder, last4: card.last4, expiry: card.expiry, isDefault: card.isDefault });
    setError("");
    setEditingId(card.id);
    setIsAdding(false);
  }

  function cancelForm() {
    setIsAdding(false);
    setEditingId(null);
    setDraft(emptyDraft);
    setError("");
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this card?")) return;
    const result = await deletePaymentMethod(id);
    if (result.success) {
      setCards((current) => current.filter((card) => card.id !== id));
    } else {
      window.alert(result.error);
    }
  }

  function isDraftValid(): boolean {
    return /^\d{4}$/.test(draft.last4) && draft.expiry.trim() !== "";
  }

  function applyDefault(current: PaymentMethodRecord[], id: string): PaymentMethodRecord[] {
    return draft.isDefault ? current.map((card) => ({ ...card, isDefault: card.id === id })) : current;
  }

  async function handleSubmit() {
    if (!isDraftValid()) return;
    setIsSubmitting(true);
    setError("");

    if (isAdding) {
      const result = await addPaymentMethod(draft);
      if (result.success) {
        const newCard: PaymentMethodRecord = { ...draft, id: result.id };
        setCards((current) => [newCard, ...applyDefault(current, result.id)]);
        setIsSubmitting(false);
        cancelForm();
      } else {
        setError(result.error);
        setIsSubmitting(false);
      }
    } else if (editingId) {
      const result = await updatePaymentMethod(editingId, draft);
      if (result.success) {
        setCards((current) =>
          applyDefault(
            current.map((card) => (card.id === editingId ? { ...draft, id: editingId } : card)),
            editingId
          )
        );
        setIsSubmitting(false);
        cancelForm();
      } else {
        setError(result.error);
        setIsSubmitting(false);
      }
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
          <div className="rbt-component-section-title rbt-gap--4 mb--0 p-0 border-0 d-flex flex-row justify-content-between align-items-center">
            <h2 className="rbt-title mb--0">
              <span className="rbt-text-bold">
                Payment Methods
              </span>
            </h2>
            <button type="button" className="rbt-btn rbt-btn-sm" onClick={startAdding}>
              <i className="fa-regular fa-plus mr--4" />
              Add Card
            </button>
          </div>
        </div>
      </div>
      <hr className="mt--20 mb--16" />

      {isCardsLoading && (
        <p className="b1 mb--0">{t("common.loading")}</p>
      )}

      {!isCardsLoading && loadError && (
        <p className="b1 mb--0">{t("common.loadFailed")}</p>
      )}

      {!isCardsLoading && !loadError && cards.length === 0 && (
        <p className="b1 mb--0">
          No saved cards yet.
        </p>
      )}

      <div className="rbt-scrollable-content hide-scrollbar">
        {cards.map((card, index) => (
          <div key={card.id}>
            {index > 0 && <hr />}
            <div className="rbt-single-info mb--24">
              <div className="rbt-single-info-header d-flex justify-content-between align-items-center mb--12 pt--4">
                <h2 className="h6 mb--0 d-flex align-items-center rbt-gap--8">
                  <i className={`${BRAND_ICON[card.brand]} mr--4`} />
                  {BRAND_LABEL[card.brand]} •••• {card.last4}
                  {card.isDefault && (
                    <span className="rbt-badge rbt-badge-border rbt-badge-small rbt-badge-rounded rbt-badge-bg-green">
                      Default
                    </span>
                  )}
                </h2>
                <div className="d-flex rbt-gap--8">
                  <button
                    type="button"
                    className="rbt-btn rbt-btn-sm rbt-btn-secondary"
                    onClick={() => startEditing(card)}
                    aria-label="Edit card"
                  >
                    <i className="fa-regular fa-pen-to-square mr--4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rbt-btn rbt-btn-sm rbt-bg-color-danger shadow-none"
                    onClick={() => handleDelete(card.id)}
                    aria-label="Remove card"
                  >
                    <i className="fa-regular fa-trash-can" />
                  </button>
                </div>
              </div>
              <p className="b1 mb--0">
                {card.holder || "Card holder"}, expires {card.expiry}
              </p>
            </div>
          </div>
        ))}
      </div>

      <EditModal
        id="paymentMethodEditModal"
        title={isAdding ? "Add Card" : "Edit Card"}
        isOpen={isFormOpen}
        onClose={cancelForm}
      >
        <div>
          <div className="mb-3">
            <label htmlFor="card-brand" className="rbt-field-label">
              Card Type
            </label>
            <select
              id="card-brand"
              className="form-control form-control-lg"
              value={draft.brand}
              onChange={(event) => setDraft({ ...draft, brand: event.target.value as CardBrand })}
            >
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="card-holder" className="rbt-field-label">
              Card Holder
            </label>
            <input
              type="text"
              id="card-holder"
              className="form-control form-control-lg"
              value={draft.holder}
              onChange={(event) => setDraft({ ...draft, holder: event.target.value })}
            />
          </div>
          <div className="row row-cols-1 rbt-form-area row-cols-sm-2 g-3 g-sm-4">
            <div className="col">
              <label htmlFor="card-last4" className="rbt-field-label">
                Last 4 Digits
                <span className="rbt-text-color-danger">*</span>
              </label>
              <input
                type="text"
                id="card-last4"
                className="form-control form-control-lg"
                inputMode="numeric"
                maxLength={4}
                required
                value={draft.last4}
                onChange={(event) => setDraft({ ...draft, last4: event.target.value.replace(/\D/g, "") })}
              />
            </div>
            <div className="col">
              <label htmlFor="card-expiry" className="rbt-field-label">
                Expiry (MM/YY)
                <span className="rbt-text-color-danger">*</span>
              </label>
              <input
                type="text"
                id="card-expiry"
                className="form-control form-control-lg"
                placeholder="MM/YY"
                required
                value={draft.expiry}
                onChange={(event) => setDraft({ ...draft, expiry: event.target.value })}
              />
            </div>
          </div>
          <div className="form-check mb-4 mt--16">
            <input
              type="checkbox"
              className="form-check-input"
              id="card-default"
              checked={draft.isDefault}
              onChange={(event) => setDraft({ ...draft, isDefault: event.target.checked })}
            />
            <label className="form-check-label" htmlFor="card-default">
              Set as default
            </label>
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
