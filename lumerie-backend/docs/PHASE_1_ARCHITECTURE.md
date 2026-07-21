# School E-Commerce API — Phase 1: Architecture & Design

## 1. Why this project structure

Django projects that dump everything into one `app` become unmaintainable fast.
Instead we use a **multi-app structure**, one Django "app" per business domain.
Each app is self-contained: its own models, serializers, views, urls, permissions.

```
school-ecommerce-api/
├── config/                     # the "project" — settings, root urls, wsgi/asgi
│   ├── __init__.py
│   ├── settings.py             # split-ready (base settings, env-driven)
│   ├── urls.py                 # root URL router, includes each app's urls
│   ├── wsgi.py
│   └── asgi.py
│
├── apps/
│   ├── accounts/                # custom user, auth, profile
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   └── admin.py
│   │
│   ├── products/                # catalog: categories, products
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── filters.py
│   │   └── admin.py
│   │
│   ├── cart/                    # shopping cart
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── orders/                  # checkout, orders, order items
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── utils.py             # order ID generator, stock reduction
│   │   └── emails.py            # order confirmation/shipped/cancelled emails
│   │
│   └── dashboard/               # admin-only JSON endpoints
│       ├── views.py
│       └── urls.py
│
├── logs/                        # app.log written here
├── manage.py
├── requirements.txt
├── Procfile
├── render.yaml
├── .env.example
└── README.md
```

**Why apps instead of one big app:** each app maps to a URL prefix
(`/api/accounts/`, `/api/products/`, `/api/cart/`, `/api/orders/`,
`/api/dashboard/`), so the URL structure documents itself. It also means
if you later want to split cart into its own microservice, the code is
already isolated.

**Why `apps/` as a subfolder:** keeps custom code separate from
`config/` (the Django-generated project files) — a common convention
in production Django projects, and it keeps your import paths clean
(`apps.products.models` reads clearly).

---

## 2. Database design (ERD in words)

### User (custom user model, extends AbstractUser)
- id (PK)
- username, email (unique, required), first_name, last_name
- phone_number (optional — useful for order contact)
- is_staff, is_active (from AbstractUser)
- date_joined

**Why a custom user model from day one:** Django's docs strongly
recommend this even if you don't need extra fields yet — swapping
the user model later (after your first migration) is extremely
painful. Starting with `AUTH_USER_MODEL = 'accounts.User'` costs
nothing now and saves pain later.

