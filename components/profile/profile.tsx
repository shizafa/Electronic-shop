"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";

// Profile — "Personal Information" panel for /account/profile, wrapped by
// app/(site)/account/layout.tsx's shell (breadcrumb + sidebar). Basic Info's date-of-birth/
// language and the sidebar's "100 bonuses" line from the pasted markup are dropped — no such
// fields exist on User yet, and showing the template's demo values would read as real user
// data (same precedent as product-card.tsx's neutral rating). Delivery Address / Alternate
// Delivery Address are populated from user.addresses (default first) rather than the pasted
// demo copy; their Edit buttons link to /account/addresses, which already has full
// add/edit/delete — the Basic Info/Contact Info/Password Edit buttons stay as inert
// data-bs-toggle triggers, since no matching modal was pasted for those yet.
export function Profile() {
  const { user } = useAuth();
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
            <button className="rbt-btn rbt-btn-sm rbt-btn-secondary" type="button" data-bs-toggle="modal" data-bs-target="#basicInfoEditModal">
              <i className="fa-light fa-pen-to-square mr--4" />
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
            <button className="rbt-btn rbt-btn-sm rbt-btn-secondary" type="button" data-bs-toggle="modal" data-bs-target="#contactInfoEditModal">
              <i className="fa-light fa-pen-to-square mr--4" />
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
            <button className="rbt-btn rbt-btn-sm rbt-btn-secondary" type="button" data-bs-toggle="modal" data-bs-target="#passwordEditModal">
              <i className="fa-light fa-pen-to-square mr--4" />
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
              <i className="fa-light fa-pen-to-square mr--4" />
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
              <i className="fa-light fa-pen-to-square mr--4" />
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
    </div>
  );
}
