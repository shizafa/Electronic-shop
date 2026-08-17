"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// AddressForm — collects a shipping/billing address, with quick-select buttons for saved addresses
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
    <div className="flex flex-col gap-4">
      {savedAddresses.length > 0 && (
        <div className="flex flex-col gap-2">
          {savedAddresses.map((address) => (
            <button
              key={address.id}
              type="button"
              onClick={() => selectSavedAddress(address)}
              className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                selectedSavedId === address.id ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <p className="font-medium text-foreground">{address.label}</p>
              <p className="text-muted-foreground">
                {address.fullName} · {address.phone}
              </p>
              <p className="text-muted-foreground">
                {address.addressLine}, {address.area}, {address.city}
              </p>
            </button>
          ))}
          <button
            type="button"
            onClick={selectNewAddress}
            className={`rounded-lg border p-3 text-left text-sm font-medium transition-colors ${
              selectedSavedId === null
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border text-muted-foreground"
            }`}
          >
            {t("checkout.useNewAddress")}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-fullName`} className="text-sm font-medium text-foreground">
            {t("checkout.fullName")}
          </label>
          <Input
            id={`${idPrefix}-fullName`}
            required
            value={values.fullName}
            onChange={(event) => onChange({ ...values, fullName: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${idPrefix}-phone`} className="text-sm font-medium text-foreground">
            {t("auth.phone")}
          </label>
          <Input
            id={`${idPrefix}-phone`}
            type="tel"
            required
            value={values.phone}
            onChange={(event) => onChange({ ...values, phone: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">{t("checkout.city")}</label>
          <Select value={values.city} onValueChange={(city) => onChange({ ...values, city, area: "" })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("checkout.selectCity")} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">{t("checkout.area")}</label>
          <Select
            value={values.area}
            onValueChange={(area) => onChange({ ...values, area })}
            disabled={!selectedCity}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("checkout.selectArea")} />
            </SelectTrigger>
            <SelectContent>
              {selectedCity?.areas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-addressLine`} className="text-sm font-medium text-foreground">
          {t("checkout.addressLine")}
        </label>
        <Input
          id={`${idPrefix}-addressLine`}
          required
          value={values.addressLine}
          onChange={(event) => onChange({ ...values, addressLine: event.target.value })}
        />
      </div>
    </div>
  );
}