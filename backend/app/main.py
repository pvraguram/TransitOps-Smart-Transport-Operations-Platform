from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, vehicles, drivers, trips, maintenance, expenses, analytics, lookup
from app.db.init_db import init_db

app = FastAPI(title="TransitOps API")

@app.on_event("startup")
def on_startup():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(vehicles.router, prefix="/api/vehicles", tags=["vehicles"])
app.include_router(drivers.router, prefix="/api/drivers", tags=["drivers"])
app.include_router(trips.router, prefix="/api/trips", tags=["trips"])
app.include_router(maintenance.router, prefix="/api/maintenance", tags=["maintenance"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(lookup.router, prefix="/api/lookup", tags=["lookup"])