### Product
- id (PK)
- name
- description
- main_category (choices: `jewelry`, `crochet`)
- sub_category (choices depend on main_category — validated in `clean()`/serializer)
- price (DecimalField — never use FloatField for money)
- stock (PositiveIntegerField)
- image_url (URLField — you said frontend is separate, so we store a URL rather than handling file uploads in this phase)
- material (optional, CharField, blank=True)
- colors_available (stored as a comma-separated list or JSONField — we'll use JSONField for a clean list in JSON responses)
- is_active (Boolean, default True — this is our **soft delete** flag)
- created_at, updated_at (auto)

**Sub-category validation:** we'll hardcode a mapping dict:
```python
CATEGORY_MAP = {
    "jewelry": ["watches", "rings", "necklaces", "bracelets", "earrings", "anklets", "brooches_pins"],
    "crochet": ["beanies", "hats", "vests", "scarves", "gloves_mittens", "headbands", "bags", "shawls_wraps", "home_decor", "stuffed_toys", "baby_items"],
}
```
and validate `sub_category in CATEGORY_MAP[main_category]` in the serializer.
This avoids a separate `Category`/`SubCategory` table for now — simpler for
a school project, but Phase 1 design still isolates this logic in one place
(`apps/products/constants.py`) so it's trivial to move to a DB table later
if you ever need admin-editable categories.

### Cart (one per user)
- id (PK)
- user (OneToOne → User)
- created_at, updated_at

### CartItem
- id (PK)
- cart (FK → Cart)
- product (FK → Product)
- quantity (PositiveIntegerField)
- unique_together = (cart, product)

### Order
- id (PK)
- order_id (CharField, unique — human-readable, e.g. `ORD-20260720-0001`)
- user (FK → User)
- status (choices: Pending, Confirmed, Shipped, Delivered, Cancelled)
- total_amount (Decimal)
- created_at, updated_at

### OrderItem (snapshot — doesn't reference live Product prices)
- id (PK)
- order (FK → Order)
- product (FK → Product, nullable — in case a product is later deleted)
- product_name (CharField — snapshot at purchase time)
- price (Decimal — snapshot at purchase time)
- quantity
- subtotal

**Why snapshot fields:** if you only stored a FK to `Product` and later
changed the product's price, historical orders would show the *new*
price — wrong. Snapshotting `product_name` and `price` on the `OrderItem`
at checkout time keeps order history accurate forever, even if the
product is edited or deleted.

---

## 3. API endpoint map

```
AUTH  /api/accounts/
  POST   register/
  POST   login/
  POST   logout/                (blacklists refresh token)
  POST   token/refresh/
  GET    profile/
  PATCH  profile/
  POST   change-password/

PRODUCTS  /api/products/
  GET    /                      (list, public, filters + search + pagination)
  GET    /<id>/                 (detail, public)
  GET    /categories/           (returns category/subcategory map)
  POST   /                      (admin only — create)
  PATCH  /<id>/                 (admin only — update)
  DELETE /<id>/                 (admin only — soft delete, sets is_active=False)

CART  /api/cart/                (all require auth)
  GET    /                      (view own cart)
  POST   /items/                (add item)
  PATCH  /items/<id>/           (update quantity)
  DELETE /items/<id>/           (remove item)
  DELETE /clear/                (empty cart)

ORDERS  /api/orders/            (all require auth)
  POST   /checkout/             (create order from cart)
  GET    /                      (list own orders)
  GET    /<order_id>/           (own order detail)
  POST   /<order_id>/cancel/    (cancel — only if Pending/Confirmed)

DASHBOARD  /api/dashboard/      (all require IsAdminUser)
  GET    /stats/                (revenue, order counts, etc.)
  GET    /orders/               (all orders, paginated + filterable)
  PATCH  /orders/<order_id>/status/   (update status → triggers email)
  POST   /orders/<order_id>/cancel/   (admin force-cancel any order)
  GET    /products/low-stock/
```

**Design note on consistency:** every response follows the same JSON
shape, whether success or error, so the Next.js frontend can write one
generic response handler instead of special-casing each endpoint:
```json
// success
{ "success": true, "data": { ... }, "message": "..." }
// error
{ "success": false, "errors": { "field": ["message"] }, "message": "..." }
```
We'll implement this with a small custom `exception_handler` + a
`APIResponse` helper in Phase 2.

---

## 4. Key architectural decisions (the "why" behind the stack)

| Decision | Reason |
|---|---|
| JWT (`simplejwt`) over session auth | Next.js frontend is a separate origin/app — token-based auth avoids CSRF/cookie complications across domains |
| Refresh token blacklisting | Lets logout actually invalidate a token instead of it staying valid until expiry |
| `dj-database-url` + SQLite locally | Same settings file works in dev (SQLite) and prod (Postgres on Render/Railway) — just swap `DATABASE_URL` env var |
| Atomic transactions on checkout | Prevents overselling stock if two users check out simultaneously — Django's `transaction.atomic()` + `select_for_update()` |
| Soft delete for products | Preserves order history — a deleted product must still display correctly in past orders |
| Snapshot fields on OrderItem | Historical order accuracy, explained above |
| Custom `APIResponse` + exception handler | Consistent, predictable JSON contract for the frontend team |
| WhiteNoise | Serves static files (Django admin CSS/JS) without needing a separate static file host, even though this is API-only |

---

## 5. What's next

**Phase 2** will generate: `config/settings.py` (env-driven, prod-ready),
root `urls.py`, `requirements.txt`, `Procfile`, `render.yaml`,
`.env.example`, and `README.md` — the skeleton everything else plugs into.

Reply **"Continue"** when you're ready, or ask questions about anything
above first — happy to explain any piece in more depth before we move on.
