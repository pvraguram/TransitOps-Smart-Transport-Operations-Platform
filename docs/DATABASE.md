# TransitOps — Database Design

**Version:** 1.0.0
**Date:** 2026-07-12
**Database:** PostgreSQL 18
**ORM:** SQLAlchemy 2

---

## Table of Contents

1. [Overview](#1-overview)
2. [Why PostgreSQL](#2-why-postgresql)
3. [Database Design Philosophy](#3-database-design-philosophy)
4. [Normalization Analysis](#4-normalization-analysis)
5. [Complete Entity Relationship Diagram](#5-complete-entity-relationship-diagram)
6. [PostgreSQL ENUM Types](#6-postgresql-enum-types)
7. [Lookup / Reference Tables](#7-lookup--reference-tables)
8. [Core Tables](#8-core-tables)
9. [Foreign Key Dependency Map](#9-foreign-key-dependency-map)
10. [Index Strategy](#10-index-strategy)
11. [Data Integrity Rules](#11-data-integrity-rules)
12. [Connection Configuration](#12-connection-configuration)
13. [Seeder Strategy](#13-seeder-strategy)

---

## 1. Overview

The TransitOps database stores all operational fleet data across **10 tables**: 3 lookup/reference tables, 6 PostgreSQL ENUM types, and 7 core entity tables. `maintenance_types` and `expense_categories` are **not** DB tables — they're fixed Python enums (`MaintenanceType`, `ExpenseType` in `app/models/enums.py`) surfaced read-only via `GET /api/lookup/maintenance-types` and `/expense-types`.

| Category | Tables |
|---|---|
| **Lookup tables** | `vehicle_types`, `regions`, `license_categories` |
| **Core tables** | `users`, `vehicles`, `drivers`, `trips`, `maintenance_records`, `fuel_logs`, `expenses` |
| **ENUM types** | `vehiclestatus`, `driverstatus`, `tripstatus`, `maintenancestatus`, `maintenancetype`, `expensetype` |

> **Sync note (§4–9 below):** the normalization walkthrough that follows describes a fully-normalized design where
> `vehicles.vehicle_type_id` and `drivers.license_category_id` are foreign keys into `vehicle_types` /
> `license_categories`. The actual schema stores `vehicles.type` and `drivers.license_category` as plain strings
> instead — the lookup tables exist and are seeded, but nothing currently joins to them. This was a deliberate
> simplification to match what the Add-Vehicle/Add-Driver forms actually collect (a free-text/hardcoded-dropdown
> type, not a lookup ID). `vehicles.region_id` / `drivers.region_id` are nullable FKs into `regions` that are
> populated at seed time but not currently collected by either create form. Treat the FK-based examples below as
> the *rationale* for why lookup tables exist, not as the literal current schema — see `app/models/core.py` and
> `app/models/lookups.py` for ground truth.

---

## 2. Why PostgreSQL

| Criterion | PostgreSQL 18 | SQLite | MongoDB |
|---|---|---|---|
| **ACID compliance** | ✅ Full | ✅ Partial | ⚠️ Document-level |
| **Native ENUM types** | ✅ Yes | ❌ No (store as TEXT) | ❌ No |
| **Foreign key enforcement** | ✅ Always on | ⚠️ Off by default | ❌ No joins |
| **CHECK constraints** | ✅ Yes | ✅ Yes | ❌ No |
| **Concurrent writes** | ✅ MVCC | ⚠️ File-level lock | ✅ Yes |
| **Complex joins** | ✅ Optimized | ⚠️ Limited | ❌ No native joins |
| **Production readiness** | ✅ Industry standard | ❌ File-based only | ⚠️ Different model |
| **Connection pooling** | ✅ PgBouncer | ❌ N/A | ✅ Yes |

**Verdict:** PostgreSQL is the only choice that enforces ENUMs natively, handles complex multi-table joins efficiently, and is production-ready without architectural changes.

---

## 3. Database Design Philosophy

### Referential Integrity
Every foreign key relationship is enforced at the database level — not just in application code. If a vehicle is referenced by an active trip, it cannot be deleted without resolving the dependency first.

### ENUM Enforcement
Status fields (`vehicle_status`, `driver_status`, etc.) use **PostgreSQL native ENUM types**. The database itself rejects any value not in the defined set. This means a bug in application code can never corrupt the status column with an invalid string like `"Avalable"` (typo).

### Normalization Goal: 3NF
All tables satisfy **Third Normal Form** — every non-key attribute depends only on the primary key, with no transitive dependencies. This eliminates data redundancy and ensures consistency.

---

## 4. Normalization Analysis

### Definitions

**1NF (First Normal Form):**
- Every column contains atomic (indivisible) values
- No repeating groups or arrays in a column
- Each row is uniquely identified by a primary key

**2NF (Second Normal Form):**
- Satisfies 1NF
- Every non-key attribute is fully functionally dependent on the **whole** primary key
- (Only relevant when composite primary keys exist)

**3NF (Third Normal Form):**
- Satisfies 2NF
- No transitive dependencies: no non-key column depends on another non-key column
- Formally: for all FDs `X → Y`, either X is a superkey OR Y is a prime attribute

---

### Before Normalization (Denormalized Example)

A naive design might store everything in one `vehicles` table:

```
vehicles (BAD — violates 3NF)
┌────┬─────────────┬───────┬──────────┬──────────────┬─────────────┐
│ id │ reg_number  │ type  │ type_desc│ region       │ region_zone │
├────┼─────────────┼───────┼──────────┼──────────────┼─────────────┤
│  1 │ KAA 123A    │ Bus   │ Passenger│ Nairobi      │ Central     │
│  2 │ KAB 456B    │ Bus   │ Passenger│ Nairobi      │ Central     │
│  3 │ KAC 789C    │ Truck │ Cargo    │ Mombasa      │ Coast       │
└────┴─────────────┴───────┴──────────┴──────────────┴─────────────┘
```

**Problems:**
- `type_desc` depends on `type`, not on `id` → **transitive dependency** (violates 3NF)
- `region_zone` depends on `region`, not on `id` → **transitive dependency** (violates 3NF)
- If "Nairobi" changes to "Nairobi City", you update 100 rows → **update anomaly**
- Deleting all Nairobi vehicles loses the zone data → **deletion anomaly**

---

### After Normalization (3NF)

```
vehicle_types                  regions
┌────┬───────┬──────────┐     ┌────┬──────────┬──────────┐
│ id │ name  │ desc     │     │ id │ name     │ zone     │
├────┼───────┼──────────┤     ├────┼──────────┼──────────┤
│  1 │ Bus   │ Passenger│     │  1 │ Nairobi  │ Central  │
│  2 │ Truck │ Cargo    │     │  2 │ Mombasa  │ Coast    │
└────┴───────┴──────────┘     └────┴──────────┴──────────┘

vehicles (GOOD — satisfies 3NF)
┌────┬─────────────┬──────────────────┬───────────┐
│ id │ reg_number  │ vehicle_type_id  │ region_id │
├────┼─────────────┼──────────────────┼───────────┤
│  1 │ KAA 123A    │ 1 (→ Bus)        │ 1 (→ Nairobi) │
│  2 │ KAB 456B    │ 1 (→ Bus)        │ 1 (→ Nairobi) │
│  3 │ KAC 789C    │ 2 (→ Truck)      │ 2 (→ Mombasa) │
└────┴─────────────┴──────────────────┴───────────┘
```

**Functional dependency proof for `vehicles`:**
```
id → registration_number          (PK determines all)
id → name
id → vehicle_type_id              (FK — type details NOT stored here)
id → max_load_capacity
id → odometer
id → acquisition_cost
id → region_id                    (FK — region details NOT stored here)
id → status
id → created_at, updated_at

No transitive dependency:
  vehicle_type_id → (type name lives in vehicle_types, not here) ✓
  region_id → (region name lives in regions, not here) ✓
```

This same normalization pattern is applied to **every table** in the schema.

---

## 5. Complete Entity Relationship Diagram

```mermaid
erDiagram
    users {
        int id PK
        varchar_255 email UK
        varchar_255 hashed_password
        varchar_100 full_name
        boolean is_active
        timestamptz created_at
    }

    vehicle_types {
        int id PK
        varchar_50 name UK
    }

    regions {
        int id PK
        varchar_100 name UK
    }

    license_categories {
        int id PK
        varchar_2 code UK
        varchar_100 description
    }

    maintenance_types {
        int id PK
        varchar_50 name UK
    }

    expense_categories {
        int id PK
        varchar_50 name UK
    }

    vehicles {
        int id PK
        varchar_20 registration_number UK
        varchar_100 name
        int vehicle_type_id FK
        numeric max_load_capacity
        numeric odometer
        numeric acquisition_cost
        int region_id FK
        vehicle_status status
        timestamptz created_at
        timestamptz updated_at
    }

    drivers {
        int id PK
        varchar_100 name
        varchar_50 license_number UK
        int license_category_id FK
        date license_expiry
        varchar_20 contact_number
        numeric safety_score
        driver_status status
        timestamptz created_at
        timestamptz updated_at
    }

    trips {
        int id PK
        varchar_100 source
        varchar_100 destination
        int vehicle_id FK
        int driver_id FK
        numeric cargo_weight
        numeric planned_distance
        numeric revenue
        trip_status status
        timestamptz created_at
        timestamptz updated_at
    }

    maintenance_records {
        int id PK
        int vehicle_id FK
        int maintenance_type_id FK
        text description
        numeric estimated_cost
        numeric actual_cost
        date start_date
        maintenance_status status
        timestamptz created_at
    }

    fuel_logs {
        int id PK
        int vehicle_id FK
        int trip_id FK
        numeric fuel_litres
        numeric total_cost
        date date
        timestamptz created_at
    }

    expenses {
        int id PK
        int vehicle_id FK
        int trip_id FK
        int expense_category_id FK
        numeric amount
        text description
        date date
        timestamptz created_at
    }

    vehicle_types ||--o{ vehicles : "classifies"
    regions ||--o{ vehicles : "locates"
    license_categories ||--o{ drivers : "categorizes"
    maintenance_types ||--o{ maintenance_records : "classifies"
    expense_categories ||--o{ expenses : "categorizes"

    vehicles ||--o{ trips : "assigned to"
    drivers ||--o{ trips : "drives"
    vehicles ||--o{ maintenance_records : "serviced in"
    vehicles ||--o{ fuel_logs : "fueled"
    vehicles ||--o{ expenses : "incurs"
    trips |o--o{ fuel_logs : "linked to"
    trips |o--o{ expenses : "linked to"
```

---

## 6. PostgreSQL ENUM Types

PostgreSQL native ENUMs are used for all status fields. Unlike `VARCHAR`, ENUMs:
- Reject invalid values at the **database level** (not just application level)
- Are stored as integers internally (efficient storage)
- Appear as human-readable strings in queries
- Are enforced even if data is inserted via `psql` directly

### ENUM Definitions

```sql
-- Vehicle operational status
CREATE TYPE vehicle_status AS ENUM (
    'Available',   -- Ready to be assigned to a trip
    'On Trip',     -- Currently assigned to an active trip
    'In Shop',     -- Undergoing maintenance
    'Retired'      -- Permanently decommissioned
);

-- Driver operational status
CREATE TYPE driver_status AS ENUM (
    'Available',   -- Ready to be assigned
    'On Trip',     -- Currently on an active trip
    'Off Duty',    -- Temporarily unavailable
    'Suspended'    -- Disciplinary suspension
);

-- Trip lifecycle status
CREATE TYPE trip_status AS ENUM (
    'Draft',       -- Created but not yet dispatched
    'Dispatched',  -- Vehicle and driver assigned and en-route
    'Completed',   -- Trip successfully finished
    'Cancelled'    -- Trip cancelled before or during dispatch
);

-- Maintenance record status
CREATE TYPE maintenance_status AS ENUM (
    'Active',      -- Maintenance currently in progress
    'Completed'    -- Maintenance finished
);
```

### SQLAlchemy Python Equivalent

```python
# models/enums.py
import enum

class VehicleStatus(str, enum.Enum):
    available = "Available"
    on_trip   = "On Trip"
    in_shop   = "In Shop"
    retired   = "Retired"

class DriverStatus(str, enum.Enum):
    available = "Available"
    on_trip   = "On Trip"
    off_duty  = "Off Duty"
    suspended = "Suspended"

class TripStatus(str, enum.Enum):
    draft      = "Draft"
    dispatched = "Dispatched"
    completed  = "Completed"
    cancelled  = "Cancelled"

class MaintenanceStatus(str, enum.Enum):
    active    = "Active"
    completed = "Completed"
```

---

## 7. Lookup / Reference Tables

These tables store the allowed values for categorical fields. Other tables reference them via foreign keys.

### `vehicle_types`

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(50) | UNIQUE, NOT NULL |

**Seeded values:** Bus, Truck, Van, Motorcycle

### `regions`

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | UNIQUE, NOT NULL |

**Seeded values:** Nairobi, Mombasa, Kisumu, Nakuru, Eldoret

### `license_categories`

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| code | VARCHAR(2) | UNIQUE, NOT NULL |
| description | VARCHAR(100) | NOT NULL |

**Seeded values:**

| Code | Description |
|---|---|
| A | Motorcycles and light quadricycles |
| B | Light vehicles up to 3,500 kg |
| C | Heavy trucks over 3,500 kg |
| D | Passenger vehicles (buses, 9+ seats) |
| E | Articulated vehicles (truck + trailer) |

### `maintenance_types`

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(50) | UNIQUE, NOT NULL |

**Seeded values:** Preventive, Corrective, Emergency, Inspection

### `expense_categories`

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(50) | UNIQUE, NOT NULL |

**Seeded values:** Toll, Repair, Permit, Insurance, Other

---

## 8. Core Tables

### `users`

| Column | PostgreSQL Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Auto-increment |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login identifier |
| hashed_password | VARCHAR(255) | NOT NULL | bcrypt hash |
| full_name | VARCHAR(100) | NOT NULL | Display name |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Soft-disable account |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | UTC timestamp |

**Functional dependency:** `id → email, hashed_password, full_name, is_active, created_at` ✓

**Business rules:**
- `email` must be unique across all users
- `hashed_password` is never the plain-text password
- Deactivating (`is_active = false`) blocks login without deleting the record

---

### `vehicles`

| Column | PostgreSQL Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | Auto-increment |
| registration_number | VARCHAR(20) | UNIQUE, NOT NULL | e.g. KAA 123A |
| name | VARCHAR(100) | NOT NULL | Friendly name |
| vehicle_type_id | INTEGER | FK → vehicle_types.id, NOT NULL | 3NF: type in lookup |
| max_load_capacity | NUMERIC(10,2) | NOT NULL, CHECK > 0 | Max cargo in kg |
| odometer | NUMERIC(10,2) | NOT NULL, DEFAULT 0, CHECK ≥ 0 | km reading |
| acquisition_cost | NUMERIC(12,2) | NOT NULL, CHECK > 0 | Purchase price KES |
| region_id | INTEGER | FK → regions.id, NOT NULL | 3NF: region in lookup |
| status | vehicle_status | NOT NULL, DEFAULT 'Available' | ENUM |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Trigger auto-updates |

**Functional dependency:** `id → registration_number, name, vehicle_type_id, max_load_capacity, odometer, acquisition_cost, region_id, status` ✓

**Business rules:**
- `registration_number` must be globally unique
- `odometer` can only increase (enforced in application layer)
- `status` changes are side-effected by trip actions (dispatched → On Trip)

---

### `drivers`

| Column | PostgreSQL Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | |
| name | VARCHAR(100) | NOT NULL | Full name |
| license_number | VARCHAR(50) | UNIQUE, NOT NULL | Government-issued ID |
| license_category_id | INTEGER | FK → license_categories.id, NOT NULL | 3NF |
| license_expiry | DATE | NOT NULL | Must be future date |
| contact_number | VARCHAR(20) | NOT NULL | Phone |
| safety_score | NUMERIC(5,2) | NOT NULL, DEFAULT 100, CHECK 0-100 | Performance score |
| status | driver_status | NOT NULL, DEFAULT 'Available' | ENUM |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Functional dependency:** `id → name, license_number, license_category_id, license_expiry, contact_number, safety_score, status` ✓

**Business rules:**
- `license_number` is unique (one driver per license)
- `safety_score` must be between 0 and 100
- Drivers with `status = 'Suspended'` cannot be assigned to trips

---

### `trips`

| Column | PostgreSQL Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | |
| source | VARCHAR(100) | NOT NULL | Origin location name |
| destination | VARCHAR(100) | NOT NULL | Destination name |
| vehicle_id | INTEGER | FK → vehicles.id, NOT NULL | Assigned vehicle |
| driver_id | INTEGER | FK → drivers.id, NOT NULL | Assigned driver |
| cargo_weight | NUMERIC(10,2) | NOT NULL, CHECK > 0 | kg |
| planned_distance | NUMERIC(10,2) | NOT NULL, CHECK > 0 | km |
| revenue | NUMERIC(12,2) | NOT NULL, CHECK ≥ 0 | KES |
| status | trip_status | NOT NULL, DEFAULT 'Draft' | ENUM |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Functional dependency:** `id → source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, revenue, status` ✓

**Business rules:**
- `cargo_weight` must not exceed `vehicles.max_load_capacity` (enforced in application)
- Status transitions: Draft → Dispatched → Completed/Cancelled only
- When dispatched: vehicle and driver status → 'On Trip'
- When completed/cancelled: vehicle and driver status → 'Available'

**Status transition rules:**

| From | To | Allowed |
|---|---|---|
| Draft | Dispatched | ✅ |
| Draft | Cancelled | ✅ |
| Dispatched | Completed | ✅ |
| Dispatched | Cancelled | ✅ |
| Completed | Any | ❌ |
| Cancelled | Any | ❌ |

---

### `maintenance_records`

| Column | PostgreSQL Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | |
| vehicle_id | INTEGER | FK → vehicles.id, NOT NULL | Which vehicle |
| maintenance_type_id | INTEGER | FK → maintenance_types.id, NOT NULL | 3NF |
| description | TEXT | NOT NULL | Work description |
| estimated_cost | NUMERIC(12,2) | NOT NULL, CHECK ≥ 0 | KES |
| actual_cost | NUMERIC(12,2) | NULLABLE, CHECK ≥ 0 | Filled on completion |
| start_date | DATE | NOT NULL | |
| status | maintenance_status | NOT NULL, DEFAULT 'Active' | ENUM |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Functional dependency:** `id → vehicle_id, maintenance_type_id, description, estimated_cost, actual_cost, start_date, status` ✓

**Business rules:**
- `actual_cost` is NULL until maintenance is marked Completed
- When `status → Active`, vehicle status should be set to 'In Shop'
- When `status → Completed`, vehicle status reverts to 'Available'

---

### `fuel_logs`

| Column | PostgreSQL Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | |
| vehicle_id | INTEGER | FK → vehicles.id, NOT NULL | Which vehicle |
| trip_id | INTEGER | FK → trips.id, NULLABLE | Optional trip link |
| fuel_litres | NUMERIC(8,2) | NOT NULL, CHECK > 0 | Litres dispensed |
| total_cost | NUMERIC(12,2) | NOT NULL, CHECK > 0 | KES |
| date | DATE | NOT NULL | Fueling date |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Functional dependency:** `id → vehicle_id, trip_id, fuel_litres, total_cost, date` ✓

**Business rules:**
- `trip_id` is optional — fuel can be logged without a trip
- `fuel_litres` must be positive

---

### `expenses`

| Column | PostgreSQL Type | Constraints | Description |
|---|---|---|---|
| id | SERIAL | PRIMARY KEY | |
| vehicle_id | INTEGER | FK → vehicles.id, NOT NULL | Which vehicle |
| trip_id | INTEGER | FK → trips.id, NULLABLE | Optional trip link |
| expense_category_id | INTEGER | FK → expense_categories.id, NOT NULL | 3NF |
| amount | NUMERIC(12,2) | NOT NULL, CHECK > 0 | KES |
| description | TEXT | NULLABLE | Free-text notes |
| date | DATE | NOT NULL | Expense date |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Functional dependency:** `id → vehicle_id, trip_id, expense_category_id, amount, description, date` ✓

---

## 9. Foreign Key Dependency Map

```mermaid
graph TD
    VT["vehicle_types"]
    R["regions"]
    LC["license_categories"]
    MT["maintenance_types"]
    EC["expense_categories"]

    V["vehicles"]
    D["drivers"]
    T["trips"]
    M["maintenance_records"]
    F["fuel_logs"]
    E["expenses"]
    U["users"]

    VT -->|"vehicle_type_id"| V
    R -->|"region_id"| V
    LC -->|"license_category_id"| D

    V -->|"vehicle_id"| T
    D -->|"driver_id"| T

    V -->|"vehicle_id"| M
    MT -->|"maintenance_type_id"| M

    V -->|"vehicle_id"| F
    T -->|"trip_id (nullable)"| F

    V -->|"vehicle_id"| E
    T -->|"trip_id (nullable)"| E
    EC -->|"expense_category_id"| E

    style VT fill:#FEF3C7,stroke:#D97706
    style R fill:#FEF3C7,stroke:#D97706
    style LC fill:#FEF3C7,stroke:#D97706
    style MT fill:#FEF3C7,stroke:#D97706
    style EC fill:#FEF3C7,stroke:#D97706
    style U fill:#EDE9FE,stroke:#7C3AED
    style V fill:#DBEAFE,stroke:#2563EB
    style D fill:#DBEAFE,stroke:#2563EB
    style T fill:#DCFCE7,stroke:#16A34A
    style M fill:#DCFCE7,stroke:#16A34A
    style F fill:#DCFCE7,stroke:#16A34A
    style E fill:#DCFCE7,stroke:#16A34A
```

---

## 10. Index Strategy

Indexes speed up queries that filter or join on specific columns. Without indexes, PostgreSQL performs full table scans.

| Table | Column | Index Type | Reason |
|---|---|---|---|
| `users` | `email` | UNIQUE (auto) | Login lookup |
| `vehicles` | `registration_number` | UNIQUE (auto) | Search by reg number |
| `vehicles` | `status` | B-tree | Filter by status (dashboard, list page) |
| `vehicles` | `region_id` | B-tree | Filter by region |
| `drivers` | `license_number` | UNIQUE (auto) | Driver lookup |
| `drivers` | `status` | B-tree | Filter available drivers |
| `trips` | `vehicle_id` | B-tree | Join vehicles → trips |
| `trips` | `driver_id` | B-tree | Join drivers → trips |
| `trips` | `status` | B-tree | Filter by status |
| `trips` | `created_at` | B-tree | Date range queries (dashboard) |
| `maintenance_records` | `vehicle_id` | B-tree | Vehicle maintenance history |
| `fuel_logs` | `vehicle_id` | B-tree | Vehicle fuel history |
| `fuel_logs` | `trip_id` | B-tree | Trip fuel lookup |
| `expenses` | `vehicle_id` | B-tree | Vehicle expense history |

```sql
-- Example index creation
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_trips_created_at ON trips(created_at DESC);
CREATE INDEX idx_trips_status ON trips(status);
```

---

## 11. Data Integrity Rules

### NOT NULL Constraints
Every business-critical field is `NOT NULL`. Optional fields (like `actual_cost` on maintenance, `trip_id` on fuel logs) are explicitly nullable.

### UNIQUE Constraints

| Table | Column | Business Rule |
|---|---|---|
| `users` | `email` | One account per email |
| `vehicles` | `registration_number` | One record per physical vehicle |
| `drivers` | `license_number` | One record per license |
| `vehicle_types` | `name` | No duplicate type names |
| `regions` | `name` | No duplicate regions |

### CHECK Constraints

| Table | Column | Constraint |
|---|---|---|
| `vehicles` | `max_load_capacity` | `> 0` |
| `vehicles` | `odometer` | `>= 0` |
| `vehicles` | `acquisition_cost` | `> 0` |
| `drivers` | `safety_score` | `BETWEEN 0 AND 100` |
| `trips` | `cargo_weight` | `> 0` |
| `trips` | `planned_distance` | `> 0` |
| `trips` | `revenue` | `>= 0` |
| `maintenance_records` | `estimated_cost` | `>= 0` |
| `maintenance_records` | `actual_cost` | `>= 0` (when not null) |
| `fuel_logs` | `fuel_litres` | `> 0` |
| `fuel_logs` | `total_cost` | `> 0` |
| `expenses` | `amount` | `> 0` |

---

## 12. Connection Configuration

### SQLAlchemy Engine (database.py)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,         # postgresql://postgres:pw@localhost:5432/transitops
    pool_size=5,                   # Keep 5 connections always open
    max_overflow=10,               # Allow 10 extra under peak load
    pool_pre_ping=True,            # Test connection health before use
    pool_recycle=3600,             # Recycle connections after 1 hour
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

### Environment Configuration (.env)

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/transitops
```

### Table Creation on Startup

```python
# main.py — runs once when the server starts
Base.metadata.create_all(bind=engine)
```

This creates all tables from SQLAlchemy model definitions if they don't already exist. It is **non-destructive** — existing tables with data are not modified.

---

## 13. Seeder Strategy

The seeder lives in `db/init_db.py` (there is no `seed.py`) and is called from `main.py`'s startup event on
**every** server boot — not just the first one. Each step is individually guarded, so it's idempotent:

```python
def init_db():
    Base.metadata.create_all(bind=engine)

    if not db.query(Region).first():
        db.add_all([Region(name="Delhi NCR"), Region(name="Mumbai Metro"), Region(name="Bangalore Hub")])

    if not db.query(VehicleType).first():
        db.add_all([VehicleType(name="Heavy Truck"), VehicleType(name="Light Commercial"), VehicleType(name="Van")])

    if not db.query(LicenseCategory).first():
        db.add_all([LicenseCategory(name="HMV"), LicenseCategory(name="LMV")])

    db.commit()

    if not db.query(User).filter(User.email == "admin@transitops.com").first():
        db.add(User(email="admin@transitops.com", hashed_password=get_password_hash("admin123"),
                     role="Fleet Manager", full_name="Admin"))
        db.commit()

    if not db.query(Vehicle).first():
        db.add(Vehicle(registration_number="KA-01-AB-1234", name_model="Tata Ace Gold", type="Van",
                        max_load_capacity=10.5, odometer=15000, acquisition_cost=850000,
                        region_id=<first region>.id))
        db.commit()

    if not db.query(Driver).first():
        db.add(Driver(first_name="Ramesh", last_name="Kumar", license_number="DL-142023",
                       license_category="LMV", license_expiry_date=<today + 2 years>,
                       contact_number="+91 90000 00000", region_id=<first region>.id))
        db.commit()
```

This is intentionally minimal — a handful of rows to make the app immediately usable after a fresh clone,
not a realistic demo dataset. There is no seeded data for trips, maintenance records, fuel logs, or
expenses; those tables start empty until a user creates records through the UI.

### Seeded Data Summary (actual)

| Table | Records | Notes |
|---|---|---|
| `regions` | 3 | Delhi NCR, Mumbai Metro, Bangalore Hub |
| `vehicle_types` | 3 | Heavy Truck, Light Commercial, Van — reference data only, not FK'd from `vehicles` |
| `license_categories` | 2 | HMV, LMV — reference data only, not FK'd from `drivers` |
| `users` | 1 | `admin@transitops.com` / `admin123`, role `Fleet Manager` |
| `vehicles` | 1 | `KA-01-AB-1234`, status `available` |
| `drivers` | 1 | Ramesh Kumar, status `available` |
| `trips`, `maintenance_records`, `fuel_logs`, `expenses` | 0 | Not seeded — created via the app as you use it |
