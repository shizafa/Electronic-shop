"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode, type SubmitEvent } from "react";
import { GitCompare, Heart, Phone, Search, ShoppingCart, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useCompare } from "@/context/compare-context";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getVariantById } from "@/lib/products";

// IconLink — nav icon button that links to a page and shows a small count badge (e.g. cart items)
function IconLink({
  href,
  label,
  count,
  hiddenOnMobile,
  children,
}: {
  href: string;
  label: string;
  count: number;
  hiddenOnMobile?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      asChild
      className={`relative rounded-full bg-muted hover:bg-muted/70 ${hiddenOnMobile ? "hidden sm:inline-flex" : ""}`}
    >
      <Link href={href} aria-label={label}>
        {children}
        {count > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full bg-secondary px-1 text-[10px] text-secondary-foreground">
            {count}
          </Badge>
        )}
      </Link>
    </Button>
  );
}

// Header — site-wide top navigation: logo, search, wishlist/compare/cart/account links
export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { items: cartItems, itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { items: compareItems } = useCompare();
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [variantPrices, setVariantPrices] = useState<Record<string, number>>({});

  // Fetch prices only for the variants actually in the cart (small, bounded), rather than
  // pulling in the full product catalog just to show a header subtotal.
  useEffect(() => {
    const missingIds = cartItems.map((item) => item.variantId).filter((id) => !(id in variantPrices));
    if (missingIds.length === 0) return;

    let active = true;
    Promise.all(missingIds.map((id) => getVariantById(id))).then((variants) => {
      if (!active) return;
      setVariantPrices((current) => {
        const next = { ...current };
        variants.forEach((variant, index) => {
          if (variant) next[missingIds[index]] = variant.price;
        });
        return next;
      });
    });

    return () => {
      active = false;
    };
  }, [cartItems, variantPrices]);

  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + (variantPrices[item.variantId] ?? 0) * item.quantity,
    0
  );

  function handleSearchSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`); // navigate to search results page with the query
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="container-page flex h-16 items-center gap-4">
        <MobileNav />

        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
          {t("site.name")}
        </Link>

        <a
          href="tel:+021111000000"
          className="hidden shrink-0 items-center gap-2 rounded-full bg-muted px-3 py-1.5 lg:flex"
        >
          <Phone className="size-4 text-muted-foreground" />
          <span className="text-xs leading-tight">
            <span className="block text-muted-foreground">{t("contact.phone")}</span>
            <span className="block font-semibold text-foreground">021-111-000-000</span>
          </span>
        </a>

        {/* Persistent pill search bar, desktop only */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden flex-1 items-center rounded-full bg-muted pr-1 pl-4 sm:flex"
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("nav.searchPlaceholder")}
            className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button type="submit" size="icon" className="rounded-full" aria-label={t("nav.search")}>
            <Search className="size-4" />
          </Button>
        </form>

        {/* Toggled full-width search bar, mobile only */}
        {isSearchOpen && (
          <form onSubmit={handleSearchSubmit} className="ml-auto flex flex-1 items-center gap-1 sm:hidden">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("nav.searchPlaceholder")}
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("common.cancel")}
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </form>
        )}

        <div className={`ml-auto items-center gap-1 sm:ml-0 ${isSearchOpen ? "hidden sm:flex" : "flex"}`}>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-muted hover:bg-muted/70 sm:hidden"
            aria-label={t("nav.search")}
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="size-5" />
          </Button>

          <IconLink href="/wishlist" label={t("nav.wishlist")} count={wishlistItems.length}>
            <Heart className="size-5" />
          </IconLink>

          <IconLink href="/compare" label={t("nav.compare")} count={compareItems.length} hiddenOnMobile>
            <GitCompare className="size-5" />
          </IconLink>

          <Button
            variant="ghost"
            asChild
            className="h-auto gap-2 rounded-full bg-muted px-2 py-1.5 hover:bg-muted/70"
          >
            <Link href="/cart" aria-label={t("nav.cart")}>
              <span className="relative flex size-8 items-center justify-center">
                <ShoppingCart className="size-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full bg-secondary px-1 text-[10px] text-secondary-foreground">
                    {itemCount}
                  </Badge>
                )}
              </span>
              <span className="hidden text-xs leading-tight lg:inline-block">
                <span className="block text-muted-foreground">{t("nav.cart")}</span>
                <span className="block font-semibold text-foreground">{formatPrice(cartSubtotal)}</span>
              </span>
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-muted hover:bg-muted/70" aria-label={t("nav.account")}>
                  <User className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/account/profile">{t("account.profile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/orders">{t("account.orders")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/wishlist">{t("account.wishlist")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => logout()}>{t("nav.logout")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="rounded-full bg-muted hover:bg-muted/70" asChild>
              <Link href="/login" aria-label={t("nav.login")}>
                <User className="size-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}