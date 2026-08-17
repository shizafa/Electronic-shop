import type { Metadata } from "next";
import { AddressBook } from "@/components/account/address-book";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("account.addresses"),
};

export default function AccountAddressesPage() {
  return <AddressBook />;
}