@AGENTS.md

# Electronic Shop

Next.js 16 (App Router) + Supabase e-commerce store. Feature-complete.
Current phase: code quality cleanup and database hardening before a supervisor review.

## Stack

- Storefront `app/(site)/`: Unimart Bootstrap 5 template (`rbt-` classes), CSS linked in
  `app/(site)/layout.tsx`, assets in `public/assets/`, Font Awesome icons.
- Admin `app/admin/`: Tailwind v4 + shadcn/ui.
- `components/ui/` is shared shadcn used by admin. Don't restyle or edit.
- Swiper is the only carousel library. No Bootstrap JS or jQuery.
- Supabase clients in `lib/supabase/`. `admin.ts` is the service-role client.
- Migrations in `supabase/migrations/`, numbered `0001_...sql` onward.

## Architecture

- Four Supabase clients, each for a specific context: `lib/supabase/server.ts`
  (cookie-bound, per-request — opts the route into dynamic rendering),
  `lib/supabase/public.ts` (anon key, module-memoized, no cookies — public catalog
  reads from both Server and Client Components), `lib/supabase/client.ts` (browser
  client for `'use client'` code), `lib/supabase/admin.ts` (service-role, bypasses
  RLS — seed script and privileged admin ops only, never client-reachable).
- `lib/*.ts` are server-side data-access/query modules. A subset — `auth.ts`,
  `cart.ts`, `wishlist.ts`, `orders.ts`, `compare.ts` — are `'use client'` instead,
  called directly from the matching Context provider in `context/`.
  `lib/actions/` and `lib/actions/admin/` hold Server Actions (mutations).
- `context/product-catalog-context.tsx` caches the full catalog client-side for
  routes needing synchronous product lookups with no server-rendered parent (cart,
  wishlist, compare, checkout) — mounted per-route via their `layout.tsx`, not
  globally.
- `lib/actions/orders.ts`'s `placeOrder` is a Server Action: prices/totals are
  always recomputed server-side from the DB, never trusted from the client. It
  branches on payment method — Stripe card payments (`lib/stripe.ts`,
  `lib/card-payment.ts`, webhook at `app/api/stripe/webhook`) or cash on delivery
  (`lib/cod-payment.ts`), each with its own max order value.

## Working rules

- Report first, edit only after I approve. Group findings by severity, with file paths.
- Small changes, one commit per fix. Run `npm run lint` and `npm run build` after each batch.
- No redesigns, no new dependencies, no big renames. Visuals and behavior stay the same
  unless the change fixes a bug.
- Template classes come from the Bootstrap template's CSS. Don't treat them as unused,
  don't replace them with Tailwind, don't restructure template markup.
- Template assets stay plain `<img>` (ignore the no-img-element lint rule for them).
  `next/image` is only for product images, with explicit width/height, never `fill`.
- Storefront pages stay Server Components. `'use client'` only on interactive leaf
  components, never on `page.tsx` or `layout.tsx`.
- Filtering goes through searchParams + `lib/products` / `lib/filters`, not client-side.

## Database rules

- Migrations are append-only. Never edit an existing migration; add the next numbered file.
- Never run SQL against the live database. Write the migration; I apply it in the
  Supabase SQL editor.
- Every table has RLS. New tables get RLS and policies in the same migration.
  Admin checks use `is_admin(auth.uid())`.
- The service-role client is server-only. Never import it in `'use client'` files,
  never expose keys through `NEXT_PUBLIC_` vars.
- `order_items` stores snapshots with no FKs to products/variants on purpose. Don't add FKs.
- Product stock status is derived from variants. Don't add a stored stock column.
- Keep `types/` in sync with any schema change.

## Replies

- Terse. No summaries of what you did unless I ask.