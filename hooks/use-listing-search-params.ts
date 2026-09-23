"use client";

import { usePathname, useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SortOption } from "@/lib/filters";

// URL plumbing for the /shop and /category/[slug] listings: their filter state lives in the
// query string, so filters survive a refresh and a filtered listing can be linked to.
//
// Param names (both listings use the same ones):
//   cats   comma-separated category ids (/shop only)
//   f.<id> comma-separated selected values for one spec/variant filter field
//   brand  brand name
//   min    minimum price          max  maximum price
//   q      search box text        fast comma-separated fast-filter chip ids
//   sort   SortOption             page 1-based page number   size page size

const FIELD_PARAM_PREFIX = "f.";
const SORT_OPTIONS: SortOption[] = ["featured", "price_asc", "price_desc", "name_asc"];

// A param this hook writes: a string, a list (joined with commas) or null to drop it entirely
export type ParamValue = string | string[] | null;

// Reads a comma-separated list param
export function getListParam(searchParams: ReadonlyURLSearchParams, key: string): string[] {
  const raw = searchParams.get(key);
  if (!raw) return [];
  return raw.split(",").filter(Boolean);
}

// Collects every f.<fieldId> param into the { fieldId: values } shape applyFilters expects
export function getFieldParams(searchParams: ReadonlyURLSearchParams): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith(FIELD_PARAM_PREFIX)) continue;
    const values = value.split(",").filter(Boolean);
    if (values.length > 0) fields[key.slice(FIELD_PARAM_PREFIX.length)] = values;
  }
  return fields;
}

export function fieldParamKey(fieldId: string): string {
  return `${FIELD_PARAM_PREFIX}${fieldId}`;
}

// Falls back to the default sort for a missing or unrecognized sort param
export function getSortParam(searchParams: ReadonlyURLSearchParams): SortOption {
  const raw = searchParams.get("sort");
  return SORT_OPTIONS.find((option) => option === raw) ?? "featured";
}

// Reads a positive integer param (page, size), falling back when absent or malformed
export function getNumberParam(searchParams: ReadonlyURLSearchParams, key: string, fallback: number): number {
  const parsed = Number(searchParams.get(key));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function useListingSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  // replace, not push: filtering shouldn't stack a history entry per checkbox. scroll: false
  // keeps the viewport where it is — the listing updates in place.
  const setParams = useCallback(
    (updates: Record<string, ParamValue>) => {
      const next = new URLSearchParams(search);
      for (const [key, value] of Object.entries(updates)) {
        const serialized = Array.isArray(value) ? value.join(",") : value;
        if (!serialized) next.delete(key);
        else next.set(key, serialized);
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, search]
  );

  // Debounced writes (search box, price slider) share one timer and one pending batch, so
  // controls changed together — a price-tier checkbox sets min and max — land in a single
  // replace instead of the second overwriting the first. The flush goes through the latest
  // setParams, so it builds on the current query string rather than the one at schedule time.
  const pendingRef = useRef<Record<string, ParamValue>>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setParamsRef = useRef(setParams);
  useEffect(() => {
    setParamsRef.current = setParams;
  }, [setParams]);

  const cancelPending = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    pendingRef.current = {};
  }, []);

  // A write still pending when the listing unmounts (e.g. a product card was clicked) is
  // dropped, so it can't navigate back to the listing
  useEffect(() => cancelPending, [cancelPending]);

  const scheduleParams = useCallback(
    (updates: Record<string, ParamValue>, delayMs = 300) => {
      pendingRef.current = { ...pendingRef.current, ...updates };
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const pending = pendingRef.current;
        cancelPending();
        setParamsRef.current(pending);
      }, delayMs);
    },
    [cancelPending]
  );

  // Drops every filter param at once (the "clear all" buttons), including any pending write
  const clearParams = useCallback(() => {
    cancelPending();
    router.replace(pathname, { scroll: false });
  }, [cancelPending, pathname, router]);

  return { searchParams, setParams, scheduleParams, clearParams };
}

// Keeps a text/slider control responsive while still driving the URL: the input renders from
// local draft state on every keystroke or drag, and commit hands the value to scheduleParams,
// which writes the param once the value settles. A change to the param from elsewhere
// (back/forward, clear all) re-syncs the draft.
export function useDebouncedParam(
  value: string,
  commit: (value: string) => void
): [string, (next: string) => void] {
  const [draft, setDraft] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);

  if (previousValue !== value) {
    setPreviousValue(value);
    setDraft(value);
  }

  function update(next: string) {
    setDraft(next);
    commit(next);
  }

  return [draft, update];
}
