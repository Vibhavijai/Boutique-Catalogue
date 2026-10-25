# Premium Boutique Catalogue — React + Supabase + Cloudflare Pages

Responsive clothing catalogue with Men/Women pages, category filtering, search, sorting, INR prices, WhatsApp enquiries and private admin panel for product/photo management.

The storefront previews as **Zeya** and uses the sample WhatsApp number `919876543210`. Replace it with your own number before publishing. The five supplied shirt photos appear under Men → Shirts. Light and dark themes are both available and the choice is remembered.

## Included

- React + Vite + React Router
- Supabase Postgres, Authentication and Storage
- Cloudflare Pages static hosting
- Default categories: Men → Shirts, T-Shirts, Pants; Women → Sarees, Kurtis, Western Wear
- Admin: create/edit/delete products, upload photos, set availability and homepage featured products
- Demo products appear before Supabase is configured.

## 1. Create Supabase backend

1. Go to https://supabase.com/ and create a project on the Free plan.
2. Open `supabase-schema.sql`. Replace every `admin@example.com` with the exact email you will use for admin login.
3. In Supabase, open SQL Editor → New query. Paste the entire SQL and Run it.
4. Open Project Settings → API (or API Keys). Copy the Project URL and the browser-safe anon/publishable key.
5. Open Authentication → Users and create an admin user with that exact email and a strong password. The suggested example is `admin@store.com` / `Admin@123`; create it here yourself and change the password before publishing. Disable public sign-ups if you don't need them.
6. The SQL creates the products table, row-level security policies and a public bucket for catalogue photos. Public product photos are meant to be viewable by customers.

## 2. Configure locally

Install Node.js LTS from https://nodejs.org/.
Copy `.env.example` to `.env.local`, then set:

- `VITE_SUPABASE_URL`: your project URL
- `VITE_SUPABASE_ANON_KEY`: your anon/publishable browser key
- `VITE_SHOP_NAME`: shop/brand name
- `VITE_SHOP_TAGLINE`: short brand line
- `VITE_WHATSAPP_NUMBER`: country code + number, digits only; India example `919876543210`
- `VITE_SHOP_ADDRESS`: your store address or area
- `VITE_CURRENCY=INR`

Never use a `service_role` or secret key in frontend code. Variables prefixed with `VITE_` are included in the browser bundle, so they must not contain secrets.

From the project folder, run:

```bash
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`.

- Storefront: `/`
- Men: `/collection/men`
- Women: `/collection/women`
- Admin login: `/admin/login`
- Admin dashboard: `/admin`

Test adding a product and ensure it appears on the storefront. Before deployment run `npm run build`.

## 3. Push to GitHub

1. Create a repository at https://github.com/new.
2. Upload all project files/folders to repository root.
3. Do NOT upload `.env.local`; `.gitignore` excludes it.
4. Or use Git commands:

```bash
git init
git add .
git commit -m "Create premium boutique catalogue"
git branch -M main
git remote add origin https://github.com/Vibhavijai/zeya.git
git push -u origin main
```

## 4. Deploy to Cloudflare Pages (free tier)

1. Sign in at https://dash.cloudflare.com/.
2. Go to Workers & Pages → Create application → Pages → Connect to Git (labels may vary).
3. Connect GitHub and select your repository.
4. Build settings:
   - Framework preset: Vite
   - Production branch: `main`
   - Build command: `npm run build`
   - Build output directory: `dist`
5. In your Cloudflare Worker project, add the same `VITE_` variables from `.env.local` as build-time environment variables before deploying, so the production bundle uses your Supabase project and Zeya storefront settings.
6. Deploy. Cloudflare gives you a public `*.pages.dev` URL. If you change environment variables later, trigger a new deployment because Vite reads them at build time.
7. Test `/`, `/collection/men`, `/collection/women`, `/admin/login`. Sign in and test add/edit/hide/delete.

## Deploy as a Cloudflare Worker

The `wrangler.jsonc` configuration serves the Vite build as Worker static assets and enables SPA fallback for React Router routes. Its compatibility date must not be later than the current date.

1. Use Node.js 22 or newer, then install project dependencies with `npm install`.
2. Authenticate with `npx wrangler login`.
3. Set the `VITE_` environment variables for the production build, then run `npm run deploy` to build and publish the Worker.
4. Use `npm run worker:dev` to test the Worker locally after building.

Official guides:

- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite-site/

## 5. Updating collections

Use your deployed site `/admin/login`. Add one or more product photos, title, price, collection, category, size measurements in centimetres, colours and description. Product photos can be swiped in the storefront, and customers can tap a size to flip it and view its measurement. Select whether it is available and/or featured. Saving updates Supabase immediately; you do not redeploy for product data changes.

Before deploying the multi-photo and size-chart update, run `supabase-schema.sql` again in the Supabase SQL Editor. It adds the new JSON columns and carries existing single-photo products forward without removing their current data.

To add new category labels, update `cats` in `src/App.jsx` (collection filters) and `catOptions` in `src/App.jsx` (admin options), then push the code update to GitHub to redeploy.

## Security and limits

- Never commit `.env.local` or any service-role/secret key.
- The browser-safe anon/publishable key is expected to be public; security depends on correct RLS policies.
- SQL policies restrict product writes and image uploads to the configured admin email.
- Product images are public by design; do not upload private/customer images.
- Supabase free tier has quotas and may pause inactive projects; check current plan limits for your usage. This is a catalogue and WhatsApp enquiry site, not checkout/payment processing.
