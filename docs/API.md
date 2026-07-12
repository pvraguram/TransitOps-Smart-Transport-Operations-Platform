# TransitOps — API Reference

**Version:** 1.0.1
**Date:** 2026-07-12
**Base URL:** `http://localhost:8000/api`
**Interactive Docs:** `http://localhost:8000/docs` (Swagger UI)
**Format:** JSON over HTTP REST

> This document describes the API **as actually implemented** in `backend/app/api/routes/`. Earlier drafts of this
> file described a richer, fully-normalized API (per-ID GET/PUT/PATCH/DELETE on every resource, `/auth/me`,
> `/dashboard/*` breakdown endpoints) that was never built. What's below is what the code does; verified end-to-end
> against a running server on 2026-07-12.

---

## 1. Auth Endpoints (`/api/auth`, public)

### `POST /api/auth/register`
```json
{ "email": "user@transitops.com", "password": "securepassword123", "full_name": "Jane Mwangi", "role": "Fleet Manager" }
```
Returns `201` with `{ "access_token": "...", "token_type": "bearer" }`. `409`-style conflict returns `400 { "detail": "Email already registered" }`.

### `POST /api/auth/login`
```json
{ "email": "admin@transitops.com", "password": "admin123" }
```
Returns `200` with `{ "access_token": "...", "token_type": "bearer" }`. Invalid credentials → `401 { "detail": "Invalid credentials" }`.

The JWT payload only contains `{"sub": "<email>"}` — no expiry claim is set (`ACCESS_TOKEN_EXPIRE_MINUTES` in `.env` is not currently applied to token creation).

Include the token on subsequent requests as `Authorization: Bearer <token>`. **Note:** no route currently enforces this — `get_current_user` (`app/core/deps.py`) is defined but not wired into any router, so all endpoints below are reachable without a token today.

Default seeded user: `admin@transitops.com` / `admin123`.

---

## 2. Lookup Endpoints (`/api/lookup`, public)

Read-only reference data.

| Endpoint | Returns |
|---|---|
| `GET /api/lookup/regions` | `[{ "id": 1, "name": "Delhi NCR" }, ...]` |
| `GET /api/lookup/vehicle-types` | `[{ "id": 1, "name": "Heavy Truck", "description": null }, ...]` |
| `GET /api/lookup/license-categories` | `[{ "id": 1, "name": "HMV", "description": null }, ...]` |
| `GET /api/lookup/maintenance-types` | `["routine", "repair", "inspection"]` |
| `GET /api/lookup/expense-types` | `["toll", "parking", "fine", "other"]` |

`regions`/`vehicle-types`/`license-categories` are DB-backed reference tables (seeded on startup). Vehicles and Drivers currently store `type` / `license_category` as free-text strings (see §3–4) rather than foreign keys into these tables — the lookup lists exist for reference/future use but the create forms don't populate a dropdown from them yet.

---

## 3. Vehicles Endpoints (`/api/vehicles`)

### `GET /api/vehicles`
Query params: `status` (`available|on_trip|in_shop|retired`), `type` (exact match on the free-text type string).

```json
[
  {
    "id": 1,
    "registration_number": "KA-01-AB-1234",
    "name_model": "Tata Ace Gold",
    "type": "Van",
    "max_load_capacity": 10.5,
    "status": "available",
    "odometer": 15000.0,
    "acquisition_cost": 850000.0,
    "region_id": 1
  }
]
```

### `POST /api/vehicles`
```json
{
  "registration_number": "MH-12-AB-9999",
  "name_model": "Tata Ace Gold",
  "type": "Van",
  "max_load_capacity": 4000,
  "acquisition_cost": 900000
}
```
`status`, `odometer`, `acquisition_cost`, `region_id` are all optional (default `available` / `0` / `0.0` / `null`). Duplicate `registration_number` → `400 { "detail": "Registration number already exists" }`.

There is no `GET /{id}`, `PUT /{id}`, `PATCH /{id}/status`, or `DELETE /{id}` — the frontend only lists and creates vehicles today.

---

## 4. Drivers Endpoints (`/api/drivers`)

### `GET /api/drivers`

```json
[
  {
    "id": 1,
    "first_name": "Ramesh",
    "last_name": "Kumar",
    "license_number": "DL-142023",
    "license_category": "LMV",
    "license_expiry_date": "2028-07-11",
    "contact_number": "+91 90000 00000",
    "safety_score": 100,
    "status": "available",
    "region_id": 1
  }
]
```

