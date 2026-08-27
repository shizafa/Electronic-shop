"use client";

import { useRouter } from "next/navigation";
import { useRef, type ChangeEvent, type FormEvent } from "react";
import type { Category } from "@/types/category";

// Search-with-category form from the main bar.
//
// The category select is decorative for now: neither /search nor /category/[slug] accepts
// a combined category+text query today (checked both routes — /search only reads `q`,
// /category/[slug] takes no searchParams at all), so wiring the select to real filtering
// would mean inventing a capability that doesn't exist yet rather than mapping to one.
// TODO: wire to backend once combined filtering exists
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
    const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
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
                    <select className="rbt-select-activation" data-live-search="true" data-live-search-placeholder="Search Catagories">
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
