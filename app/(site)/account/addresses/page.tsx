import type { Metadata } from "next";
import { AddressBook } from "@/components/account/address-book";
import { t } from "@/lib/i18n";

// Account pages have no server-side auth gate (layout.tsx redirects client-side), so without
// this Next.js still tries to statically prerender them at build time — which renders the
// shared header/nav and their getAllProducts() Supabase call for real, during the build. A
// slow/unreachable Supabase there fails the whole build (see the "/account/addresses" prerender
// Gateway Timeout). These routes are per-user anyway, so they should never be static.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: t("account.addresses"),
};

// /account/addresses route: renders the saved-addresses manager
export default function AccountAddressesPage() {
  return <AddressBook />;
}