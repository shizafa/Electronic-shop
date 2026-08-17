"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { GitCompare, Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";

const navLinkClass =
  "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-foreground hover:bg-muted";

export function MobileNav() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleSearchSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("nav.menu")} className="md:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-3/4 sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>{t("site.name")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("nav.searchPlaceholder")}
              className="pl-9"
            />
          </form>

          <nav className="flex flex-col gap-1">
            <SheetClose asChild>
              <Link href="/wishlist" className={navLinkClass}>
                <Heart className="size-4" /> {t("nav.wishlist")}
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href="/compare" className={navLinkClass}>
                <GitCompare className="size-4" /> {t("nav.compare")}
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href="/cart" className={navLinkClass}>
                <ShoppingCart className="size-4" /> {t("nav.cart")}
              </Link>
            </SheetClose>
          </nav>

          <div className="h-px bg-border" />

          <nav className="flex flex-col gap-1">
            {user ? (
              <>
                <SheetClose asChild>
                  <Link href="/account/profile" className={navLinkClass}>
                    <User className="size-4" /> {t("account.profile")}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/account/orders" className={navLinkClass}>
                    {t("account.orders")}
                  </Link>
                </SheetClose>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className={`${navLinkClass} text-left`}
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <SheetClose asChild>
                <Link href="/login" className={navLinkClass}>
                  <User className="size-4" /> {t("nav.login")}
                </Link>
              </SheetClose>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}