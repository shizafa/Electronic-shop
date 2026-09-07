"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode, type SubmitEvent } from "react";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";

// Profile — "Personal Information" panel for /account/profile, wrapped by
// app/(site)/account/layout.tsx's shell (breadcrumb + sidebar). Basic Info's date-of-birth/
// language and the sidebar's "100 bonuses" line from the pasted markup are dropped — no such
// fields exist on User yet, and showing the template's demo values would read as real user
// data (same precedent as product-card.tsx's neutral rating). Delivery Address / Alternate
// Delivery Address are populated from user.addresses (default first) rather than the pasted
// demo copy; their Edit buttons link to /account/addresses, which already has full
// add/edit/delete. Basic Info and Contact Info now open real edit modals (React-state-driven,
// same Bootstrap-modal-without-Bootstrap-JS rebuild as quick-view.tsx/wishlist-model.tsx) backed
// by useAuth().updateProfile. Password stays an inert data-bs-toggle trigger — there's no
// updateUserPassword in lib/auth.ts yet, and lib/** is off-limits to edit per project rules
// without checking first.
export function Profile() {
  const { user, updateProfile, updatePassword } = useAuth();
  const [activeModal, setActiveModal] = useState<"basic" | "contact" | "password" | null>(null);

  useEffect(() => {
    if (!activeModal) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveModal(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal]);

  if (!user) return null;

  const [primaryAddress, secondaryAddress] = [...user.addresses].sort(
    (a, b) => Number(b.isDefault) - Number(a.isDefault)
  );

  return (
    <div className="rbt-profile-content-area">
      <div className="row row--12 mt_dec--24">
        <div className="col-12 mt--24">
          <div className="rbt-component-section-title rbt-gap--4 mb--0 p-0 border-0">
            <h2 className="rbt-title mb--0">
              <span className="rbt-text-bold">
                Personal Information
              </span>
            </h2>
          </div>
        </div>
      </div>
      <hr className="mt--20 mb--16" />
      <div className="rbt-scrollable-content hide-scrollbar">
        <div className="rbt-single-info mb--24">
          <div className="rbt-single-info-header d-flex justify-content-between align-items-center mb--12 pt--4">
            <h2 className="h6 mb--0">
              Basic Info
            </h2>
            <button className="rbt-btn rbt-btn-sm rbt-btn-secondary" type="button" onClick={() => setActiveModal("basic")}>
              <i className="fa-regular fa-pen-to-square mr--4" />
              Edit
            </button>
          </div>
          <p className="b1 rbt-text-medium mb--0">
            {user.name}
          </p>
        </div>
        <hr />
        <div className="rbt-single-info mb--24">
          <div className="rbt-single-info-header d-flex justify-content-between align-items-center mb--12 pt--4">
            <h2 className="h6 mb--0">
              Contact Info
            </h2>
            <button className="rbt-btn rbt-btn-sm rbt-btn-secondary" type="button" onClick={() => setActiveModal("contact")}>
              <i className="fa-regular fa-pen-to-square mr--4" />
              Edit
            </button>
          </div>
          <p className="b1 mb--8">
            {user.email}
          </p>
          <p className="b1 mb--0">
            {user.phone}
          </p>
        </div>
        <hr />
        <div className="rbt-single-info mb--24">
          <div className="rbt-single-info-header d-flex justify-content-between align-items-center mb--12 pt--4">
            <h2 className="h6 mb--0">
              Password
            </h2>
            <button className="rbt-btn rbt-btn-sm rbt-btn-secondary" type="button" onClick={() => setActiveModal("password")}>
              <i className="fa-regular fa-pen-to-square mr--4" />
              Edit
            </button>
          </div>
          <p className="b1 mb--0">
            **********
          </p>
        </div>
        <hr />
        <div className="rbt-single-info mb--24">
          <div className="rbt-single-info-header d-flex justify-content-between align-items-center mb--12 pt--4">
            <h2 className="h6 mb--0">
              Delivery Address
            </h2>
            <Link className="rbt-btn rbt-btn-sm rbt-btn-secondary" href="/account/addresses">
              <i className="fa-regular fa-pen-to-square mr--4" />
              Edit
            </Link>
          </div>
          {primaryAddress ? (
            <>
              <p className="b1 mb--8">
                {primaryAddress.fullName}, {primaryAddress.phone}
              </p>
              <p className="b1 mb--0">
                {primaryAddress.addressLine}, {primaryAddress.area}, {primaryAddress.city}
              </p>
            </>
          ) : (
            <p className="b1 mb--0">
              {t("account.noAddresses")}
            </p>
          )}
        </div>
        <hr />
        <div className="rbt-single-info mb--24">
          <div className="rbt-single-info-header d-flex justify-content-between align-items-center mb--12 pt--4">
            <h2 className="h6 mb--0">
              Alternate Delivery Address
            </h2>
            <Link className="rbt-btn rbt-btn-sm rbt-btn-secondary" href="/account/addresses">
              <i className="fa-regular fa-pen-to-square mr--4" />
              Edit
            </Link>
          </div>
          {secondaryAddress ? (
            <>
              <p className="b1 mb--8">
                {secondaryAddress.fullName}, {secondaryAddress.phone}
              </p>
              <p className="b1 mb--0">
                {secondaryAddress.addressLine}, {secondaryAddress.area}, {secondaryAddress.city}
              </p>
            </>
          ) : (
            <p className="b1 mb--0">
              {t("account.noAddresses")}
            </p>
          )}
        </div>
        <hr />
        <div className="rbt-single-info mb--24">
          <div className="rbt-single-info-header d-flex justify-content-between align-items-center mb--12 pt--4">
            <h2 className="h6 mb--0">
              Delete Account
            </h2>
          </div>
          <p className="b1 mb--8">
            Once you delete your account, your public profile will be deactivated instantly. If you decide to restore it within 14 days, simply sign in with your email and password, and we&apos;ll provide a reactivation link.
          </p>
          <button className="rbt-btn rbt-btn-sm rbt-bg-color-danger mt--16 shadow-none" type="button">
            <i className="fa-regular fa-trash-can-slash mr--4" />
            Delete Account
          </button>
        </div>
      </div>

      <EditModal id="basicInfoEditModal" title="Edit Basic Info" isOpen={activeModal === "basic"} onClose={() => setActiveModal(null)}>
        <BasicInfoForm
          name={user.name}
          onCancel={() => setActiveModal(null)}
          onSave={async (name) => {
            const ok = await updateProfile({ name, email: user.email, phone: user.phone });
            if (ok) setActiveModal(null);
            return ok;
          }}
        />
      </EditModal>

      <EditModal id="contactInfoEditModal" title="Edit Contact Info" isOpen={activeModal === "contact"} onClose={() => setActiveModal(null)}>
        <ContactInfoForm
          email={user.email}
          phone={user.phone}
          onCancel={() => setActiveModal(null)}
          onSave={async (email, phone) => {
            const ok = await updateProfile({ name: user.name, email, phone });
            if (ok) setActiveModal(null);
            return ok;
          }}
        />
      </EditModal>

      <EditModal id="passwordEditModal" title="Edit Password" isOpen={activeModal === "password"} onClose={() => setActiveModal(null)}>
        <PasswordForm
          onCancel={() => setActiveModal(null)}
          onSave={async (currentPassword, newPassword) => {
            const ok = await updatePassword(currentPassword, newPassword);
            if (ok) setActiveModal(null);
            return ok;
          }}
        />
      </EditModal>
    </div>
  );
}

// Small centered form modal, same Bootstrap-modal-without-Bootstrap-JS rebuild as
// quick-view.tsx/wishlist-model.tsx/compare-model.tsx: "show" class + inline display, a
// manually-rendered .modal-backdrop, backdrop click and Escape (handled by the parent) both close it.
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
        <div className="modal-dialog sm-size modal-dialog-centered">
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

function BasicInfoForm({
  name,
  onCancel,
  onSave,
}: {
  name: string;
  onCancel: () => void;
  onSave: (name: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState(name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    const ok = await onSave(value);
    if (!ok) {
      setError(t("account.profileSaveFailed"));
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rbt-input-field-grp">
        <label className="rbt-field-label" htmlFor="basic_info_name">
          Full Name
          <span className="rbt-text-color-danger">*</span>
        </label>
        <input
          className="rbt-input-field"
          type="text"
          id="basic_info_name"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
        />
      </div>
      {error && (
        <p className="rbt-text-color-danger mb--0">
          {error}
        </p>
      )}
      <div className="d-flex rbt-gap--12 mt--24">
        <button type="submit" className="rbt-btn rbt-btn-sm" disabled={isSubmitting}>
          {t("account.saveChanges")}
        </button>
        <button type="button" className="rbt-btn rbt-btn-sm rbt-btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}

function ContactInfoForm({
  email,
  phone,
  onCancel,
  onSave,
}: {
  email: string;
  phone: string;
  onCancel: () => void;
  onSave: (email: string, phone: string) => Promise<boolean>;
}) {
  const [emailValue, setEmailValue] = useState(email);
  const [phoneValue, setPhoneValue] = useState(phone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    const ok = await onSave(emailValue, phoneValue);
    if (!ok) {
      setError(t("account.profileSaveFailed"));
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rbt-input-field-grp">
        <label className="rbt-field-label" htmlFor="contact_info_email">
          Email
          <span className="rbt-text-color-danger">*</span>
        </label>
        <input
          className="rbt-input-field"
          type="email"
          id="contact_info_email"
          value={emailValue}
          onChange={(event) => setEmailValue(event.target.value)}
          required
        />
      </div>
      <div className="rbt-input-field-grp">
        <label className="rbt-field-label" htmlFor="contact_info_phone">
          Phone
          <span className="rbt-text-color-danger">*</span>
        </label>
        <input
          className="rbt-input-field"
          type="tel"
          id="contact_info_phone"
          value={phoneValue}
          onChange={(event) => setPhoneValue(event.target.value)}
          required
        />
      </div>
      {error && (
        <p className="rbt-text-color-danger mb--0">
          {error}
        </p>
      )}
      <div className="d-flex rbt-gap--12 mt--24">
        <button type="submit" className="rbt-btn rbt-btn-sm" disabled={isSubmitting}>
          {t("account.saveChanges")}
        </button>
        <button type="button" className="rbt-btn rbt-btn-sm rbt-btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}

function PasswordForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (currentPassword: string, newPassword: string) => Promise<boolean>;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    const ok = await onSave(currentPassword, newPassword);
    if (!ok) {
      setError("Couldn't update your password. Check your current password and try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rbt-input-field-grp">
        <label className="rbt-field-label" htmlFor="password_current">
          Current Password
          <span className="rbt-text-color-danger">*</span>
        </label>
        <input
          className="rbt-input-field"
          type="password"
          id="password_current"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
      </div>
      <div className="rbt-input-field-grp">
        <label className="rbt-field-label" htmlFor="password_new">
          New Password
          <span className="rbt-text-color-danger">*</span>
        </label>
        <input
          className="rbt-input-field"
          type="password"
          id="password_new"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          minLength={6}
          required
        />
      </div>
      <div className="rbt-input-field-grp">
        <label className="rbt-field-label" htmlFor="password_confirm">
          Confirm New Password
          <span className="rbt-text-color-danger">*</span>
        </label>
        <input
          className="rbt-input-field"
          type="password"
          id="password_confirm"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={6}
          required
        />
      </div>
      {error && (
        <p className="rbt-text-color-danger mb--0">
          {error}
        </p>
      )}
      <div className="d-flex rbt-gap--12 mt--24">
        <button type="submit" className="rbt-btn rbt-btn-sm" disabled={isSubmitting}>
          {t("account.saveChanges")}
        </button>
        <button type="button" className="rbt-btn rbt-btn-sm rbt-btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
