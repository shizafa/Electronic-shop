import type { Metadata } from "next";
import { AddressBook } from "@/components/account/address-book";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("account.addresses"),
};

// /account/addresses route: renders the saved-addresses manager
export default function AccountAddressesPage() {
  return <AddressBook />;
}