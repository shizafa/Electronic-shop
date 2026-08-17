"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode, type SubmitEvent } from "react";
import { GitCompare, Heart, Search, ShoppingCart, User, X } from "lucide-react";
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
import { t } from "@/lib/i18n";

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
      className={`relative ${hiddenOnMobile ? "hidden sm:inline-flex" : ""}`}
    >
      <Link href={href} aria-label={label}>
        {children}
        {count > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
            {count}
          </Badge>
        )}
      </Link>
    </Button>
  );
}

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { items: compareItems } = useCompare();
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  function handleSearchSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="container-page flex h-14 items-center gap-3">
        <MobileNav />

        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          {t("site.name")}
        </Link>

        {isSearchOpen ? (
          <form
            onSubmit={handleSearchSubmit}
            className="ml-auto flex w-full max-w-[min(20rem,60vw)] items-center gap-1"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
        ) : (
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("nav.search")}
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="size-5" />
            </Button>

            <IconLink href="/wishlist" label={t("nav.wishlist")} count={wishlistItems.length}>
              <Heart className="size-5" />
            </IconLink>

            <IconLink
              href="/compare"
              label={t("nav.compare")}
              count={compareItems.length}
              hiddenOnMobile
            >
              <GitCompare className="size-5" />
            </IconLink>

            <IconLink href="/cart" label={t("nav.cart")} count={itemCount}>
              <ShoppingCart className="size-5" />
            </IconLink>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t("nav.account")}>
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
              <Button variant="ghost" size="icon" asChild>
                <Link href="/login" aria-label={t("nav.login")}>
                  <User className="size-5" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}