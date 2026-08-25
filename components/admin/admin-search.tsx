"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Package, Search, ShoppingCart, Users, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { searchAdmin, type AdminSearchResult, type AdminSearchResultType } from "@/lib/actions/admin/search";
import { t } from "@/lib/i18n";

const TYPE_ICON: Record<AdminSearchResultType, LucideIcon> = {
  product: Package,
  order: ShoppingCart,
  customer: Users,
};

const TYPE_LABEL_KEY: Record<AdminSearchResultType, string> = {
  product: "admin.search.products",
  order: "admin.search.orders",
  customer: "admin.search.customers",
};

const RESULT_TYPES: AdminSearchResultType[] = ["product", "order", "customer"];
const SEARCH_DEBOUNCE_MS = 250;

// Admin topbar command palette: opens via the search trigger button or Cmd/Ctrl+K, queries
// searchAdmin (products/orders/customers) as the admin types, and navigates on selection.
export function AdminSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Resets the query/results whenever the palette opens, whether triggered by the button's
  // onClick or the Cmd/Ctrl+K shortcut below — done here (an event handler), not in an effect
  // reacting to `open`, since synchronous setState in an effect body causes an extra render.
  function openPalette() {
    setQuery("");
    setResults([]);
    setOpen(true);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) setOpen(false);
        else openPalette();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Debounced search. The empty-query case intentionally does nothing (no setState) — the
  // JSX below already shows the "start typing" hint whenever the query is blank, regardless
  // of stale results/isSearching state, so there's nothing to synchronously clear here.
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const timeout = setTimeout(() => {
      setIsSearching(true);
      searchAdmin(trimmed).then((found) => {
        setResults(found);
        setIsSearching(false);
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  function goTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  const groups = RESULT_TYPES.map((type) => ({
    type,
    items: results.filter((result) => result.type === type),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 truncate text-start">{t("admin.search.placeholder")}</span>
        <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="top-24 max-w-lg translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg"
          showCloseButton={false}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <DialogTitle className="sr-only">{t("admin.search.placeholder")}</DialogTitle>

          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("admin.search.placeholder")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {isSearching && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {!query.trim() ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">{t("admin.search.hint")}</p>
            ) : groups.length === 0 && !isSearching ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">{t("admin.search.noResults")}</p>
            ) : (
              groups.map((group) => (
                <div key={group.type} className="mb-2 last:mb-0">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                    {t(TYPE_LABEL_KEY[group.type])}
                  </p>
                  {group.items.map((item) => {
                    const Icon = TYPE_ICON[group.type];
                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        type="button"
                        onClick={() => goTo(item.href)}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-start hover:bg-muted"
                      >
                        {item.image ? (
                          <span className="relative size-8 shrink-0 overflow-hidden rounded-md bg-muted">
                            <Image src={item.image} alt="" fill sizes="32px" className="object-cover" />
                          </span>
                        ) : (
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <Icon className="size-4" />
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
                          {item.subtitle && (
                            <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
