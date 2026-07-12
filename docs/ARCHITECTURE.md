# TransitOps — System Architecture

**Version:** 1.0.0
**Date:** 2026-07-12
**Authors:** TransitOps Hackathon Team
**Stack:** React 18 · FastAPI · PostgreSQL 18 · SQLAlchemy 2 · JWT

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [C4 Container Diagram](#4-c4-container-diagram)
5. [Communication Protocol](#5-communication-protocol)
6. [Request Lifecycle](#6-request-lifecycle)
7. [Authentication Architecture](#7-authentication-architecture)
8. [Security Considerations](#8-security-considerations)
9. [Monorepo Structure](#9-monorepo-structure)
10. [Development Environment](#10-development-environment)
11. [Scalability Notes](#11-scalability-notes)

---

## 1. Executive Summary

**TransitOps** is a Smart Transport Operations Platform designed to give fleet managers a single, unified interface for managing the complete lifecycle of transport operations:

| Module | Responsibility |
|---|---|
| **Vehicles** | Register, track status, and manage the fleet |
| **Drivers** | Manage driver profiles, licenses, and safety scores |
| **Trips** | Create, dispatch, complete, and cancel trip assignments |
| **Maintenance** | Schedule and track vehicle maintenance records |
| **Fuel Logs** | Log fuel consumption per vehicle and trip |
| **Expenses** | Track operational costs by category |
| **Dashboard** | Real-time KPI cards and fleet analytics charts |

The system is built as a **3-tier web application** — a React SPA frontend, a FastAPI REST backend, and a PostgreSQL relational database — connected through a JSON over HTTP REST interface secured by JWT Bearer tokens.

---

## 2. System Architecture

### 2.1 Three-Tier Architecture

```mermaid
graph TD
    subgraph Tier1["Tier 1 — Presentation Layer"]
        Browser["🌐 Browser\nReact 18 + TypeScript\nVite Dev Server :5173"]
    end

    subgraph Tier2["Tier 2 — Application Layer"]
        FastAPI["⚙️ FastAPI Server\nPython 3.11+\nUvicorn ASGI :8000"]
        subgraph Modules["API Modules"]
            Auth["auth.py"]
            Vehicles["vehicles.py"]
            Drivers["drivers.py"]
            Trips["trips.py"]
            Maint["maintenance.py"]
            Exp["expenses.py"]
            Dash["dashboard.py"]
            Lookup["lookup.py"]
        end
        FastAPI --- Modules
    end

    subgraph Tier3["Tier 3 — Data Layer"]
        PG["🗄️ PostgreSQL 18\n:5432\ntransitops database"]
        subgraph Tables["Core Tables"]
            T1["users"]
            T2["vehicles"]
            T3["drivers"]
            T4["trips"]
            T5["maintenance_records"]
            T6["fuel_logs"]
            T7["expenses"]
        end
        PG --- Tables
    end

    Browser -->|"REST / JSON\nHTTP + JWT Bearer"| FastAPI
    FastAPI -->|"SQLAlchemy ORM\npsycopg2 driver"| PG

    style Tier1 fill:#EFF6FF,stroke:#2563EB
    style Tier2 fill:#F0FDF4,stroke:#16A34A
    style Tier3 fill:#FFF7ED,stroke:#EA580C
```

### 2.2 Tier Responsibilities

| Tier | Technology | Responsibility |
|---|---|---|
| **Presentation** | React + Vite | Render UI, manage local state, call API via Axios |
| **Application** | FastAPI + SQLAlchemy | Validate requests, apply business logic, query DB |
| **Data** | PostgreSQL 18 | Store, enforce integrity, and retrieve persistent data |

---

## 3. Technology Stack

### Frontend

| Library | Version | Why Chosen |
|---|---|---|
| **React** | 18 | Industry-standard UI library; component model maps naturally to fleet entities |
| **TypeScript** | 5 | Catches type mismatches at compile time; shared types mirror the API schema |
| **Vite** | 5 | Sub-second HMR (Hot Module Replacement); fastest dev server available |
| **Tailwind CSS** | 3 | Utility-first CSS eliminates stylesheet overhead; consistent design tokens |
| **React Router** | 6 | Declarative client-side routing; nested routes power the AppLayout shell |
| **Axios** | 1 | HTTP client with interceptors; one place to inject JWT on every request |
| **Recharts** | 2 | React-native chart library; composable, typed, no extra DOM manipulation |
| **Lucide React** | latest | Consistent, lightweight SVG icon set; tree-shakable (no bloat) |

### Backend

| Library | Version | Why Chosen |
|---|---|---|
| **FastAPI** | 0.111 | Auto-generates Swagger UI; async-ready; Pydantic v2 native integration |
| **Python** | 3.11+ | Team-familiar; rich ecosystem; match statement for status transitions |
| **SQLAlchemy** | 2 | ORM abstracts SQL; same code works on PostgreSQL and SQLite for testing |
| **Pydantic v2** | 2.7 | Validation at the boundary; separates request shape from ORM model |
| **python-jose** | 3.3 | HS256 JWT creation and verification; compact, well-maintained |
| **passlib[bcrypt]** | 1.7 | bcrypt is the gold standard for password hashing; adaptive cost factor |
| **psycopg2-binary** | 2.9 | PostgreSQL adapter for Python; `binary` variant avoids compile dependencies |
| **Uvicorn** | 0.29 | ASGI server; `--reload` flag for dev; production-grade performance |
| **python-dotenv** | 1.0 | Reads `.env` into environment; zero-config secret management |

### Database

| Item | Choice | Reason |
|---|---|---|
| **Engine** | PostgreSQL 18 | ACID compliance, native ENUM types, rich constraint support, industry standard |
| **ORM** | SQLAlchemy 2 | Declarative models, relationship loading, connection pooling |
| **Driver** | psycopg2-binary | Most stable Python ↔ PostgreSQL connector |
| **Migrations** | `create_all()` | Sufficient for hackathon; Alembic can be added post-event |

---

## 4. C4 Container Diagram

```mermaid
graph LR
    User(["👤 Fleet Manager\n[Person]"])

    subgraph TransitOps["TransitOps System"]
        FE["React SPA\n[Container: JavaScript]\nVite + React + Tailwind\nPort 5173\n\nProvides the fleet management\nUI in the browser"]

        BE["FastAPI Server\n[Container: Python]\nFastAPI + SQLAlchemy\nPort 8000\n\nHandles all business logic,\nauth, and data access"]

        DB[("PostgreSQL 18\n[Container: Database]\nPort 5432\n\nStores all fleet data\nnormalized to 3NF")]
    end

    User -->|"Uses\n[HTTPS Browser]"| FE
    FE -->|"REST API calls\nJSON over HTTP\nAuthorization: Bearer JWT"| BE
    BE -->|"SQL queries\nvia psycopg2"| DB

    style FE fill:#DBEAFE,stroke:#2563EB,color:#1E3A8A
    style BE fill:#DCFCE7,stroke:#16A34A,color:#14532D
    style DB fill:#FEF3C7,stroke:#D97706,color:#78350F
```

---

## 5. Communication Protocol

### 5.1 REST over HTTP

All client–server communication follows REST conventions:

| HTTP Method | Semantic | Example |
|---|---|---|
| `GET` | Retrieve resources | `GET /api/vehicles` |
| `POST` | Create a resource | `POST /api/vehicles` |
| `PUT` | Full update of a resource | `PUT /api/vehicles/1` |
| `PATCH` | Partial update / status action | `PATCH /api/trips/1/dispatch` |
| `DELETE` | Remove a resource | `DELETE /api/vehicles/1` |

### 5.2 Request / Response Format

```
Content-Type: application/json
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...  (all protected routes)
```

**Success responses:**
- `200 OK` — resource returned
- `201 Created` — resource created (POST)
- `204 No Content` — deleted (DELETE)

**Error response body:**
```json
{
  "detail": "Vehicle not found"
}
```

### 5.3 CORS Policy

The FastAPI backend allows the React dev server origin:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

In production this should be restricted to the deployed frontend domain.

---

## 6. Request Lifecycle

```mermaid
sequenceDiagram
    actor User
    participant React as React Component
    participant Axios as Axios (api.ts)\nInterceptor
    participant CORS as FastAPI\nCORS Middleware
    participant Router as FastAPI Router\n(e.g. vehicles.py)
    participant Deps as Dependency\nInjection (deps.py)
    participant Security as security.py\nJWT decode
    participant ORM as SQLAlchemy ORM
    participant PG as PostgreSQL 18

    User->>React: Clicks "Add Vehicle" / views page
    React->>Axios: vehicleService.getAll()
    Axios->>Axios: interceptor reads localStorage token
    Axios->>CORS: GET /api/vehicles\nAuthorization: Bearer eyJ...
    CORS->>CORS: Check Origin → allowed ✓
    CORS->>Router: Forward request
    Router->>Deps: get_current_user(token)
    Deps->>Security: decode_access_token(token)
    Security-->>Deps: { sub: "1", email: "admin@..." }
    Deps->>ORM: db.query(User).filter(id=1)
    ORM->>PG: SELECT * FROM users WHERE id=1
    PG-->>ORM: User row
    ORM-->>Deps: User object ✓
    Deps-->>Router: current_user injected
    Router->>ORM: db.query(Vehicle).all()
    ORM->>PG: SELECT v.*, vt.name, r.name\nFROM vehicles v\nJOIN vehicle_types vt ON v.vehicle_type_id=vt.id\nJOIN regions r ON v.region_id=r.id
    PG-->>ORM: Result rows
    ORM-->>Router: List[Vehicle]
    Router->>Router: Serialize via VehicleOut schema
    Router-->>Axios: 200 OK [ {...}, {...} ]
    Axios-->>React: response.data
    React->>React: setVehicles(data)
    React->>User: Table renders with vehicle rows
```

---

## 7. Authentication Architecture

### 7.1 Login Flow

```mermaid
sequenceDiagram
    actor User
    participant Login as Login Page\n(React)
    participant AuthCtx as AuthContext
    participant Axios as api.ts
    participant FastAPI as FastAPI /auth/login
    participant DB as PostgreSQL

    User->>Login: email + password
    Login->>AuthCtx: login(email, password)
    AuthCtx->>Axios: POST /api/auth/login\n{email, password}
    Axios->>FastAPI: HTTP POST
    FastAPI->>DB: SELECT * FROM users WHERE email=?
    DB-->>FastAPI: User row (with hashed_password)
    FastAPI->>FastAPI: bcrypt.verify(password, hashed_password)
    alt Credentials valid
        FastAPI->>FastAPI: jwt.encode({sub, email, exp})
        FastAPI-->>Axios: {access_token, token_type, user}
        Axios-->>AuthCtx: response.data
        AuthCtx->>AuthCtx: localStorage.setItem('token', access_token)\nsetUser(user)\nsetIsAuthenticated(true)
        AuthCtx-->>Login: success
        Login->>Login: navigate('/')
    else Invalid credentials
        FastAPI-->>Axios: 401 Unauthorized
        Axios-->>AuthCtx: error thrown
        AuthCtx-->>Login: error
        Login->>User: "Invalid email or password"
    end
```

### 7.2 JWT Structure

```json
Header: { "alg": "HS256", "typ": "JWT" }

Payload: {
  "sub": "1",
  "email": "admin@transitops.com",
  "exp": 1720886400
}

Signature: HMAC-SHA256(base64(header) + "." + base64(payload), SECRET_KEY)
```

### 7.3 Token Lifecycle

```mermaid
flowchart LR
    Login["POST /auth/login\nToken issued"] -->|"Valid 24 hours"| Active["Token Active\nAll requests succeed"]
    Active -->|"24h passes"| Expired["Token Expired\nFastAPI returns 401"]
    Expired -->|"Frontend catches 401"| Logout["AuthContext.logout()\nRedirect → /login"]
    Active -->|"User clicks Logout"| Logout
    Logout -->|"New login"| Login
```

---

## 8. Security Considerations

| Concern | Implementation | Detail |
|---|---|---|
| **Password Storage** | passlib bcrypt | One-way hash with adaptive salt; plain password never stored |
| **Token Signing** | python-jose HS256 | HMAC-SHA256; signature verification on every protected request |
| **Token Expiry** | `exp` claim | Tokens auto-expire in 24 hours (configurable) |
| **Input Validation** | Pydantic v2 | Invalid request bodies rejected with 422 before reaching DB |
| **SQL Injection** | SQLAlchemy ORM | Parameterized queries; raw SQL never used |
| **CORS** | CORSMiddleware | Only configured origins can call the API |
| **Secrets** | `.env` file | `SECRET_KEY`, `DATABASE_URL` never committed to git |
| **HTTPS** | Uvicorn + reverse proxy | In production: Nginx terminates TLS before FastAPI |

### What NOT to store in JWT

The JWT payload is **Base64-encoded, not encrypted** — anyone can decode it. Never put passwords, full user objects, or sensitive data in the payload. Only store: `sub` (user ID), `email`, and `exp`.

---

## 9. Monorepo Structure

```
TransitOps/                          ← Git repository root
│
├── README.md                        ← Quick-start guide
│
├── docs/                            ← Engineering documentation (this folder)
│   ├── ARCHITECTURE.md              ← System architecture (this document)
│   ├── DATABASE.md                  ← Database schema and ERD
│   ├── API.md                       ← Complete API reference
│   ├── FRONTEND.md                  ← Frontend component and routing architecture
│   └── BACKEND.md                   ← Backend module and layer architecture
│
├── frontend/                        ← React + Vite SPA
│   ├── index.html                   ← HTML entry point (loads Inter font)
│   ├── package.json                 ← npm dependencies
│   ├── tsconfig.json                ← TypeScript configuration (strict mode)
│   ├── vite.config.ts               ← Vite config with /api proxy to :8000
│   ├── tailwind.config.js           ← Design system color tokens
│   ├── postcss.config.js            ← Required by Tailwind
│   ├── .env.example                 ← VITE_API_BASE_URL template
│   └── src/
│       ├── App.tsx                  ← Root router (public + protected routes)
│       ├── main.tsx                 ← React DOM render entry
│       ├── index.css                ← Tailwind directives + global styles
│       ├── types/index.ts           ← ALL TypeScript interfaces (single source)
│       ├── data/mockData.ts         ← Realistic mock arrays (pre-backend)
│       ├── services/api.ts          ← Axios instance + all service functions
│       ├── context/AuthContext.tsx  ← Global auth state provider
│       ├── hooks/useAuth.ts         ← Consumes AuthContext
│       ├── layouts/AppLayout.tsx    ← Authenticated shell (sidebar + header)
│       ├── components/              ← Shared UI primitives
│       │   ├── Sidebar.tsx
│       │   ├── Header.tsx
│       │   ├── KpiCard.tsx
│       │   ├── DataTable.tsx
│       │   ├── StatusBadge.tsx
│       │   └── Modal.tsx
│       └── pages/                   ← Route-level pages
│           ├── Login.tsx
│           ├── Dashboard.tsx
│           ├── Vehicles.tsx
│           ├── Drivers.tsx
│           ├── Trips.tsx
│           ├── Maintenance.tsx
│           └── Expenses.tsx
│
└── backend/                         ← FastAPI REST API
    ├── requirements.txt             ← Python dependencies
    ├── .env.example                 ← DATABASE_URL + SECRET_KEY template
    └── app/
        ├── main.py                  ← App factory, router registration, startup
        ├── core/
        │   ├── config.py            ← Pydantic Settings (reads .env)
        │   ├── security.py          ← JWT + bcrypt utilities
        │   └── deps.py              ← get_db(), get_current_user() dependencies
        ├── db/
        │   ├── database.py          ← SQLAlchemy engine + SessionLocal + Base
        │   └── seed.py              ← Auto-seeder (runs if DB is empty)
        ├── models/                  ← SQLAlchemy ORM table classes
        │   ├── enums.py             ← Python Enum for status fields
        │   ├── lookup.py            ← Reference table models
        │   ├── user.py
        │   ├── vehicle.py
        │   ├── driver.py
        │   ├── trip.py
        │   ├── maintenance.py
        │   └── expense.py
        ├── schemas/                 ← Pydantic request/response schemas
        │   ├── user.py
        │   ├── vehicle.py
        │   ├── driver.py
        │   ├── trip.py
        │   ├── maintenance.py
        │   └── expense.py
        └── api/routes/              ← FastAPI APIRouter per domain
            ├── auth.py
            ├── lookup.py
            ├── vehicles.py
            ├── drivers.py
            ├── trips.py
            ├── maintenance.py
            ├── expenses.py
            └── dashboard.py
```

---

## 10. Development Environment

```mermaid
graph LR
    subgraph Dev["Developer Machine"]
        subgraph Terminal1["Terminal 1"]
            FE_CMD["cd frontend\nnpm run dev"]
            Vite["Vite Dev Server\nlocalhost:5173\nHMR enabled"]
            FE_CMD --> Vite
        end

        subgraph Terminal2["Terminal 2"]
            BE_CMD["cd backend\nuvicorn app.main:app --reload"]
            Uvicorn["Uvicorn\nlocalhost:8000\nAuto-reload on save"]
            BE_CMD --> Uvicorn
        end

        subgraph Terminal3["Terminal 3 (optional)"]
            PG_CMD["psql -U postgres\n-d transitops"]
            PSQL["PostgreSQL CLI\nlocalhost:5432"]
            PG_CMD --> PSQL
        end

        Vite -->|"API requests\nProxy: /api → :8000"| Uvicorn
        Uvicorn -->|"psycopg2\nSQL queries"| PSQL
    end

    Browser["🌐 Browser\nlocalhost:5173"] --> Vite
    Swagger["📋 Swagger UI\nlocalhost:8000/docs"] --> Uvicorn
```

### Vite Proxy

The `vite.config.ts` proxies all `/api` requests to the backend:
```
Browser request:  GET http://localhost:5173/api/vehicles
Vite proxies to:  GET http://localhost:8000/api/vehicles
```
This avoids CORS issues during development and means the frontend only ever speaks to `:5173`.

### Hot Reload

| Layer | Trigger | Reload |
|---|---|---|
| Frontend | Save any `.tsx` / `.ts` / `.css` file | Instant HMR (no full page reload) |
| Backend | Save any `.py` file | Uvicorn auto-restarts (< 1 second) |
| Database | Schema change | Restart backend → `create_all()` applies changes |

---

## 11. Scalability Notes

TransitOps is designed for a hackathon but the architecture supports scaling each tier independently.

### Frontend Scaling

| Strategy | How |
|---|---|
| Static CDN deployment | `npm run build` → deploy `/dist` to Vercel, Netlify, or S3+CloudFront |
| Code splitting | React Router lazy loading: `const Vehicles = lazy(() => import('./pages/Vehicles'))` |
| API caching | React Query or SWR can replace `useState` + `useEffect` for smart caching |

### Backend Scaling

| Strategy | How |
|---|---|
| Multiple workers | `uvicorn app.main:app --workers 4` (multi-process) |
| Async DB | Replace psycopg2 with asyncpg + SQLAlchemy async session |
| Load balancing | Nginx upstream to multiple Uvicorn instances |
| Background tasks | FastAPI `BackgroundTasks` or Celery for async jobs (e.g. email notifications) |

### Database Scaling

| Strategy | How |
|---|---|
| Read replicas | Route `GET` queries to read replicas via separate `DATABASE_READ_URL` |
| Connection pooling | PgBouncer in front of PostgreSQL reduces connection overhead |
| Indexes | Already planned on `registration_number`, `license_number`, `status` columns |
| Partitioning | `trips` and `fuel_logs` tables can be partitioned by `created_at` month |
