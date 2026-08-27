import { Footer } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/site-header";

// Layout for every customer-facing route: adds the storefront header/footer.
// Scoped to the (site) route group so app/admin/** doesn't inherit this chrome.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* Template CSS, storefront-only: loaded here rather than in app/layout.tsx so
          app/admin/** doesn't inherit Bootstrap. Order matters — bootstrap, then icons,
          then the template stylesheet that overrides both. */}
      <link rel="stylesheet" href="/assets/css/vendor/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets/css/plugins/fontawesome-all.min.css" />
      <link rel="stylesheet" href="/assets/css/style.min.css" />
      {/* Site-only compact/gap tweaks, layered after the template stylesheet — see the
          file for why this lives here instead of editing template CSS or globals.css. */}
      <link rel="stylesheet" href="/assets/css/site-overrides.css" />
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