### `POST /api/drivers`
```json
{
  "first_name": "Mary",
  "last_name": "Achieng",
  "license_number": "DL-KE-2025-020",
  "license_category": "LMV",
  "license_expiry_date": "2028-12-31",
  "contact_number": "+91 99999 99999"
}
```
`safety_score` (default `100`), `status` (default `available`), `region_id` are optional.

No `GET /{id}`, `PUT /{id}`, or `DELETE /{id}` exist yet.

---

## 5. Trips Endpoints (`/api/trips`)

### `GET /api/trips` — lists all trips, no filtering.

### `POST /api/trips/dispatch`
The only creation route — a trip is created **already dispatched**, assigning a vehicle+driver in one step (there is no separate `Draft` stage).
```json
{
  "origin": "Nairobi",
  "destination": "Mombasa",
  "vehicle_id": 2,
  "driver_id": 2,
  "cargo_weight": 1500,
  "planned_distance": 485
}
```
Server-side checks (all return `400`/`404` with a `detail` message): vehicle/driver must exist, `cargo_weight` must not exceed `vehicle.max_load_capacity`, vehicle must be `available`, driver must not be `suspended`, driver's `license_expiry_date` must not be in the past, driver must be `available`. On success: vehicle and driver flip to `on_trip`, trip is created with `status: "dispatched"`.

### `PUT /api/trips/{id}/status?status=<completed|cancelled|...>`
Updates trip status via query param. When set to `completed` or `cancelled`, the linked vehicle and driver are reset to `available` and `end_time` is stamped.

---

## 6. Maintenance Endpoints (`/api/maintenance`)

### `GET /api/maintenance` — lists all records.

### `POST /api/maintenance`
```json
{
  "vehicle_id": 2,
  "date": "2026-07-12",
  "type": "routine",
  "cost": 1500,
  "description": "Oil change"
}
```
`type` must be one of `routine|repair|inspection`. `status` defaults to `active`, and creating an `active` record flips the vehicle to `in_shop`.

### `PUT /api/maintenance/{id}/status?status=completed`
Marks the record `completed` and flips the vehicle back to `available`.

---

## 7. Expenses Endpoints

### Fuel logs (`/api/expenses/fuel`)
`GET` lists all logs. `POST` body:
```json
{ "vehicle_id": 2, "gallons": 120.5, "cost": 18075, "date": "2026-07-12", "odometer_reading": null }
```
Note the field is `gallons`, not `liters`, despite the "Litres" label in the UI.

### Other expenses (`/api/expenses`)
`GET` lists all expenses. `POST` body:
```json
{ "trip_id": 1, "type": "toll", "amount": 500, "description": "Highway toll", "date": "2026-07-12" }
```
`type` must be one of `toll|parking|fine|other`.

No update/delete endpoints exist for either.

---

## 8. Dashboard / Analytics (`/api/analytics/dashboard`)

Single endpoint, no query params:
```json
{
  "active_vehicles": 6,
  "vehicles_in_maintenance": 2,
  "active_trips": 2,
  "pending_trips": 0,
  "drivers_on_duty": 1
}
```
There is no `/dashboard/fleet-status` or `/dashboard/trip-activity` breakdown endpoint — the frontend's donut/bar charts (if present) derive their data client-side from `GET /vehicles` and `GET /trips`.

---

## 9. Error Shapes

- `400` — business-rule violation or duplicate field, `{ "detail": "<message>" }`
- `401` — invalid login credentials
- `404` — referenced vehicle/driver/trip/maintenance record not found
- `422` — Pydantic validation failure (missing/invalid field), FastAPI's standard shape
- `500` — response serialization or unhandled server error

---

## 10. Frontend → API Map

| Page | Calls |
|---|---|
| Login | `POST /auth/login`, `POST /auth/register` |
| Dashboard | `GET /analytics/dashboard`, `GET /trips`, `GET /vehicles` |
| Vehicles | `GET /vehicles`, `POST /vehicles` |
| Drivers | `GET /drivers`, `POST /drivers` |
| Trips | `GET /trips`, `GET /vehicles`, `GET /drivers`, `POST /trips/dispatch` |
| Maintenance | `GET /maintenance`, `GET /vehicles`, `POST /maintenance`, `PUT /maintenance/{id}/status` |
| Expenses | `GET /expenses/fuel`, `POST /expenses/fuel`, `GET /expenses`, `POST /expenses`, `GET /vehicles`, `GET /trips` |
