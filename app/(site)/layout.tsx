import { CartSideNav } from "@/components/cart/cart-side-nav";
import { CompareModal } from "@/components/compare/compare-model";
import { Footer } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/site-header";
import { QuickViewModal } from "@/components/quick-view/quick-view";
import { WishlistModal } from "@/components/wishlist/wishlist-model";

// Layout for every customer-facing route: adds the storefront header/footer.
// Scoped to the (site) route group so app/admin/** doesn't inherit this chrome.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* style.min.css sets --font-primary: "Cabin", sans-serif (and uses it on nearly every
          rule) but never loads the actual webfont — it was silently falling back to the
          browser's default sans-serif. Loaded first so it's ready before the template CSS
          paints. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400..700;1,400..700&display=swap"
      />
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
      <CartSideNav />
      <WishlistModal />
      <CompareModal />
      <QuickViewModal />
    </>
  );
}
