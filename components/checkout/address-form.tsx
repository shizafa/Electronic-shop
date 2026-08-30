"use client";

import { useEffect, useState } from "react";
import { cities } from "@/data/cities";
import { t } from "@/lib/i18n";
import type { Address } from "@/types/user";

export interface AddressFormValues {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  addressLine: string;
}

export const emptyAddressFormValues: AddressFormValues = {
  fullName: "",
  phone: "",
  city: "",
  area: "",
  addressLine: "",
};

function toFormValues(address: Address): AddressFormValues {
  return {
    fullName: address.fullName,
    phone: address.phone,
    city: address.city,
    area: address.area,
    addressLine: address.addressLine,
  };
}

interface AddressFormProps {
  idPrefix: string;
  values: AddressFormValues;
  onChange: (values: AddressFormValues) => void;
  savedAddresses?: Address[];
}

// AddressForm — collects a shipping/billing address (shipping.tsx's form fields, titled "Shipping
// Options" in the template but structurally the real address form). Reconciled against the real
// AddressFormValues model: First name/Last name are combined into one Full Name field (matching
// the single-name-field precedent from login/signup), Email is dropped (addresses don't carry an
// email — the account's own email is captured at signup, not per-address), and Postcode is dropped
// (no postcode-based feature exists in the app, same reasoning as checkout-flow.tsx's inert
// postcode field). A City-dependent Area select is added since the real model requires one and the
// template has no equivalent field for it. City/Area use plain <select> instead of the template's
// bootstrap-select live-search (that needs Bootstrap JS, which isn't loaded) — a native select
// needs no JS plugin at all. The "Same as delivery address" checkbox is NOT reproduced here even
// though the template nests it inside this form: this component is reused to render the billing
// form too, so that decision has to live one level up, in checkout-flow.tsx.
// The saved-addresses quick-select has no template equivalent (the template has no accounts
// feature) — built from the same radio-accordion list treatment used elsewhere in this checkout
// (installation-scheduler.tsx's shipping-method list).
export function AddressForm({ idPrefix, values, onChange, savedAddresses = [] }: AddressFormProps) {
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);

  function selectSavedAddress(address: Address) {
    setSelectedSavedId(address.id);
    onChange(toFormValues(address));
  }

  function selectNewAddress() {
    setSelectedSavedId(null);
    onChange(emptyAddressFormValues);
  }

  // on first mount, auto-fill the form with the account's default saved address (or the first one)
  useEffect(() => {
    if (savedAddresses.length === 0) return;
    const defaultAddress = savedAddresses.find((address) => address.isDefault) ?? savedAddresses[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-fills the form with the account's default address on first mount only
    selectSavedAddress(defaultAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally runs once on mount
  }, []);

  const selectedCity = cities.find((city) => city.name === values.city);

  return (
    <div>
      {savedAddresses.length > 0 && (
        <div className="rbt-shipping-method mb-lg-4" role="list">
          {savedAddresses.map((address) => (
            <div className="rbt-single-shipping-method rbt-radio-accordion border-bottom" key={address.id}>
              <div className="form-check mb-0" role="listitem">
                <label className="form-check-label d-flex align-items-center py-3">
                  <input
                    type="radio"
                    className="rbt-form-check-input me-2 me-sm-3"
                    name={`${idPrefix}-saved-address`}
                    checked={selectedSavedId === address.id}
                    onChange={() => selectSavedAddress(address)}
                  />
                  <span>
                    <span className="d-block fw-semibold">
                      {address.label}
                    </span>
                    <span className="d-block fs-sm text-body-secondary">
                      {address.fullName} · {address.phone}
                      <br />
                      {address.addressLine}, {address.area}, {address.city}
                    </span>
                  </span>
                </label>
              </div>
            </div>
          ))}
          <div className="rbt-single-shipping-method rbt-radio-accordion border-bottom">
            <div className="form-check mb-0" role="listitem">
              <label className="form-check-label d-flex align-items-center py-3">
                <input
                  type="radio"
                  className="rbt-form-check-input me-2 me-sm-3"
                  name={`${idPrefix}-saved-address`}
                  checked={selectedSavedId === null}
                  onChange={selectNewAddress}
                />
                {t("checkout.useNewAddress")}
              </label>
            </div>
          </div>
        </div>
      )}

      <form className="needs-validation d-block" onSubmit={(event) => event.preventDefault()}>
        <div className="row row-cols-1 row-cols-sm-2 g-3 g-sm-4 mb-4">
          <div className="col">
            <label htmlFor={`${idPrefix}-fullName`} className="rbt-field-label">
              {t("checkout.fullName")}
              <span className="rbt-text-color-danger">
                *
              </span>
            </label>
            <input
              type="text"
              className="form-control form-control-lg"
              id={`${idPrefix}-fullName`}
              placeholder="e.g. Ahmed Khan"
              required
              value={values.fullName}
              onChange={(event) => onChange({ ...values, fullName: event.target.value })}
            />
          </div>
          <div className="col">
            <label htmlFor={`${idPrefix}-phone`} className="rbt-field-label">
              {t("auth.phone")}
              <span className="rbt-text-color-danger">
                *
              </span>
            </label>
            <input
              type="tel"
              className="form-control form-control-lg"
              id={`${idPrefix}-phone`}
              placeholder="e.g. 0300 1234567"
              required
              value={values.phone}
              onChange={(event) => onChange({ ...values, phone: event.target.value })}
            />
          </div>
          <div className="col">
            <label htmlFor={`${idPrefix}-city`} className="rbt-field-label">
              {t("checkout.city")}
              <span className="rbt-text-color-danger">
                *
              </span>
            </label>
            <select
              id={`${idPrefix}-city`}
              className="form-control form-control-lg"
              required
              value={values.city}
              onChange={(event) => onChange({ ...values, city: event.target.value, area: "" })}
            >
              <option value="">
                {t("checkout.selectCity")}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col">
            <label htmlFor={`${idPrefix}-area`} className="rbt-field-label">
              {t("checkout.area")}
              <span className="rbt-text-color-danger">
                *
              </span>
            </label>
            <select
              id={`${idPrefix}-area`}
              className="form-control form-control-lg"
              required
              disabled={!selectedCity}
              value={values.area}
              onChange={(event) => onChange({ ...values, area: event.target.value })}
            >
              <option value="">
                {t("checkout.selectArea")}
              </option>
              {selectedCity?.areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor={`${idPrefix}-addressLine`} className="rbt-field-label">
            {t("checkout.addressLine")}
            <span className="rbt-text-color-danger">
              *
            </span>
          </label>
          <input
            type="text"
            className="form-control form-control-lg"
            id={`${idPrefix}-addressLine`}
            placeholder="House #, Street, Area landmark"
            required
            value={values.addressLine}
            onChange={(event) => onChange({ ...values, addressLine: event.target.value })}
          />
        </div>
      </form>
    </div>
  );
}
