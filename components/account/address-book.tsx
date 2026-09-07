"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AddressForm, emptyAddressFormValues, type AddressFormValues } from "@/components/checkout/address-form";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";
import type { Address } from "@/types/user";

type AddressDraft = Omit<Address, "id">;

const emptyDraft: AddressDraft = {
  label: "",
  ...emptyAddressFormValues,
  isDefault: false,
};

function toDraft(address: Address): AddressDraft {
  return { ...address };
}

// AddressBook — lets a logged-in user view, add, edit, and delete saved shipping addresses.
// Ported from its original shadcn/Tailwind build to match the rest of /account (profile.tsx's
// rbt-single-info list + rbt-btn icon buttons) and reuses checkout's own AddressForm for the
// fullName/phone/city/area/addressLine fields, so the same address form looks identical whether
// it's opened from checkout or from here. Label and "set as default" aren't part of
// AddressFormValues (checkout addresses don't have either), so they're added around it with the
// same form-control/form-check classes AddressForm itself uses. The add/edit modal is the same
// Bootstrap-modal-without-Bootstrap-JS rebuild as profile.tsx's EditModal (duplicated locally,
// same as every other modal in this codebase — quick-view.tsx, wishlist-model.tsx, compare-model.tsx).
export function AddressBook() {
  const { user, updateAddresses } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<AddressDraft>(emptyDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormOpen = isAdding || editingId !== null;

  useEffect(() => {
    if (!isFormOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") cancelForm();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFormOpen]);

  if (!user) return null;

  function startAdding() {
    setDraft(emptyDraft);
    setIsAdding(true);
    setEditingId(null);
  }

  function startEditing(address: Address) {
    setDraft(toDraft(address));
    setEditingId(address.id);
    setIsAdding(false);
  }

  function cancelForm() {
    setIsAdding(false);
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function handleDelete(addressId: string) {
    if (!user) return;
    if (!window.confirm(`${t("account.deleteAddress")}?`)) return;
    await updateAddresses(user.addresses.filter((address) => address.id !== addressId));
  }

  function handleFormValuesChange(values: AddressFormValues) {
    setDraft((current) => ({ ...current, ...values }));
  }

  // Nested <form> elements are invalid HTML (AddressForm already renders its own), so this
  // isn't wrapped in a form and there's no native required-field validation on submit — check
  // manually instead, same required fields the old plain-input version enforced via the browser.
  function isDraftValid(): boolean {
    return (
      draft.label.trim() !== "" &&
      draft.fullName.trim() !== "" &&
      draft.phone.trim() !== "" &&
      draft.city.trim() !== "" &&
      draft.area.trim() !== "" &&
      draft.addressLine.trim() !== ""
    );
  }

  async function handleSubmit() {
    if (!user || !isDraftValid()) return;
    setIsSubmitting(true);

    // reuse the existing id when editing, otherwise generate a new one — either way this is
    // just a temporary key; updateAddresses replaces all rows and the DB assigns real ids
    const id = isAdding ? `addr-${Date.now()}` : (editingId ?? `addr-${Date.now()}`);
    const newAddress: Address = { ...draft, id };

    let nextAddresses = isAdding
      ? [...user.addresses, newAddress]
      : user.addresses.map((address) => (address.id === id ? newAddress : address));

    // only one address can be default, so unset the flag on all others
    if (newAddress.isDefault) {
      nextAddresses = nextAddresses.map((address) => ({ ...address, isDefault: address.id === id }));
    }

    await updateAddresses(nextAddresses);
    setIsSubmitting(false);
    cancelForm();
  }

  return (
    <div className="rbt-profile-content-area">
      <div className="row row--12 mt_dec--24">
        <div className="col-12 mt--24">
          <div className="rbt-component-section-title rbt-gap--4 mb--0 p-0 border-0 d-flex flex-row justify-content-between align-items-center">
            <h2 className="rbt-title mb--0">
              <span className="rbt-text-bold">
                {t("account.addresses")}
              </span>
            </h2>
            <button type="button" className="rbt-btn rbt-btn-sm" onClick={startAdding}>
              <i className="fa-regular fa-plus mr--4" />
              {t("account.addAddress")}
            </button>
          </div>
        </div>
      </div>
      <hr className="mt--20 mb--16" />

      {user.addresses.length === 0 && (
        <p className="b1 mb--0">
          {t("account.noAddresses")}
        </p>
      )}

      <div className="rbt-scrollable-content hide-scrollbar">
        {user.addresses.map((address, index) => (
          <div key={address.id}>
            {index > 0 && <hr />}
            <div className="rbt-single-info mb--24">
              <div className="rbt-single-info-header d-flex justify-content-between align-items-center mb--12 pt--4">
                <h2 className="h6 mb--0 d-flex align-items-center rbt-gap--8">
                  {address.label}
                  {address.isDefault && (
                    <span className="rbt-badge rbt-badge-border rbt-badge-small rbt-badge-rounded rbt-badge-bg-green">
                      {t("account.default")}
                    </span>
                  )}
                </h2>
                <div className="d-flex rbt-gap--8">
                  <button
                    type="button"
                    className="rbt-btn rbt-btn-sm rbt-btn-secondary"
                    onClick={() => startEditing(address)}
                    aria-label={t("account.editAddress")}
                  >
                    <i className="fa-regular fa-pen-to-square mr--4" />
                    {t("account.editAddress")}
                  </button>
                  <button
                    type="button"
                    className="rbt-btn rbt-btn-sm rbt-bg-color-danger shadow-none"
                    onClick={() => handleDelete(address.id)}
                    aria-label={t("account.deleteAddress")}
                  >
                    <i className="fa-regular fa-trash-can" />
                  </button>
                </div>
              </div>
              <p className="b1 mb--8">
                {address.fullName}, {address.phone}
              </p>
              <p className="b1 mb--0">
                {address.addressLine}, {address.area}, {address.city}
              </p>
            </div>
          </div>
        ))}
      </div>

      <EditModal
        id="addressEditModal"
        title={isAdding ? t("account.addAddress") : t("account.editAddress")}
        isOpen={isFormOpen}
        onClose={cancelForm}
      >
        <div>
          <div className="mb-3">
            <label htmlFor="addr-label" className="rbt-field-label">
              {t("account.addressLabel")}
              <span className="rbt-text-color-danger">*</span>
            </label>
            <input
              type="text"
              id="addr-label"
              className="form-control form-control-lg"
              required
              value={draft.label}
              onChange={(event) => setDraft({ ...draft, label: event.target.value })}
            />
          </div>

          <AddressForm idPrefix="account-addr" values={draft} onChange={handleFormValuesChange} />

          <div className="form-check mb-4">
            <input
              type="checkbox"
              className="form-check-input"
              id="addr-default"
              checked={draft.isDefault}
              onChange={(event) => setDraft({ ...draft, isDefault: event.target.checked })}
            />
            <label className="form-check-label" htmlFor="addr-default">
              {t("account.setDefault")}
            </label>
          </div>

          <div className="d-flex rbt-gap--12">
            <button type="button" className="rbt-btn rbt-btn-sm" onClick={handleSubmit} disabled={isSubmitting}>
              {t("account.saveChanges")}
            </button>
            <button type="button" className="rbt-btn rbt-btn-sm rbt-btn-secondary" onClick={cancelForm} disabled={isSubmitting}>
              {t("common.cancel")}
            </button>
          </div>
        </div>
      </EditModal>
    </div>
  );
}

// Small centered form modal, same Bootstrap-modal-without-Bootstrap-JS rebuild as
// profile.tsx's EditModal / quick-view.tsx / wishlist-model.tsx: "show" class + inline display,
// a manually-rendered .modal-backdrop, backdrop click and Escape (handled by the parent) both close it.
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
