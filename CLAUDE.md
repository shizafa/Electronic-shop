<!-- @AGENTS.md

# Storefront re-skin phase

Re-skinning the STOREFRONT only with a Bootstrap 5 template (external repo,
pasted in piece by piece). The Supabase layer does not change.

## Scope — hard boundary

- In scope: app/(site)/** and the storefront feature folders under
  components/ (account, auth, cart, category, checkout, compare, contact,
  home, layout, order, product, search, shop, wishlist).
- Never touch: app/admin/**, components/admin/**, lib/**, lib/supabase/**.
  If a task seems to require changing one of these, stop and ask first.

## Stack facts (verified 2026-08-25)

- Next.js 16.3.0, App Router.
- Tailwind v4 (`tailwindcss: ^4`), preflight enabled via
  `@import "tailwindcss";` in app/globals.css. Leave globals.css as-is —
  do not disable preflight, do not add Bootstrap resets there.
- Bootstrap: not installed yet. Swiper: already installed
  (`swiper: ^14.1.0`) — this is the only carousel library. Do not add
  Bootstrap JS, jQuery, or any jQuery plugin (dropdowns, modals, carousel,
  etc.) — rebuild any Bootstrap-JS-driven interaction with React state
  (useState) instead.

## components/ui/ is shared with admin

- components/ui/ (shadcn primitives: button, dialog, table, sidebar, ...)
  is used by both the storefront and app/admin/**. Never restyle or edit
  files in components/ui/.
- Build template-derived components inside the storefront feature folders
  instead (e.g. components/product/, components/layout/), not in
  components/ui/.
- As each storefront page/component is ported to the template, drop its
  shadcn imports (components/ui/*) — the template markup replaces them,
  it doesn't wrap them.

## Where template CSS goes

- bootstrap.min.css, then the template's own stylesheet, get imported in
  app/(site)/layout.tsx — never in app/layout.tsx (the root layout, which
  app/admin/** also renders under).
- Font Awesome 7 Pro CSS is imported in app/(site)/layout.tsx alongside
  the template stylesheet. Do not swap fa-* icons for lucide-react or any
  other icon set.
- app/globals.css is unchanged by this phase.

## Server/client boundary

- Storefront pages stay Server Components. Data fetching stays in the
  page.
- Only interactive leaf components get 'use client' (carousels,
  dropdowns, quantity steppers, modals, minicart).
- Never add 'use client' to a page.tsx or layout.tsx.

## Assets

- Decorative template assets (banners, background shapes, icons, category
  thumbnails) live in public/assets/. Rewrite pasted src paths from
  ../images/x.webp (or assets/images/x.webp) to /assets/images/x.webp, and
  keep them as plain <img> — next/image changes the DOM and breaks the
  template's positioning and object-fit rules.
- Demo PRODUCT images in pasted markup are placeholders. Replace them
  with next/image pointing at the Supabase storage URL from the product
  data.
- Use explicit width and height props on next/image, matching the demo
  image's dimensions. Do not use fill — the template's image containers
  get their height from the image itself, and fill collapses them.
- Keep the template's className on the image element. Its rules
  (width:100%, object-fit, the hover transform) still apply.

## Pasted markup is verbatim

- Markup pasted in from the template is copied AS-IS: never redesign,
  restructure, reorder, or "clean up" it.
- Never invent new class names, and never replace template classes with
  Tailwind classes.
- The only allowed changes are ones React requires (className instead of
  class, self-closing tags, key props on lists, etc.) plus TypeScript
  prop types.

## Data

- Product filtering goes through searchParams + the existing lib/products
  / lib/filters query functions — never client-side array filtering of an
  already-fetched list.

## Build order

1. ProductCard
2. Header/Footer in app/(site)/layout.tsx
3. /shop
4. /product/[slug]
5. /cart

## Process

- One component per turn.
- After each component, list any className used in the new file that did
  not appear in the markup that was pasted in. -->
