# Lumerie Éclat — Frontend

Next.js 14 (App Router, JavaScript) storefront + admin dashboard for the
Lumerie Éclat backend. Design tokens (colors, type) are pulled directly
from the brand mood board and Stitch mockups you provided — Libre Caslon
Text for display type, Manrope for body text, and a light "Blush/Soft" /
dark "Midnight/Gold" theme pair with the crown mark as the signature motif.

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local if your Django backend isn't at http://127.0.0.1:8000
npm run dev
```

Make sure the Django backend is running first, and that its
`CORS_ALLOWED_ORIGINS` includes `http://localhost:3000` (it does by
default — see the backend's `.env.example`).

Visit `http://localhost:3000`. Toggle light/dark with the sun/moon icon
in the top nav — your choice is remembered.

## Pages

| Route | Description |
|---|---|
| `/` | Landing — hero, shop-by-category, signature pieces |
| `/shop` | Product grid — search, category, sub-category filters |
| `/product/[id]` | Product detail — add to cart |
| `/cart` | View/update/remove cart items, clear cart |
| `/checkout` | Place order from cart |
| `/login`, `/register` | Auth |
| `/orders` | Your order history — cancel pending/confirmed orders |
| `/account` | Edit profile, change password |
| `/admin` | Admin-only: stats overview |
| `/admin/orders` | Admin-only: all orders — filter by status, update status, force-cancel |
| `/admin/products` | Admin-only: create/edit products, adjust stock, deactivate |

Admin routes redirect anyone whose account isn't staff — sign in with
the Django superuser you created (`python manage.py createsuperuser`),
either via `/login` or the "Admin Sign In" link in the footer, to see them.

**Backend not running, or seeing no products?** See
`CONNECTING_FRONTEND_AND_BACKEND.md` — it covers running both projects
together, the difference between the Django admin and this frontend's
`/admin` dashboard, seeding sample products, and deploying both so
they're reachable outside `localhost`.

## How auth works

JWTs are stored in `localStorage` (`le_access` / `le_refresh`).
`lib/api.js` attaches the access token to every authenticated request
and transparently refreshes it once on a 401 before giving up. `logout()`
blacklists the refresh token server-side too.

## Making it your own

See **`CUSTOMIZATION.md`** for step-by-step instructions on adding your
own product images, editing homepage/footer text, and adjusting colors —
no code experience beyond editing a text file required. Prices display
in Nigerian Naira (₦) via `lib/format.js`.

## Notes / things you may want to change

- **Images**: products are shown via `image_url` (matches the backend's
  field) — there's no file upload in this build. Paste any public image
  URL when creating a product in the admin panel.
- **Checkout has no real payment step** — it calls `/orders/checkout/`
  directly, matching the backend's design (payment integration would be
  a separate addition on both ends).
- **Colors** live as CSS variables in `app/globals.css` under `:root`
  (light) and `.dark` — tweak them there rather than in Tailwind config
  if you want to adjust the palette.
