"use client";

import { useRouter } from "next/navigation";
import { useRef, type ChangeEvent, type FormEvent } from "react";
import type { Category } from "@/types/category";

// Search-with-category form from the main bar.
//
// Submitting runs the query against /search, scoped to whichever category is selected
// (searchProducts in lib/products.ts filters by category_id when one is passed; /search's
// page.tsx resolves the "category" slug param to an id via getCategoryBySlug).
//
// The input is uncontrolled (read via FormData on submit) rather than useState, since
// nothing else in the component needs the query value as it's typed.
//
// The rotating "Search for something..." text (.cd-headline) is a decorative-placeholder
// plugin from the template (CodyHouse-style headline rotator) with no rotation JS wired up
// per CLAUDE.md's no-jQuery-plugins rule, and it's a sibling overlay rather than a real
// placeholder, so it doesn't natively hide once typed text sits underneath it. headlineRef
// + onChange hide it imperatively (toggling the real Bootstrap "d-none" utility class)
// instead of a rotation behavior we're not rebuilding.
export function MainBarSearch({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const headlineRef = useRef<HTMLSpanElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();
    const category = String(formData.get("category") ?? "all");
    if (query) {
      const params = new URLSearchParams({ q: query });
      if (category !== "all") params.set("category", category);
      router.push(`/search?${params.toString()}`);
    }
  }

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    headlineRef.current?.classList.toggle("d-none", event.currentTarget.value.length > 0);
  }

  return (
          <div className="rbt-search-with-category uni-header-swc-one">
            <form onSubmit={handleSubmit}>
              <div className="rbt-inner-search-field border-0">
                <div className="rbt-search-input-section has-left-catagory-section rbt-inner-search-label-animate-activation">
                  <div className="filter-select rbt-modern-select search-by-category">
                    <i className="fa-regular fa-chevron-down search-by-category-caret" />
                    <select className="rbt-select-activation" name="category" data-live-search="true" data-live-search-placeholder="Search Catagories">
                      <option value="all">
                        All Categories
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input type="text" name="q" onChange={handleQueryChange} />
                  <span className="cd-headline clip is-full-width" ref={headlineRef}>
                    <span className="cd-words-wrapper">
                      <b className="is-visible">
                        Search for something...
                      </b>
                      <b className="is-hidden">
                        Looking for something specific?
                      </b>
                      <b className="is-hidden">
                        Explore what you need...
                      </b>
                    </span>
                  </span>
                </div>
                <button className="rbt-round-btn search-btn rbt-bg-color-primary" type="submit" aria-label="Search">
                  <i className="fa-sharp fa-solid fa-magnifying-glass" />
                </button>
              </div>
            </form>
          </div>
  );
}
