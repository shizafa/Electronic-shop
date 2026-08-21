import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { NavBar } from "@/components/layout/nav-bar";

// Layout for every customer-facing route: adds the storefront header/nav/footer.
// Scoped to the (site) route group so app/admin/** doesn't inherit this chrome.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <NavBar />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
