Electronic Shop — a Next.js e-commerce storefront (air conditioners, TVs, mobile phones) backed by Supabase (Postgres + Auth).

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then add its credentials to `.env.local` (create the file):

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

   Find these under **Project Settings → API** in the Supabase dashboard. The service role key is server-only — never expose it to the client.

   In **Authentication → Sign In / Providers → Email**, turn off **"Confirm email"** so signup logs users in immediately.

3. **Create the database schema** — open the Supabase SQL editor, paste in the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and run it. This creates all tables, RLS policies, and helper functions/triggers.

4. **Seed the database** with the catalog, demo users, and demo orders:

   ```bash
   npm run seed
   ```

   Safe to re-run — catalog data upserts, and users/orders that already exist are skipped. The fixture data it loads lives under [`scripts/seed-data/`](scripts/seed-data/).

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

After seeding, two accounts exist for testing (password: `password123` for both):

- `ayesha.khan@example.com`
- `bilal.ahmed@example.com`

Neither is an admin. To grant admin access to your own account, run in the Supabase SQL editor:

```sql
update profiles set is_admin = true where id = '<your-user-id>';
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the project |
| `npm run seed` | Load `scripts/seed-data/` into Supabase |

## Architecture notes

- App Router (`app/`), Tailwind v4 + shadcn/radix components (`components/`).
- Data access is split across `lib/*.ts` (server-side, uses `lib/supabase/{server,public}.ts`) and a handful of `use client` modules (`lib/auth.ts`, `lib/cart.ts`, `lib/wishlist.ts`, `lib/orders.ts`, `lib/compare.ts`) that use `lib/supabase/client.ts` directly, since they're driven from React Context providers (`context/`).
- `context/product-catalog-context.tsx` caches the full product catalog client-side for the handful of routes that need synchronous product lookups without a server-rendered parent (cart, wishlist, compare, checkout) — it's mounted per-route via each of their `layout.tsx` files, not globally.
- Order placement (`lib/actions/orders.ts`) is a Server Action, not a plain client call — prices/totals are recomputed server-side from the database rather than trusted from the browser.
- Payments are not integrated — `paymentMethod`/`paymentStatus` are just persisted fields.
