# TransitOps — API Reference

**Version:** 1.0.0
**Date:** 2026-07-12
**Base URL:** `http://localhost:8000/api`
**Interactive Docs:** `http://localhost:8000/docs` (Swagger UI)
**Format:** JSON over HTTP REST
**Auth:** JWT Bearer token on all protected routes

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Request & Response Format](#3-request--response-format)
4. [HTTP Status Codes](#4-http-status-codes)
5. [Auth Endpoints](#5-auth-endpoints)
6. [Lookup Endpoints](#6-lookup-endpoints)
7. [Vehicles Endpoints](#7-vehicles-endpoints)
8. [Drivers Endpoints](#8-drivers-endpoints)
9. [Trips Endpoints](#9-trips-endpoints)
10. [Maintenance Endpoints](#10-maintenance-endpoints)
11. [Expenses Endpoints](#11-expenses-endpoints)
12. [Dashboard Endpoints](#12-dashboard-endpoints)
13. [Frontend → API Map](#13-frontend--api-map)

---

## 1. Overview

The TransitOps API is a **RESTful HTTP API** built with FastAPI. All responses are JSON. All request bodies must be JSON with `Content-Type: application/json`.

```
Base URL:    http://localhost:8000/api
Swagger UI:  http://localhost:8000/docs
ReDoc:       http://localhost:8000/redoc
```

FastAPI automatically generates and serves interactive documentation at `/docs`. Every endpoint can be tested directly from the browser — no Postman required.

---

## 2. Authentication

### 2.1 Login Flow

```mermaid
sequenceDiagram
    participant FE as Frontend (React)
    participant API as FastAPI /api/auth/login
    participant DB as PostgreSQL

    FE->>API: POST /api/auth/login\n{ "email": "...", "password": "..." }
    API->>DB: SELECT * FROM users WHERE email = ?
    DB-->>API: User row
    API->>API: bcrypt.verify(password, hashed_password)

    alt Valid credentials
        API->>API: jwt.encode({ sub, email, exp })
        API-->>FE: 200 OK\n{ "access_token": "eyJ...", "token_type": "bearer", "user": {...} }
        FE->>FE: localStorage.setItem('token', access_token)
        Note over FE: All future requests include:\nAuthorization: Bearer eyJ...
    else Invalid credentials
        API-->>FE: 401 Unauthorized\n{ "detail": "Incorrect email or password" }
    end
```

### 2.2 Using the Token

Include the token in the `Authorization` header for every protected request:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.3 JWT Payload

```json
{
  "sub": "1",
  "email": "admin@transitops.com",
  "exp": 1720886400
}
```

| Field | Description |
|---|---|
| `sub` | User ID (string) |
| `email` | User email |
| `exp` | Unix timestamp — token expires at this time |

**Token lifetime:** 24 hours (1440 minutes), configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` in `.env`.

When the token expires, the frontend receives `401 Unauthorized` and should redirect to `/login`.

---

## 3. Request & Response Format

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <token>       (all protected endpoints)
```

### Successful Response

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "registration_number": "KAA 123A",
  ...
}
```

### Error Response

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "detail": "Vehicle not found"
}
```

### Validation Error (422)

FastAPI automatically returns this when the request body fails Pydantic validation:

```json
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "registration_number"],
      "msg": "Field required",
      "input": {}
    }
  ]
}
```

---

## 4. HTTP Status Codes

| Code | Meaning | When returned |
|---|---|---|
| `200 OK` | Success | GET, PUT, PATCH |
| `201 Created` | Resource created | POST |
| `204 No Content` | Deleted successfully | DELETE |
| `400 Bad Request` | Malformed request | Invalid JSON |
| `401 Unauthorized` | Missing or invalid token | No/expired JWT |
| `403 Forbidden` | Valid token, no permission | Reserved for RBAC |
| `404 Not Found` | Resource doesn't exist | Unknown ID |
| `409 Conflict` | Duplicate unique field | Duplicate reg number |
| `422 Unprocessable Entity` | Validation failed | Missing required fields |
| `500 Internal Server Error` | Unexpected server error | Bug / DB down |

---

## 5. Auth Endpoints

### `POST /api/auth/register`

Create a new user account.

**Auth:** None (public)

**Request Body:**
```json
{
  "email": "user@transitops.com",
  "password": "securepassword123",
  "full_name": "Jane Mwangi"
}
```

**Response `201 Created`:**
```json
{
  "id": 2,
  "email": "user@transitops.com",
  "full_name": "Jane Mwangi",
  "is_active": true,
  "created_at": "2026-07-12T10:00:00Z"
}
```

**Error `409 Conflict`:**
```json
{ "detail": "Email already registered" }
```

---

### `POST /api/auth/login`

Authenticate and receive a JWT access token.

**Auth:** None (public)

**Request Body:**
```json
{
  "email": "admin@transitops.com",
  "password": "admin123"
}
```

**Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkB0cmFuc2l0b3BzLmNvbSIsImV4cCI6MTcyMDg4NjQwMH0.abc123",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@transitops.com",
    "full_name": "System Administrator",
    "is_active": true
  }
}
```

**Error `401 Unauthorized`:**
```json
{ "detail": "Incorrect email or password" }
```

---

### `GET /api/auth/me`

Return the currently authenticated user's profile.

**Auth:** JWT required

**Response `200 OK`:**
```json
{
  "id": 1,
  "email": "admin@transitops.com",
  "full_name": "System Administrator",
  "is_active": true,
  "created_at": "2026-07-12T04:00:00Z"
}
```

---

## 6. Lookup Endpoints

All lookup endpoints are **public** (no auth required — needed to populate form dropdowns on the login page before auth).

### `GET /api/lookup/vehicle-types`

```json
[
  { "id": 1, "name": "Bus" },
  { "id": 2, "name": "Truck" },
  { "id": 3, "name": "Van" },
  { "id": 4, "name": "Motorcycle" }
]
```

### `GET /api/lookup/regions`

```json
[
  { "id": 1, "name": "Nairobi" },
  { "id": 2, "name": "Mombasa" },
  { "id": 3, "name": "Kisumu" },
  { "id": 4, "name": "Nakuru" },
  { "id": 5, "name": "Eldoret" }
]
```

### `GET /api/lookup/license-categories`

```json
[
  { "id": 1, "code": "A", "description": "Motorcycles and light quadricycles" },
  { "id": 2, "code": "B", "description": "Light vehicles up to 3,500 kg" },
  { "id": 3, "code": "C", "description": "Heavy trucks over 3,500 kg" },
  { "id": 4, "code": "D", "description": "Passenger vehicles (buses)" },
  { "id": 5, "code": "E", "description": "Articulated vehicles" }
]
```

### `GET /api/lookup/maintenance-types`

```json
[
  { "id": 1, "name": "Preventive" },
  { "id": 2, "name": "Corrective" },
  { "id": 3, "name": "Emergency" },
  { "id": 4, "name": "Inspection" }
]
```

### `GET /api/lookup/expense-categories`

```json
[
  { "id": 1, "name": "Toll" },
  { "id": 2, "name": "Repair" },
  { "id": 3, "name": "Permit" },
  { "id": 4, "name": "Insurance" },
  { "id": 5, "name": "Other" }
]
```

---

## 7. Vehicles Endpoints

**Base path:** `/api/vehicles`
**Auth:** JWT required on all

### `GET /api/vehicles`

List all vehicles with optional filtering.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `status` | string | Filter by status: `Available`, `On Trip`, `In Shop`, `Retired` |
| `search` | string | Search by registration number (case-insensitive, partial match) |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "registration_number": "KAA 123A",
    "name": "City Express 1",
    "vehicle_type_id": 1,
    "vehicle_type_name": "Bus",
    "max_load_capacity": 5000.00,
    "odometer": 45230.50,
    "acquisition_cost": 4500000.00,
    "region_id": 1,
    "region_name": "Nairobi",
    "status": "Available",
    "created_at": "2026-07-01T08:00:00Z",
    "updated_at": "2026-07-12T06:00:00Z"
  }
]
```

---

### `POST /api/vehicles`

Create a new vehicle.

**Request Body:**
```json
{
  "registration_number": "KAD 001A",
  "name": "Express Shuttle 5",
  "vehicle_type_id": 1,
  "max_load_capacity": 4500.00,
  "odometer": 0.00,
  "acquisition_cost": 5200000.00,
  "region_id": 1,
  "status": "Available"
}
```

**Response `201 Created`:**
```json
{
  "id": 11,
  "registration_number": "KAD 001A",
  "name": "Express Shuttle 5",
  "vehicle_type_id": 1,
  "vehicle_type_name": "Bus",
  "max_load_capacity": 4500.00,
  "odometer": 0.00,
  "acquisition_cost": 5200000.00,
  "region_id": 1,
  "region_name": "Nairobi",
  "status": "Available",
  "created_at": "2026-07-12T10:15:00Z",
  "updated_at": "2026-07-12T10:15:00Z"
}
```

---

### `GET /api/vehicles/{id}`

Get a single vehicle by ID.

**Response `200 OK`:** Same shape as list item above.

**Error `404`:** `{ "detail": "Vehicle not found" }`

---

### `PUT /api/vehicles/{id}`

Full update of a vehicle record.

**Request Body:** Same as POST (all fields required).

**Response `200 OK`:** Updated vehicle object.

---

### `PATCH /api/vehicles/{id}/status`

Update only the vehicle status.

**Request Body:**
```json
{ "status": "In Shop" }
```

**Response `200 OK`:**
```json
{ "id": 1, "status": "In Shop", ... }
```

---

### `DELETE /api/vehicles/{id}`

Delete a vehicle.

**Response `204 No Content`** (empty body)

**Error `404`:** `{ "detail": "Vehicle not found" }`

---

## 8. Drivers Endpoints

**Base path:** `/api/drivers`

### `GET /api/drivers`

**Query Parameters:** `?status=Available&search=John`

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "James Mwangi",
    "license_number": "DL-KE-2024-001",
    "license_category_id": 4,
    "license_category_code": "D",
    "license_expiry": "2027-06-30",
    "contact_number": "+254 712 345 678",
    "safety_score": 92.5,
    "status": "Available",
    "created_at": "2026-07-01T08:00:00Z",
    "updated_at": "2026-07-12T06:00:00Z"
  }
]
```

### `POST /api/drivers`

**Request Body:**
```json
{
  "name": "Mary Achieng",
  "license_number": "DL-KE-2025-020",
  "license_category_id": 3,
  "license_expiry": "2028-12-31",
  "contact_number": "+254 733 456 789",
  "safety_score": 88.0,
  "status": "Available"
}
```

**Response `201 Created`:** Driver object with `id` and `license_category_code` joined.

### `GET /api/drivers/{id}` — Get one driver

### `PUT /api/drivers/{id}` — Full update

### `PATCH /api/drivers/{id}/status`

```json
{ "status": "Off Duty" }
```

### `DELETE /api/drivers/{id}` — Delete, returns 204

---

## 9. Trips Endpoints

**Base path:** `/api/trips`

### `GET /api/trips`

**Query Parameters:** `?status=Draft`

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "source": "Nairobi",
    "destination": "Mombasa",
    "vehicle_id": 1,
    "vehicle_name": "City Express 1",
    "driver_id": 1,
    "driver_name": "James Mwangi",
    "cargo_weight": 2500.00,
    "planned_distance": 485.00,
    "revenue": 85000.00,
    "status": "Dispatched",
    "created_at": "2026-07-10T07:00:00Z",
    "updated_at": "2026-07-10T08:30:00Z"
  }
]
```

### `POST /api/trips`

Creates a trip in `Draft` status.

**Request Body:**
```json
{
  "source": "Nairobi",
  "destination": "Kisumu",
  "vehicle_id": 3,
  "driver_id": 2,
  "cargo_weight": 1800.00,
  "planned_distance": 348.00,
  "revenue": 62000.00
}
```

**Response `201 Created`:** Trip object with `status: "Draft"`.

### `GET /api/trips/{id}` — Get one

### `PUT /api/trips/{id}` — Full update (only allowed in Draft status)

### Trip Status Transitions

```mermaid
stateDiagram-v2
    [*] --> Draft : POST /api/trips
    Draft --> Dispatched : PATCH /trips/id/dispatch\nvehicle + driver → On Trip
    Draft --> Cancelled : PATCH /trips/id/cancel
    Dispatched --> Completed : PATCH /trips/id/complete\nvehicle + driver → Available
    Dispatched --> Cancelled : PATCH /trips/id/cancel\nvehicle + driver → Available
    Completed --> [*]
    Cancelled --> [*]
```

### `PATCH /api/trips/{id}/dispatch`

Transitions trip from `Draft` → `Dispatched`. As a side effect:
- `vehicles.status` → `On Trip`
- `drivers.status` → `On Trip`

**Request Body:** None

**Response `200 OK`:** Updated trip with `status: "Dispatched"`

**Error `422`:** `{ "detail": "Trip must be in Draft status to dispatch" }`

---

### `PATCH /api/trips/{id}/complete`

Transitions trip from `Dispatched` → `Completed`. As a side effect:
- `vehicles.status` → `Available`
- `drivers.status` → `Available`

**Response `200 OK`:** Updated trip with `status: "Completed"`

---

### `PATCH /api/trips/{id}/cancel`

Transitions trip from `Draft` or `Dispatched` → `Cancelled`. If previously Dispatched:
- `vehicles.status` → `Available`
- `drivers.status` → `Available`

**Response `200 OK`:** Updated trip with `status: "Cancelled"`

---

### `DELETE /api/trips/{id}` — Returns 204

---

## 10. Maintenance Endpoints

**Base path:** `/api/maintenance`

### `GET /api/maintenance`

**Query Parameters:** `?vehicle_id=1&status=Active`

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "vehicle_id": 2,
    "vehicle_name": "Cargo Runner 2",
    "maintenance_type_id": 1,
    "maintenance_type_name": "Preventive",
    "description": "Engine oil change and filter replacement",
    "estimated_cost": 15000.00,
    "actual_cost": null,
    "start_date": "2026-07-10",
    "status": "Active",
    "created_at": "2026-07-10T09:00:00Z"
  }
]
```

### `POST /api/maintenance`

**Request Body:**
```json
{
  "vehicle_id": 2,
  "maintenance_type_id": 1,
  "description": "Engine oil change and filter replacement",
  "estimated_cost": 15000.00,
  "actual_cost": null,
  "start_date": "2026-07-12",
  "status": "Active"
}
```

### `GET /api/maintenance/{id}` — Get one

### `PUT /api/maintenance/{id}` — Full update

### `PATCH /api/maintenance/{id}/complete`

Marks maintenance as Completed and records the actual cost.

**Request Body:**
```json
{ "actual_cost": 14500.00 }
```

**Response `200 OK`:** Updated maintenance record with `status: "Completed"`.

### `DELETE /api/maintenance/{id}` — Returns 204

---

## 11. Expenses Endpoints

### Fuel Logs

#### `GET /api/fuel-logs`

**Query Parameters:** `?vehicle_id=1`

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "vehicle_id": 1,
    "vehicle_name": "City Express 1",
    "trip_id": 1,
    "fuel_litres": 120.50,
    "total_cost": 18075.00,
    "date": "2026-07-10",
    "created_at": "2026-07-10T14:00:00Z"
  }
]
```

#### `POST /api/fuel-logs`

**Request Body:**
```json
{
  "vehicle_id": 1,
  "trip_id": 1,
  "fuel_litres": 120.50,
  "total_cost": 18075.00,
  "date": "2026-07-12"
}
```

**Response `201 Created`:** Fuel log object.

#### `DELETE /api/fuel-logs/{id}` — Returns 204

---

### Other Expenses

#### `GET /api/expenses`

**Query Parameters:** `?vehicle_id=1`

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "vehicle_id": 1,
    "vehicle_name": "City Express 1",
    "trip_id": 1,
    "expense_category_id": 1,
    "expense_category_name": "Toll",
    "amount": 500.00,
    "description": "Nairobi-Mombasa highway toll",
    "date": "2026-07-10",
    "created_at": "2026-07-10T16:00:00Z"
  }
]
```

#### `POST /api/expenses`

**Request Body:**
```json
{
  "vehicle_id": 1,
  "trip_id": 1,
  "expense_category_id": 1,
  "amount": 500.00,
  "description": "Nairobi-Mombasa highway toll",
  "date": "2026-07-12"
}
```

**Response `201 Created`:** Expense object.

#### `DELETE /api/expenses/{id}` — Returns 204

---

## 12. Dashboard Endpoints

All dashboard endpoints return **aggregated data** computed by PostgreSQL queries — not calculated on the frontend.

### `GET /api/dashboard/stats`

Returns all 6 KPI card values in a single request.

**Auth:** JWT required

**Response `200 OK`:**
```json
{
  "total_vehicles": 10,
  "available_vehicles": 6,
  "vehicles_on_trip": 2,
  "vehicles_in_maintenance": 2,
  "active_trips": 2,
  "available_drivers": 6
}
```

---

### `GET /api/dashboard/fleet-status`

Returns vehicle counts grouped by status. Used to render the **Donut Chart** on the dashboard.

**Response `200 OK`:**
```json
[
  { "status": "Available",  "count": 6 },
  { "status": "On Trip",    "count": 2 },
  { "status": "In Shop",    "count": 2 },
  { "status": "Retired",    "count": 0 }
]
```

---

### `GET /api/dashboard/trip-activity`

Returns trip counts per day for the last 7 days, broken down by status. Used to render the **Bar Chart** on the dashboard.

**Response `200 OK`:**
```json
[
  {
    "date": "2026-07-06",
    "draft": 1,
    "dispatched": 0,
    "completed": 2,
    "cancelled": 0
  },
  {
    "date": "2026-07-07",
    "draft": 0,
    "dispatched": 1,
    "completed": 1,
    "cancelled": 1
  },
  {
    "date": "2026-07-08",
    "draft": 2,
    "dispatched": 0,
    "completed": 0,
    "cancelled": 0
  },
  {
    "date": "2026-07-09",
    "draft": 0,
    "dispatched": 2,
    "completed": 1,
    "cancelled": 0
  },
  {
    "date": "2026-07-10",
    "draft": 1,
    "dispatched": 1,
    "completed": 0,
    "cancelled": 0
  },
  {
    "date": "2026-07-11",
    "draft": 0,
    "dispatched": 0,
    "completed": 3,
    "cancelled": 1
  },
  {
    "date": "2026-07-12",
    "draft": 1,
    "dispatched": 1,
    "completed": 0,
    "cancelled": 0
  }
]
```

---

## 13. Frontend → API Map

```mermaid
flowchart LR
    subgraph FE["Frontend Pages"]
        Login
        Dashboard
        Vehicles
        Drivers
        Trips
        Maintenance
        Expenses
    end

    subgraph API["API Endpoints"]
        A1["POST /auth/login"]
        A2["GET /dashboard/stats\nGET /dashboard/fleet-status\nGET /dashboard/trip-activity\nGET /trips (recent 5)"]
        A3["GET /vehicles\nPOST /vehicles\nPUT /vehicles/id\nDELETE /vehicles/id\nPATCH /vehicles/id/status"]
        A4["GET /drivers\nPOST /drivers\nPUT /drivers/id\nDELETE /drivers/id"]
        A5["GET /trips\nPOST /trips\nPATCH /trips/id/dispatch\nPATCH /trips/id/complete\nPATCH /trips/id/cancel"]
        A6["GET /maintenance\nPOST /maintenance\nPUT /maintenance/id\nPATCH /maintenance/id/complete\nDELETE /maintenance/id"]
        A7["GET /fuel-logs\nPOST /fuel-logs\nDELETE /fuel-logs/id\nGET /expenses\nPOST /expenses\nDELETE /expenses/id"]
        AL["GET /lookup/*\n(all 5 endpoints)"]
    end

    Login --> A1
    Dashboard --> A2
    Vehicles --> A3
    Drivers --> A4
    Trips --> A5
    Maintenance --> A6
    Expenses --> A7
    Vehicles & Drivers & Trips & Maintenance & Expenses --> AL
```

### Lookup Data Loading Strategy

Lookup endpoints (`/api/lookup/*`) are called **once on app load** and stored in React state. This populates dropdowns in all Add/Edit forms without repeated API calls:

```typescript
// Called in AppLayout.tsx on mount:
const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
const [regions, setRegions] = useState<Region[]>([])

useEffect(() => {
  api.get('/lookup/vehicle-types').then(res => setVehicleTypes(res.data))
  api.get('/lookup/regions').then(res => setRegions(res.data))
  // ... etc
}, [])
```
