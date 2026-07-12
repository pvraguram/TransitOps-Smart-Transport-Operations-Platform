# TransitOps — Backend Architecture

**Version:** 1.1.0
**Date:** 2026-07-12
**Stack:** FastAPI · Python 3.11+ · SQLAlchemy 2 · Pydantic v2 · PostgreSQL 18 · python-jose JWT · passlib bcrypt · Uvicorn

> This document has been synced against the code in `backend/app/` as of 2026-07-12. See `API.md` for the
> authoritative, verified endpoint reference and `DATABASE.md` §7 for the schema sync notes.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Module Structure](#2-module-structure)
3. [Layer Architecture](#3-layer-architecture)
4. [Request Lifecycle](#4-request-lifecycle)
5. [ORM Models](#5-orm-models)
6. [Pydantic Schemas](#6-pydantic-schemas)
7. [Dependency Injection](#7-dependency-injection)
8. [Authentication & Security](#8-authentication--security)
9. [API Routers](#9-api-routers)
10. [Database Connection & Startup](#10-database-connection--startup)
11. [Seeding](#11-seeding)
12. [Error Handling](#12-error-handling)
13. [CORS Configuration](#13-cors-configuration)
14. [How to Run](#14-how-to-run)
15. [Known Gaps](#15-known-gaps)

---

## 1. Overview

The TransitOps backend is a **RESTful API** built with **FastAPI**. It follows a clean, if intentionally thin,
layered architecture:

```
HTTP Request
    │
    ▼
Router Layer       → Receives HTTP request, validates with Pydantic schema
    │
    ▼
Business logic     → Inline in router functions (no separate service layer)
    │
    ▼
ORM Layer          → SQLAlchemy queries against PostgreSQL models
    │
    ▼
PostgreSQL 18       → Stores and retrieves data
    │
    ▼
HTTP Response       → Serialized via Pydantic response schema
```

FastAPI auto-generates interactive **Swagger UI** at `http://localhost:8000/docs`.

---

## 2. Module Structure

```
backend/
├── create_db.py                  # One-off script: creates the `transitops` database if missing
├── requirements.txt
├── .env / .env.example           # DATABASE_URL, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
└── app/
    ├── main.py                   # FastAPI app, router registration, startup hook (calls init_db())
    │
    ├── core/
    │   ├── config.py             # Settings loaded from .env via Pydantic BaseSettings
    │   └── deps.py                # get_db(), get_current_user() — get_current_user is defined but
    │                              # not currently applied to any route, see §7
    │
    ├── db/
    │   ├── database.py           # SQLAlchemy engine, SessionLocal, get_db()
    │   └── init_db.py            # Creates all tables + seeds reference data and one admin
    │                              # user/vehicle/driver; called from main.py's startup event
    │
    ├── models/                   # SQLAlchemy ORM models (map to DB tables)
    │   ├── __init__.py           # empty — package marker only
    │   ├── base.py                # declarative Base
    │   ├── enums.py               # VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus,
    │   │                          # MaintenanceType, ExpenseType
    │   ├── core.py                # User, Vehicle, Driver, Trip, MaintenanceRecord, FuelLog, Expense
    │   └── lookups.py             # Region, VehicleType, LicenseCategory (reference tables)
    │
    ├── schemas/                  # Pydantic request/response schemas, one file per domain
    │   ├── __init__.py
    │   ├── user.py                # UserCreate, UserResponse, Token
    │   ├── vehicle.py             # VehicleCreate, VehicleResponse
    │   ├── driver.py              # DriverCreate, DriverResponse
    │   ├── trip.py                # TripCreate, TripDispatch, TripResponse
    │   ├── maintenance.py         # MaintenanceCreate, MaintenanceResponse
    │   ├── expense.py             # ExpenseCreate/Response, FuelLogCreate/Response
    │   └── analytics.py           # DashboardStats
    │
    └── api/
        └── routes/                # FastAPI APIRouter per domain
            ├── __init__.py
            ├── auth.py            # /api/auth/register, /login
            ├── lookup.py          # /api/lookup/* (reference data)
            ├── vehicles.py        # /api/vehicles — GET, POST only
            ├── drivers.py         # /api/drivers — GET, POST only
            ├── trips.py           # /api/trips — GET, POST /dispatch, PUT /{id}/status
            ├── maintenance.py     # /api/maintenance — GET, POST, PUT /{id}/status
            ├── expenses.py        # /api/expenses (+ /fuel) — GET, POST only
            └── analytics.py       # /api/analytics/dashboard
```

There is no `dashboard.py`, `security.py`, or `seed.py` in the codebase — password hashing/JWT logic lives
inline in `auth.py` and `init_db.py`, and dashboard stats are served by `analytics.py`.

---

## 3. Layer Architecture

```mermaid
graph TD
    subgraph Presentation["Presentation Layer — api/routes/"]
        R1[auth.py]
        R2[vehicles.py]
        R3[drivers.py]
        R4[trips.py]
        R5[maintenance.py]
        R6[expenses.py]
        R7[analytics.py]
        R8[lookup.py]
    end

    subgraph Validation["Validation Layer — schemas/"]
        S1[user.py]
        S2[vehicle.py]
        S3[driver.py]
        S4[trip.py]
        S5[maintenance.py]
        S6[expense.py]
        S7[analytics.py]
    end

    subgraph ORM["ORM Layer — models/"]
        M1[core.py\nUser, Vehicle, Driver,\nTrip, MaintenanceRecord,\nFuelLog, Expense]
        M2[lookups.py\nRegion, VehicleType,\nLicenseCategory]
        M3[enums.py]
    end

    subgraph Core["Core / Infrastructure"]
        DB[db/database.py\nEngine + SessionLocal]
        Init[db/init_db.py\ncreate_all + seed]
        Config[core/config.py\nSettings]
        Deps[core/deps.py\nget_db, get_current_user]
    end

    subgraph Database["PostgreSQL 18"]
        PG[(transitops DB)]
    end

    Presentation --> Validation
    Presentation --> ORM
    ORM --> Core
    Core --> Database
    Deps --> DB
```

---

## 4. Request Lifecycle

```mermaid
sequenceDiagram
    participant Browser
    participant Uvicorn as Uvicorn (ASGI server)
    participant CORS as CORS Middleware
    participant Router as FastAPI Router (vehicles.py)
    participant Deps as get_db() (deps.py)
    participant Schema as Pydantic Schema
    participant ORM as SQLAlchemy ORM
    participant PG as PostgreSQL 18

    Browser->>Uvicorn: GET /api/vehicles
    Uvicorn->>CORS: check Origin header
    CORS-->>Uvicorn: allowed (allow_origins=["*"])
    Uvicorn->>Router: route matched -> get_vehicles()
    Router->>Deps: inject get_db() -> Session
    Router->>ORM: db.query(Vehicle).all()
    ORM->>PG: SELECT * FROM vehicles
    PG-->>ORM: rows
    ORM-->>Router: List[Vehicle]
    Router->>Schema: serialize via VehicleResponse
    Schema-->>Router: JSON-serializable dicts
    Router-->>Browser: 200 OK [{ id, registration_number, ... }]
```

No JWT verification currently happens on this path — see §7 and §15.

---

## 5. ORM Models

SQLAlchemy models live in `app/models/core.py` (core entities) and `app/models/lookups.py` (reference
tables). All are declared against a single `Base` from `app/models/base.py`.

### Vehicle (app/models/core.py)

```python
class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    name_model = Column(String, nullable=False)
    type = Column(String, nullable=False)              # free-text, e.g. "Van" — not a lookup FK
    max_load_capacity = Column(Float, default=0.0)
    status = Column(SQLEnum(VehicleStatus), default=VehicleStatus.available, nullable=False)
    odometer = Column(Float, default=0.0)
    acquisition_cost = Column(Float, default=0.0)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=True)

    region = relationship("Region")
    trips = relationship("Trip", back_populates="vehicle")
    maintenance_records = relationship("MaintenanceRecord", back_populates="vehicle")
    fuel_logs = relationship("FuelLog", back_populates="vehicle")
```

### Model → Table Mapping

| Python Class | PostgreSQL Table | Key Relationships |
|---|---|---|
| `User` | `users` | — |
| `Region` | `regions` | ← `Vehicle.region_id`, `Driver.region_id` (both nullable) |
| `VehicleType` | `vehicle_types` | reference data only — not a foreign key on `Vehicle` today |
| `LicenseCategory` | `license_categories` | reference data only — not a foreign key on `Driver` today |
| `Vehicle` | `vehicles` | → `Trip`, `MaintenanceRecord`, `FuelLog` |
| `Driver` | `drivers` | → `Trip` |
| `Trip` | `trips` | → `Expense` |
| `MaintenanceRecord` | `maintenance_records` | belongs to `Vehicle` |
| `FuelLog` | `fuel_logs` | belongs to `Vehicle` |
| `Expense` | `expenses` | belongs to `Trip` |

`MaintenanceRecord.type` and `Expense.type` use the `MaintenanceType`/`ExpenseType` **enums** directly
(`routine|repair|inspection`, `toll|parking|fine|other`) — there is no `maintenance_types` or
`expense_categories` table.

---

## 6. Pydantic Schemas

Schemas validate request bodies and shape response payloads, kept separate from the ORM models.

### schemas/vehicle.py

```python
class VehicleBase(BaseModel):
    registration_number: str
    name_model: str
    type: str
    max_load_capacity: float
    status: Optional[VehicleStatus] = VehicleStatus.available
    odometer: Optional[float] = 0
    acquisition_cost: Optional[float] = 0.0
    region_id: Optional[int] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleResponse(VehicleBase):
    id: int
    class Config:
        from_attributes = True
```

There is no `VehicleUpdate` or status-only PATCH schema — vehicles can only be created and listed today.

---

## 7. Dependency Injection

### get_db() — Database Session

```python
# db/database.py
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### get_current_user() — JWT Auth Guard (defined, not enforced)

```python
# core/deps.py
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    return user
```

`get_current_user` exists and works, but **no router currently declares** `Depends(get_current_user)` on
any route. Every endpoint except login/register is reachable without a token today — see §15.

---

## 8. Authentication & Security

### Login flow (api/routes/auth.py)

```mermaid
flowchart TD
    Login["POST /auth/login\n{ email, password }"]
    Lookup["db.query(User)\nWHERE email = ?"]
    Verify["passlib.bcrypt\nverify(password, hashed_password)"]
    Create["python-jose\njwt.encode({ sub: email })"]
    Return["{ access_token, token_type: 'bearer' }"]

    Login --> Lookup
    Lookup -->|"User found"| Verify
    Verify -->|"Password correct"| Create
    Create --> Return
    Verify -->|"Wrong password"| HTTP401["401 Invalid credentials"]
    Lookup -->|"User not found"| HTTP401
```

### Security Layers

| Layer | Implementation | Purpose |
|---|---|---|
| Password hashing | `passlib[bcrypt]` (in `auth.py` / `init_db.py`) | One-way hash, never stores plain password |
| Token signing | `python-jose` HS256 | Tamper-proof JWT |
| Token payload | `{"sub": "<email>"}` only | **No `exp` claim is set** — tokens do not expire (see §15) |
| CORS | `CORSMiddleware`, `allow_origins=["*"]`, `allow_credentials=False` | Open by design for local dev |
| Secret key | `.env` file, read via `core/config.py` | Never committed to git |
| Input validation | Pydantic v2 schemas | Rejects malformed requests (422) |

### ENV Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/transitops
SECRET_KEY=64-character-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

`ACCESS_TOKEN_EXPIRE_MINUTES` is read into `Settings` but **not currently used** when encoding the JWT — the
setting exists but has no effect until `auth.py` is updated to add an `exp` claim.

---

## 9. API Routers

```python
# main.py
from app.api.routes import auth, vehicles, drivers, trips, maintenance, expenses, analytics, lookup
from app.db.init_db import init_db

app = FastAPI(title="TransitOps API")

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(auth.router,        prefix="/api/auth",        tags=["auth"])
app.include_router(vehicles.router,    prefix="/api/vehicles",    tags=["vehicles"])
app.include_router(drivers.router,     prefix="/api/drivers",     tags=["drivers"])
app.include_router(trips.router,       prefix="/api/trips",       tags=["trips"])
app.include_router(maintenance.router, prefix="/api/maintenance", tags=["maintenance"])
app.include_router(expenses.router,    prefix="/api/expenses",    tags=["expenses"])
app.include_router(analytics.router,   prefix="/api/analytics",   tags=["analytics"])
app.include_router(lookup.router,      prefix="/api/lookup",      tags=["lookup"])
```

### Router pattern: vehicles.py

```python
router = APIRouter()

@router.get("/", response_model=List[VehicleResponse])
def get_vehicles(status: Optional[VehicleStatus] = None, type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Vehicle)
    if status: query = query.filter(Vehicle.status == status)
    if type: query = query.filter(Vehicle.type == type)
    return query.all()

@router.post("/", response_model=VehicleResponse)
def create_vehicle(vehicle_in: VehicleCreate, db: Session = Depends(get_db)):
    existing = db.query(Vehicle).filter(Vehicle.registration_number == vehicle_in.registration_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Registration number already exists")
    vehicle = Vehicle(**vehicle_in.dict())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle
```

Drivers follow the identical GET/POST-only pattern. There is no `PUT /{id}`, `PATCH /{id}/status`, or
`DELETE /{id}` for either resource.

### Trip dispatch side-effects (trips.py)

```mermaid
flowchart TD
    Dispatch["POST /trips/dispatch"]
    Checks["Validate: vehicle & driver exist,\ncargo <= capacity, vehicle available,\ndriver not suspended,\nlicense not expired, driver available"]
    Create["Create Trip\nstatus = dispatched"]
    UpdateVehicle["vehicle.status = on_trip"]
    UpdateDriver["driver.status = on_trip"]
    Commit["db.commit()"]
    Return200["200 OK — created trip"]
    Error4xx["400/404 — validation message in `detail`"]

    Dispatch --> Checks
    Checks -->|"pass"| Create
    Create --> UpdateVehicle --> UpdateDriver --> Commit --> Return200
    Checks -->|"fail"| Error4xx
```

Completing/cancelling a trip is `PUT /api/trips/{id}/status?status=completed|cancelled`, which resets the
linked vehicle and driver back to `available`.

---

## 10. Database Connection & Startup

```python
# db/database.py
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

```python
# main.py
@app.on_event("startup")
def on_startup():
    init_db()   # Base.metadata.create_all(bind=engine) + seed data if tables are empty
```

`init_db()` runs on **every** server startup. It only creates tables that don't already exist
(`create_all` never alters existing tables) and only seeds rows if the relevant table is currently empty —
so it's safe to restart the server repeatedly without duplicating seed data.

---

## 11. Seeding

`app/db/init_db.py` seeds, in order, only if each target table is empty:

```mermaid
graph TD
    Init["init_db()"]
    Init --> Tables["Base.metadata.create_all()"]
    Tables --> Regions["3 Regions\nDelhi NCR, Mumbai Metro, Bangalore Hub"]
    Regions --> Types["3 Vehicle Types\nHeavy Truck, Light Commercial, Van"]
    Types --> Cats["2 License Categories\nHMV, LMV"]
    Cats --> Admin["1 Admin User\nadmin@transitops.com / admin123"]
    Admin --> Vehicle["1 Vehicle\nKA-01-AB-1234"]
    Vehicle --> Driver["1 Driver\nRamesh Kumar"]
```

Each seed step is individually guarded (`if not db.query(Model).first(): ...`), so partial data (e.g. an
admin user created manually) won't be duplicated or overwritten on the next restart.

---

## 12. Error Handling

All route errors use FastAPI's `HTTPException`:

| Scenario | Status Code | Detail |
|---|---|---|
| Resource not found | 404 | `"Vehicle not found"` / `"Driver not found"` / `"Trip not found"` / `"Record not found"` |
| Invalid credentials | 401 | `"Invalid credentials"` |
| Duplicate registration number | 400 | `"Registration number already exists"` |
| Duplicate email on register | 400 | `"Email already registered"` |
| Trip dispatch business-rule violation | 400 | e.g. `"Overloaded"`, `"Vehicle not available"`, `"Driver is suspended"`, `"Driver license expired"` |
| Pydantic validation failure | 422 | Auto-generated by FastAPI |
| Response serialization failure | 500 | Indicates a schema/model mismatch — see `API.md` for verified-working shapes |

---

## 13. CORS Configuration

```python
# main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

`allow_credentials=False` is intentional: the frontend sends the JWT via an `Authorization` header (not
cookies), so credentialed CORS isn't needed, and the spec forbids combining a wildcard origin with
`allow_credentials=True` anyway.

---

## 14. How to Run

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env
# Edit .env: set DATABASE_URL with your PostgreSQL credentials

# 5. Ensure the database exists (reads DATABASE_URL from .env)
python create_db.py

# 6. Start the server
uvicorn app.main:app --reload --port 8000

# Server: http://localhost:8000
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

On every startup, `on_startup()` calls `init_db()`, which:
1. Connects to PostgreSQL
2. Creates any missing tables (`Base.metadata.create_all()`)
3. Seeds reference data + one admin user/vehicle/driver if those tables are empty
4. The server is then ready to accept requests

Default login after seeding: `admin@transitops.com` / `admin123`

---

## 15. Known Gaps

Documented here rather than silently glossed over, since they affect anyone extending the API:

- **No route enforces authentication.** `get_current_user` works correctly if wired in, but zero routers
  currently apply it — every `/api/*` endpoint except `/auth/*` is open.
- **JWTs never expire.** No `exp` claim is set on token creation, so `ACCESS_TOKEN_EXPIRE_MINUTES` is
  currently inert.
- **No update/delete for Vehicles, Drivers, or Expenses.** Only Trips and Maintenance have a status-update
  route; nothing can be edited or removed once created via the API.
- **`vehicle_types` / `license_categories` are unused as foreign keys.** They're seeded and exposed via
  `/api/lookup/*` but `Vehicle.type` / `Driver.license_category` are plain strings — see `DATABASE.md` §7.
