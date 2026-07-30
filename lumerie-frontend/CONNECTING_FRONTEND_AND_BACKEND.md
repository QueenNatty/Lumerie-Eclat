# Connecting the Frontend to the Backend

The two projects (`lumerie-backend` and `lumerie-frontend`) are separate
apps that talk to each other over HTTP — the frontend never touches the
backend's code directly. Both need to be **running at the same time**
for the site to show real data. Running only `python manage.py
runserver` gives you the *backend* (the API and the Django admin) —
it doesn't give you the storefront pages, which live in the frontend.

## Local development — two terminals, both running

**Terminal 1 — backend:**
```bash
cd lumerie-backend
python manage.py runserver
```
Leave this running. It's now serving the API at `http://127.0.0.1:8000/api/`
and the Django admin at `http://127.0.0.1:8000/admin/`.

**Terminal 2 — frontend:**
```bash
cd lumerie-frontend
cp .env.local.example .env.local     # only needed the first time
npm install                          # only needed the first time
npm run dev
```
Leave this running too. Visit `http://localhost:3000` — this is the
actual storefront. It fetches its data from whatever URL is in
`.env.local`'s `NEXT_PUBLIC_API_BASE_URL`, which defaults to
`http://127.0.0.1:8000/api` — matching Terminal 1 above.

If you change the backend's port or host, update that one line in
`.env.local` and restart `npm run dev`.

## Two different "admin" areas — don't mix them up

- **`/admin/` on the backend** (`http://127.0.0.1:8000/admin/`) is
  Django's own admin site — a generic-but-now-branded page for editing
  raw database rows directly. Log in with a superuser
  (`python manage.py createsuperuser`).
- **`/admin` on the frontend** (`http://localhost:3000/admin`) is the
  custom dashboard built for this project — stats, order management,
  product CRUD with a form (not raw database rows). Log in with the
  *same* staff/superuser account, through the normal `/login` page (or
  the "Admin Sign In" link in the footer) — there's no separate admin
  login system, being `is_staff` on your account is what unlocks it.

You'll likely use the frontend's `/admin` dashboard day-to-day, and only
drop into the Django admin for quick manual database fixes.

## "There are no products"

The database starts empty. Either:
- Add products yourself at `http://localhost:3000/admin/products`, or
- Run the seed command once to add sample products:
  ```bash
  cd lumerie-backend
  python manage.py seed_products
  ```

## Deploying so both are reachable on the internet

Right now everything above assumes `localhost`. To make the site
reachable by anyone (not just on your machine):

1. Deploy the backend first (see `docs/DEPLOYMENT_CHECKLIST.md`) — e.g.
   Render. You'll end up with a URL like `https://lumerie-eclat-api.onrender.com`.
2. On the backend, set `CORS_ALLOWED_ORIGINS` to your frontend's deployed
   URL (you'll have this after step 3 — you can come back and set it).
3. Deploy the frontend — Vercel is the simplest option for Next.js:
   - Push `lumerie-frontend` to GitHub.
   - Import it on [vercel.com](https://vercel.com).
   - Set the environment variable `NEXT_PUBLIC_API_BASE_URL` to your
     deployed backend's URL + `/api`, e.g.
     `https://lumerie-eclat-api.onrender.com/api`.
   - Deploy — you'll get a URL like `https://lumerie-eclat.vercel.app`.
4. Go back to the backend's `CORS_ALLOWED_ORIGINS` env var and set it to
   that Vercel URL, then redeploy the backend.

After that, both are live and talking to each other with no `runserver`
or `localhost` involved.
