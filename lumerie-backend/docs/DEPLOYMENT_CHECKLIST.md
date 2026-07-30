# Deployment Checklist

## Before deploying
- [ ] `SECRET_KEY` set to a real random value (not the dev default)
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` set to your actual domain(s)
- [ ] `CORS_ALLOWED_ORIGINS` set to your deployed frontend's URL (no trailing slash)
- [ ] `DATABASE_URL` present (Render/Railway inject this automatically once you attach a Postgres instance)
- [ ] All dependencies in `requirements.txt` (run `pip freeze` if you added anything)
- [ ] `.env` is NOT committed to git (check `.gitignore`)

## Render (recommended — render.yaml already configured)
1. Push to GitHub.
2. Render dashboard → **New > Blueprint** → select the repo.
3. Render provisions the web service + a free Postgres DB from `render.yaml`.
4. Manually set `CORS_ALLOWED_ORIGINS` in the dashboard (marked `sync: false` on purpose).
5. First deploy runs `python manage.py migrate` automatically (see `Procfile`'s `release:` line).
6. Create an admin user via Render's shell tab: `python manage.py createsuperuser`.

## Railway
1. `railway init`, connect the GitHub repo.
2. Add a Postgres plugin — Railway sets `DATABASE_URL` automatically.
3. Set the same env vars as above in Railway's dashboard.
4. Railway uses the same `Procfile`.

## PythonAnywhere
1. Upload/clone the repo.
2. Create a virtualenv, `pip install -r requirements.txt`.
3. In the Web tab, point the WSGI file at `config.wsgi.application`.
4. Set environment variables in the Web tab's "Environment variables" section (or load a `.env` there).
5. `python manage.py migrate`, then reload the web app.

## After deploying
- [ ] Hit `GET /api/health/` to confirm it's live
- [ ] Confirm `/admin/` loads and you can log in
- [ ] Run through register → login → browse products → add to cart → checkout once end-to-end against the deployed URL
- [ ] Point the Next.js frontend's API base URL at the deployed backend
