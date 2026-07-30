# Lumerie Eclat API — Endpoint Reference

Base URL (local): `http://127.0.0.1:8000/api/`

Every response follows this envelope:
```json
// success
{ "success": true, "message": "...", "data": { ... } }
// error
{ "success": false, "message": "...", "errors": { "field": ["..."] } }
```
Authenticated endpoints expect `Authorization: Bearer <access_token>`.

---

## Accounts (`/api/accounts/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `register/` | Public | Create account, returns user + JWT tokens |
| POST | `login/` | Public | Login with `username` (username OR email) + `password` |
| POST | `logout/` | Auth | Body: `{"refresh": "<token>"}` — blacklists it |
| POST | `token/refresh/` | Public | Body: `{"refresh": "<token>"}` → new access token |
| GET | `profile/` | Auth | View own profile |
| PATCH | `profile/` | Auth | Update own profile (partial) |
| POST | `change-password/` | Auth | `{old_password, new_password, new_password2}` |

**Register example**
```json
POST /api/accounts/register/
{ "username": "nae", "email": "nae@example.com", "password": "StrongPass123!", "password2": "StrongPass123!" }
```

---

## Products (`/api/products/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `` | Public | List active products — filters, search, pagination |
| GET | `<id>/` | Public | Product detail |
| GET | `categories/` | Public | Full category → sub-category map |
| GET | `admin/` | Admin | List ALL products (active + inactive) |
| POST | `admin/` | Admin | Create product |
| PATCH | `admin/<id>/` | Admin | Update product |
| DELETE | `admin/<id>/` | Admin | Soft delete (`is_active=False`) |

**Query params on `GET /api/products/`:**
- `search=ring` — matches name/description/material
- `main_category=jewelry`, `sub_category=rings`
- `min_price=10&max_price=100`
- `ordering=price` or `ordering=-created_at`
- `page=2&page_size=20`

---

## Cart (`/api/cart/`) — all require auth

| Method | Path | Description |
|---|---|---|
| GET | `` | View own cart |
| DELETE | `clear/` | Empty the cart |
| POST | `items/` | `{"product_id": 1, "quantity": 2}` — add item |
| PATCH | `items/<id>/` | `{"quantity": 3}` — update quantity |
| DELETE | `items/<id>/` | Remove item |

---

## Orders (`/api/orders/`) — all require auth

| Method | Path | Description |
|---|---|---|
| POST | `checkout/` | Create order from current cart. Optional `{"shipping_address": "..."}` |
| GET | `` | List own orders (paginated) |
| GET | `<order_id>/` | Own order detail, e.g. `ORD-20260724-0001` |
| POST | `<order_id>/cancel/` | Only if status is Pending or Confirmed |

---

## Admin Dashboard (`/api/dashboard/`) — all require admin

| Method | Path | Description |
|---|---|---|
| GET | `stats/` | Revenue, order counts by status, low-stock count, 5 most recent orders |
| GET | `orders/` | ALL orders, paginated, `?status=pending`, search, ordering |
| PATCH | `orders/<order_id>/status/` | `{"status": "shipped"}` — triggers shipped/cancelled email |
| POST | `orders/<order_id>/cancel/` | Force-cancel any order, restocks items |
| GET | `products/low-stock/` | Active products with stock ≤ 5 |

---

## Status codes used

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation error / bad request |
| 401 | Not authenticated |
| 403 | Authenticated but not permitted (e.g. non-admin hitting an admin endpoint) |
| 404 | Not found (also returned instead of 403 for other users' orders, so existence isn't leaked) |
| 500 | Unhandled server error (logged server-side, generic message returned to client) |
