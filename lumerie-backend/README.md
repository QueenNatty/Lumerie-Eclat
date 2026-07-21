# Lumerie Eclat API

Production-ready, API-only Django REST Framework backend for the Lumerie
Eclat e-commerce project (jewelry + crochet store). Built to pair with a
separate Next.js frontend — every endpoint returns JSON only.

## Tech stack

- Django 4.2 + Django REST Framework
- JWT auth via `djangorestframework-simplejwt` (with refresh token blacklisting)
- SQLite locally, PostgreSQL in production (via `dj-database-url`)
- `django-cors-headers`, `django-filter`, `django-environ`
- WhiteNoise (static files) + Gunicorn (production server)

## Local setup

```bash
# 1. Clone and enter the project
git clone <your-repo-url> lumerie-eclat-api
cd lumerie-eclat-api

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy the example env file and fill in your own values
cp .env.example .env

# 5. Run migrations
python manage.py migrate

# 6. Create an admin user (for the Django admin + admin-only endpoints)
python manage.py createsuperuser

# 7. Run the dev server
python manage.py runserver
```

The API is now live at `http://127.0.0.1:8000/api/`.
Health check: `GET /api/health/`.
Django admin: `http://127.0.0.1:8000/admin/`.

## Environment variables

See `.env.example` for the full list. The important ones:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django's cryptographic signing key — must be secret in production |
| `DEBUG` | `True` locally, `False` in production |
| `ALLOWED_HOSTS` | Comma-separated hostnames allowed to serve the app |
| `DATABASE_URL` | Postgres connection string in production; unset = local SQLite |
| `CORS_ALLOWED_ORIGINS` | Your Next.js frontend's origin(s) |

## Project structure

```
config/          # settings, root urls, wsgi/asgi
apps/
  core/          # shared response envelope, exception handler, pagination
  accounts/      # auth, custom user, profile
  products/      # catalog
  cart/          # shopping cart
  orders/        # checkout, orders
  dashboard/     # admin-only JSON endpoints
```

## API response shape

Every endpoint returns the same envelope:

```json
// success
{ "success": true, "message": "Success", "data": { ... } }

// error
{ "success": false, "message": "Request failed", "errors": { "field": ["..."] } }
```

## Deployment (Render)

1. Push this repo to GitHub.
2. On Render, choose **New > Blueprint** and point it at the repo —
   `render.yaml` configures the web service and a free Postgres database
   automatically.
3. Set `CORS_ALLOWED_ORIGINS` in the Render dashboard to your deployed
   Next.js frontend's URL (this one field is marked `sync: false`, so
   Render won't auto-fill it — you set it manually).
4. Deploy. `release: python manage.py migrate` runs automatically before
   each deploy (see `Procfile`).

### Deploying elsewhere (Railway / PythonAnywhere)

The same `Procfile` and `requirements.txt` work on Railway as-is. For
PythonAnywhere, follow their WSGI-app import instructions pointing at
`config.wsgi.application`, and set the same environment variables via
their web-app "Environment variables" section.

## Running tests

(Added in Phase 8.)
```bash
python manage.py test
```

## Status

Built in phases — see `docs/` for the full design write-up. Current
phase: **Phase 2 — project setup**.
