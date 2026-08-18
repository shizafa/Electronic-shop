"use client";

import { useState, type SubmitEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { cities } from "@/data/cities";
import { t } from "@/lib/i18n";
import type { Address } from "@/types/user";

type AddressDraft = Omit<Address, "id">;

const emptyDraft: AddressDraft = {
  label: "",
  fullName: "",
  phone: "",
  city: "",
  area: "",
  addressLine: "",
  isDefault: false,
};

// AddressBook — lets a logged-in user view, add, edit, and delete saved shipping addresses
export function AddressBook() {
  const { user, updateAddresses } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<AddressDraft>(emptyDraft);

  if (!user) return null;

  const selectedCity = cities.find((city) => city.name === draft.city);
  const isFormOpen = isAdding || editingId !== null;

  function startAdding() {
    setDraft(emptyDraft);
    setIsAdding(true);
    setEditingId(null);
  }

  function startEditing(address: Address) {
    setDraft(address);
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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

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
    cancelForm();
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t("account.addresses")}</h1>
        {!isFormOpen && (
          <Button size="sm" onClick={startAdding}>
            <Plus className="size-4" />
            {t("account.addAddress")}
          </Button>
        )}
      </div>

      {user.addresses.length === 0 && !isFormOpen && (
        <p className="text-sm text-muted-foreground">{t("account.noAddresses")}</p>
      )}

      {!isFormOpen && (
        <div className="flex flex-col gap-3">
          {user.addresses.map((address) => (
            <div key={address.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{address.label}</p>
                    {address.isDefault && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        {t("account.default")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {address.fullName} · {address.phone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.addressLine}, {address.area}, {address.city}
                  </p>
                </div>

                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => startEditing(address)}
                    aria-label={t("account.editAddress")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(address.id)}
                    aria-label={t("account.deleteAddress")}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="addr-label" className="text-sm font-medium text-foreground">
              {t("account.addressLabel")}
            </label>
            <Input
              id="addr-label"
              required
              value={draft.label}
              onChange={(event) => setDraft({ ...draft, label: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="addr-fullName" className="text-sm font-medium text-foreground">
                {t("checkout.fullName")}
              </label>
              <Input
                id="addr-fullName"
                required
                value={draft.fullName}
                onChange={(event) => setDraft({ ...draft, fullName: event.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="addr-phone" className="text-sm font-medium text-foreground">
                {t("auth.phone")}
              </label>
              <Input
                id="addr-phone"
                type="tel"
                required
                value={draft.phone}
                onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{t("checkout.city")}</label>
              <Select value={draft.city} onValueChange={(city) => setDraft({ ...draft, city, area: "" })}>
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
                value={draft.area}
                onValueChange={(area) => setDraft({ ...draft, area })}
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
            <label htmlFor="addr-line" className="text-sm font-medium text-foreground">
              {t("checkout.addressLine")}
            </label>
            <Input
              id="addr-line"
              required
              value={draft.addressLine}
              onChange={(event) => setDraft({ ...draft, addressLine: event.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox
              checked={draft.isDefault}
              onCheckedChange={(checked) => setDraft({ ...draft, isDefault: checked === true })}
            />
            {t("account.setDefault")}
          </label>

          <div className="flex gap-2">
            <Button type="submit">{t("account.saveChanges")}</Button>
            <Button type="button" variant="outline" onClick={cancelForm}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}