import type { Metadata } from "next";
import { CompareView } from "@/components/compare/compare-view";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("nav.compare"),
};

// /compare route: renders the product comparison view
export default function ComparePage() {
  return (
    <div className="container-page py-8">
      <CompareView />
    </div>
  );
}