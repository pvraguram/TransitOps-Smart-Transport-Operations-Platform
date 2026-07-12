# TransitOps — Backend Architecture

**Version:** 1.0.0
**Date:** 2026-07-12
**Stack:** FastAPI · Python 3.11+ · SQLAlchemy 2 · Pydantic v2 · PostgreSQL 18 · python-jose JWT · passlib bcrypt · Uvicorn

---

## Table of Contents

1. [Overview](#overview)
2. [Module Structure](#module-structure)
3. [Layer Architecture](#layer-architecture)
4. [Request Lifecycle](#request-lifecycle)
5. [ORM Models](#orm-models)
6. [Pydantic Schemas](#pydantic-schemas)
7. [Dependency Injection](#dependency-injection)
8. [Authentication & Security](#authentication--security)
9. [API Routers](#api-routers)
10. [Database Connection](#database-connection)
11. [Seeder](#seeder)
12. [Error Handling](#error-handling)
13. [CORS Configuration](#cors-configuration)
14. [How to Run](#how-to-run)

---

## 1. Overview

The TransitOps backend is a **RESTful API** built with **FastAPI**, a modern Python web framework. It follows a clean **layered architecture**:

```
HTTP Request
    │
    ▼
Router Layer       → Receives HTTP request, validates with Pydantic schema
    │
    ▼
Service Logic      → Business rules inside router functions (simple for hackathon)
    │
    ▼
ORM Layer          → SQLAlchemy queries against PostgreSQL models
    │
    ▼
PostgreSQL 18      → Stores and retrieves data
    │
    ▼
HTTP Response      → Serialized via Pydantic response schema
```

FastAPI auto-generates interactive **Swagger UI** at `http://localhost:8000/docs` — every endpoint is immediately testable without any frontend.

---

## 2. Module Structure

```
backend/
├── app/
│   ├── main.py                   # FastAPI app, router registration, startup
│   │
│   ├── core/
│   │   ├── config.py             # Settings loaded from .env via Pydantic BaseSettings
│   │   ├── security.py           # JWT encode/decode, bcrypt password hashing
│   │   └── deps.py               # FastAPI dependencies: get_db(), get_current_user()
│   │
│   ├── db/
│   │   ├── database.py           # SQLAlchemy engine, SessionLocal, Base
│   │   └── seed.py               # Auto-seeder: runs if tables are empty on startup
│   │
│   ├── models/                   # SQLAlchemy ORM models (map to DB tables)
│   │   ├── __init__.py           # Imports all models so create_all() sees them
│   │   ├── enums.py              # Python Enum classes for status fields
│   │   ├── lookup.py             # VehicleType, Region, LicenseCategory, etc.
│   │   ├── user.py               # User model
│   │   ├── vehicle.py            # Vehicle model
│   │   ├── driver.py             # Driver model
│   │   ├── trip.py               # Trip model
│   │   ├── maintenance.py        # MaintenanceRecord model
│   │   └── expense.py            # FuelLog + Expense models
│   │
│   ├── schemas/                  # Pydantic schemas (request/response shapes)
│   │   ├── __init__.py
│   │   ├── user.py               # UserCreate, UserOut, LoginRequest, Token
│   │   ├── vehicle.py            # VehicleCreate, VehicleUpdate, VehicleOut
│   │   ├── driver.py             # DriverCreate, DriverUpdate, DriverOut
│   │   ├── trip.py               # TripCreate, TripOut, TripStatusUpdate
│   │   ├── maintenance.py        # MaintenanceCreate, MaintenanceOut
│   │   └── expense.py            # FuelLogCreate, FuelLogOut, ExpenseCreate, ExpenseOut
│   │
│   └── api/
│       └── routes/               # FastAPI APIRouter per domain
│           ├── __init__.py
│           ├── auth.py           # /api/auth/register, /login, /me
│           ├── lookup.py         # /api/lookup/* (reference data for dropdowns)
│           ├── vehicles.py       # /api/vehicles CRUD
│           ├── drivers.py        # /api/drivers CRUD
│           ├── trips.py          # /api/trips CRUD + status actions
│           ├── maintenance.py    # /api/maintenance CRUD + complete action
│           ├── expenses.py       # /api/fuel-logs + /api/expenses
│           └── dashboard.py      # /api/dashboard/stats, fleet-status, trip-activity
│
├── requirements.txt
└── .env.example
```

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
        R7[dashboard.py]
        R8[lookup.py]
    end

    subgraph Validation["Validation Layer — schemas/"]
        S1[user.py]
        S2[vehicle.py]
        S3[driver.py]
        S4[trip.py]
        S5[maintenance.py]
        S6[expense.py]
    end

    subgraph ORM["ORM Layer — models/"]
        M1[user.py]
        M2[vehicle.py]
        M3[driver.py]
        M4[trip.py]
        M5[maintenance.py]
        M6[expense.py]
        M7[lookup.py]
        M8[enums.py]
    end

    subgraph Core["Core / Infrastructure"]
        DB[db/database.py\nEngine + Session]
        Seed[db/seed.py\nAuto-seeder]
        Config[core/config.py\nSettings]
        Security[core/security.py\nJWT + bcrypt]
        Deps[core/deps.py\nget_db, get_current_user]
    end

    subgraph Database["PostgreSQL 18"]
        PG[(transitops DB)]
    end

    Presentation --> Validation
    Presentation --> ORM
    ORM --> Core
    Core --> Database
    Deps --> Security
    Deps --> DB
```

---

## 4. Request Lifecycle

```mermaid
sequenceDiagram
    participant Browser
    participant Uvicorn as Uvicorn\n(ASGI server)
    participant CORS as CORS\nMiddleware
    participant Router as FastAPI Router\n(vehicles.py)
    participant Deps as Dependency\nInjection\n(deps.py)
    participant JWT as JWT Decode\n(security.py)
    participant Schema as Pydantic\nSchema
    participant ORM as SQLAlchemy\nORM
    participant PG as PostgreSQL 18

    Browser->>Uvicorn: GET /api/vehicles\nAuthorization: Bearer eyJ...
    Uvicorn->>CORS: Check Origin header
    CORS-->>Uvicorn: Origin allowed ✓
    Uvicorn->>Router: Route matched → get_vehicles()
    Router->>Deps: Inject get_db() → Session
    Router->>Deps: Inject get_current_user(token)
    Deps->>JWT: decode_access_token(token)
    JWT-->>Deps: { sub: "1", email: "..." }
    Deps->>ORM: db.query(User).filter(id=1).first()
    ORM->>PG: SELECT * FROM users WHERE id=1
    PG-->>ORM: User row
    ORM-->>Deps: User object
    Deps-->>Router: current_user injected ✓
    Router->>ORM: db.query(Vehicle).all()
    ORM->>PG: SELECT vehicles.*, vt.name, r.name\nFROM vehicles\nJOIN vehicle_types vt...\nJOIN regions r...
    PG-->>ORM: Rows
    ORM-->>Router: List[Vehicle]
    Router->>Schema: Serialize via VehicleOut
    Schema-->>Router: JSON-serializable dicts
    Router-->>Browser: 200 OK\n[{ id, registration_number, ... }]
```

---

## 5. ORM Models

SQLAlchemy models define the database tables as Python classes. Each column is a SQLAlchemy `Column` with a type and constraints.

### Pattern: models/vehicle.py

```python
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
from app.models.enums import VehicleStatus

class Vehicle(Base):
    __tablename__ = "vehicles"

    id                  = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String(20), unique=True, nullable=False, index=True)
    name                = Column(String(100), nullable=False)
    vehicle_type_id     = Column(Integer, ForeignKey("vehicle_types.id"), nullable=False)
    max_load_capacity   = Column(Float, nullable=False)
    odometer            = Column(Float, default=0.0)
    acquisition_cost    = Column(Float, nullable=False)
    region_id           = Column(Integer, ForeignKey("regions.id"), nullable=False)
    status              = Column(Enum(VehicleStatus), default=VehicleStatus.available)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships (for joined loading)
    vehicle_type = relationship("VehicleType", back_populates="vehicles")
    region       = relationship("Region", back_populates="vehicles")
    trips        = relationship("Trip", back_populates="vehicle")
    maintenance  = relationship("MaintenanceRecord", back_populates="vehicle")
    fuel_logs    = relationship("FuelLog", back_populates="vehicle")
    expenses     = relationship("Expense", back_populates="vehicle")
```

### Model → Table Mapping

| Python Class | PostgreSQL Table | Key Relationships |
|---|---|---|
| `User` | `users` | — |
| `VehicleType` | `vehicle_types` | ← Vehicle.vehicle_type_id |
| `Region` | `regions` | ← Vehicle.region_id |
| `Vehicle` | `vehicles` | → Trip, Maintenance, FuelLog, Expense |
| `LicenseCategory` | `license_categories` | ← Driver.license_category_id |
| `Driver` | `drivers` | → Trip |
| `Trip` | `trips` | → FuelLog, Expense |
| `MaintenanceType` | `maintenance_types` | ← MaintenanceRecord.maintenance_type_id |
| `MaintenanceRecord` | `maintenance_records` | |
| `ExpenseCategory` | `expense_categories` | ← Expense.expense_category_id |
| `FuelLog` | `fuel_logs` | |
| `Expense` | `expenses` | |

---

## 6. Pydantic Schemas

Pydantic schemas define the **shape of HTTP request bodies and response payloads**. They are separate from SQLAlchemy models — this separation is intentional:

| Schema Type | Purpose | Direction |
|---|---|---|
| `VehicleCreate` | Validate incoming POST body | Request → API |
| `VehicleUpdate` | Validate incoming PUT body | Request → API |
| `VehicleOut` | Serialize response | API → Response |
| `VehicleStatusUpdate` | PATCH body (status only) | Request → API |

### Pattern: schemas/vehicle.py

```python
from pydantic import BaseModel, ConfigDict
from app.models.enums import VehicleStatus

class VehicleCreate(BaseModel):
    registration_number: str
    name: str
    vehicle_type_id: int
    max_load_capacity: float
    odometer: float = 0.0
    acquisition_cost: float
    region_id: int
    status: VehicleStatus = VehicleStatus.available

class VehicleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # Pydantic v2: read from ORM objects

    id: int
    registration_number: str
    name: str
    vehicle_type_id: int
    vehicle_type_name: str | None = None   # Joined from vehicle_types
    max_load_capacity: float
    odometer: float
    acquisition_cost: float
    region_id: int
    region_name: str | None = None         # Joined from regions
    status: VehicleStatus
    created_at: str
    updated_at: str
```

### Why Separate Models from Schemas?

```
                         Model (ORM)
                         └── Maps to DB table
                         └── Has relationships (lazy loading)
                         └── Used ONLY inside the backend

Pydantic Schema (In)     Schema (Out)
└── Validates request    └── Controls what gets sent to client
└── Rejects bad data     └── Can include joined/computed fields
└── Never exposes DB     └── Strips sensitive fields (e.g. hashed_password)
```

---

## 7. Dependency Injection

FastAPI's dependency injection (`Depends()`) is used for two critical concerns:

### get_db() — Database Session

```mermaid
flowchart LR
    Route["Route Function\ndef get_vehicles(db: Session = Depends(get_db))"]
    Deps["deps.py\nget_db()"]
    Session["SQLAlchemy\nSessionLocal()"]
    PG["PostgreSQL"]

    Route -->|"FastAPI injects"| Deps
    Deps --> Session
    Session --> PG
    PG --> Session
    Session -->|"yield db"| Route
    Route -->|"request ends"| Deps
    Deps -->|"db.close()"| Session
```

```python
# deps.py
def get_db():
    db = SessionLocal()
    try:
        yield db          # Inject the session into the route
    finally:
        db.close()        # Always close after request ends
```

### get_current_user() — JWT Auth Guard

```python
# deps.py
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    payload = decode_access_token(token)     # Raises 401 if invalid/expired
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user
```

Any route that needs auth simply adds `current_user: User = Depends(get_current_user)` to its signature — FastAPI handles everything automatically.

---

## 8. Authentication & Security

### JWT Token Creation (security.py)

```mermaid
flowchart TD
    Login["POST /auth/login\n{ email, password }"]
    Lookup["db.query(User)\nWHERE email = ?"]
    Verify["passlib.bcrypt\nverify(password, hash)"]
    Create["python-jose\njwt.encode({ sub, email, exp })"]
    Return["{ access_token, token_type, user }"]

    Login --> Lookup
    Lookup -->|"User found"| Verify
    Verify -->|"Password correct ✓"| Create
    Create --> Return
    Verify -->|"Wrong password ✗"| HTTP401["401 Unauthorized"]
    Lookup -->|"User not found"| HTTP401
```

### Security Layers

| Layer | Implementation | Purpose |
|---|---|---|
| Password hashing | `passlib[bcrypt]` | One-way hash, never stores plain password |
| Token signing | `python-jose[cryptography]` HS256 | Tamper-proof JWT |
| Token expiry | `exp` claim = now + 1440 min | Tokens auto-expire in 24h |
| CORS | `CORSMiddleware` | Only allows configured origins |
| Secret key | `.env` file only | Never committed to git |
| Input validation | Pydantic v2 schemas | Rejects malformed requests (422) |

### ENV Variables (never hardcode these)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/transitops
SECRET_KEY=64-character-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## 9. API Routers

Each domain has its own `APIRouter`. All routers are registered in `main.py` under the `/api` prefix.

```python
# main.py
from app.api.routes import auth, vehicles, drivers, trips, maintenance, expenses, dashboard, lookup

app.include_router(auth.router,        prefix="/api/auth",        tags=["Auth"])
app.include_router(lookup.router,      prefix="/api/lookup",      tags=["Lookup"])
app.include_router(vehicles.router,    prefix="/api/vehicles",    tags=["Vehicles"])
app.include_router(drivers.router,     prefix="/api/drivers",     tags=["Drivers"])
app.include_router(trips.router,       prefix="/api/trips",       tags=["Trips"])
app.include_router(maintenance.router, prefix="/api/maintenance", tags=["Maintenance"])
app.include_router(expenses.router,    prefix="/api",             tags=["Expenses"])
app.include_router(dashboard.router,   prefix="/api/dashboard",   tags=["Dashboard"])
```

### Router Pattern: vehicles.py

```python
router = APIRouter()

@router.get("/", response_model=List[VehicleOut])
def get_vehicles(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)   # ← JWT guard
):
    query = db.query(Vehicle)
    if status:
        query = query.filter(Vehicle.status == status)
    if search:
        query = query.filter(Vehicle.registration_number.ilike(f"%{search}%"))
    return query.all()

@router.post("/", response_model=VehicleOut, status_code=201)
def create_vehicle(vehicle: VehicleCreate, ...): ...

@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(vehicle_id: int, vehicle: VehicleCreate, ...): ...

@router.patch("/{vehicle_id}/status")
def update_vehicle_status(vehicle_id: int, status: VehicleStatusUpdate, ...): ...

@router.delete("/{vehicle_id}", status_code=204)
def delete_vehicle(vehicle_id: int, ...): ...
```

### Trip Status Side-Effects (trips.py)

```mermaid
flowchart TD
    Dispatch["PATCH /trips/id/dispatch"]
    CheckDraft{"trip.status\n== Draft?"}
    UpdateTrip["trip.status = Dispatched"]
    UpdateVehicle["vehicle.status = On Trip"]
    UpdateDriver["driver.status = On Trip"]
    Commit["db.commit()"]
    Return200["200 OK — updated trip"]
    Error422["422 — Invalid transition"]

    Dispatch --> CheckDraft
    CheckDraft -->|"Yes"| UpdateTrip
    UpdateTrip --> UpdateVehicle
    UpdateVehicle --> UpdateDriver
    UpdateDriver --> Commit
    Commit --> Return200
    CheckDraft -->|"No"| Error422
```

---

## 10. Database Connection (db/database.py)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# PostgreSQL connection via psycopg2 driver
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=5,           # connection pool
    max_overflow=10,       # extra connections if pool is full
    pool_pre_ping=True,    # test connection before using
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
```

### Startup: Table Creation

```python
# main.py - lifespan event
@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup:
    Base.metadata.create_all(bind=engine)  # Creates tables if they don't exist
    seed_data(next(get_db()))              # Seeds data if tables are empty
    yield
    # On shutdown: (cleanup if needed)
```

---

## 11. Seeder (db/seed.py)

The seeder runs automatically on first startup when tables are empty. It populates:

```mermaid
graph TD
    Seed["seed_data()"]
    Seed --> U["1 Admin User\nadmin@transitops.com / admin123"]
    Seed --> LT["Lookup Tables\nvehicle_types, regions,\nlicense_categories,\nmaintenance_types,\nexpense_categories"]
    Seed --> V["10 Vehicles\n(buses, trucks, vans)"]
    Seed --> D["8 Drivers\nwith license details"]
    Seed --> T["10 Trips\n(mixed statuses)"]
    Seed --> M["8 Maintenance Records"]
    Seed --> F["8 Fuel Logs"]
    Seed --> E["8 Expenses"]

    U --> Check{"users table\nempty?"}
    Check -->|"Yes — seed"| LT
    Check -->|"No — skip"| Skip["Skip seeding"]
```

---

## 12. Error Handling

All route errors use FastAPI's `HTTPException`:

| Scenario | Status Code | Detail |
|---|---|---|
| Resource not found | 404 | "Vehicle not found" |
| Invalid credentials | 401 | "Incorrect email or password" |
| Invalid/expired token | 401 | "Could not validate credentials" |
| Duplicate unique field | 409 | "Registration number already exists" |
| Invalid status transition | 422 | "Trip must be in Draft state to dispatch" |
| Pydantic validation failure | 422 | Auto-generated by FastAPI |
| Internal server error | 500 | "Internal server error" |

```python
# Example
vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
if not vehicle:
    raise HTTPException(status_code=404, detail="Vehicle not found")
```

---

## 13. CORS Configuration

FastAPI's `CORSMiddleware` allows the React frontend (port 5173) to communicate with the backend (port 8000):

```python
# main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 14. How to Run

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate    # Linux/Mac

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env
# Edit .env: set DATABASE_URL with your PostgreSQL password

# 5. Ensure PostgreSQL database exists
psql -U postgres -c "CREATE DATABASE transitops;"

# 6. Start the server
uvicorn app.main:app --reload --port 8000

# Server: http://localhost:8000
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

On first run, the server will:
1. Connect to PostgreSQL
2. Create all tables (`Base.metadata.create_all()`)
3. Run the seeder (since tables are empty)
4. Be ready to accept requests

Default login after seeding: `admin@transitops.com` / `admin123`
