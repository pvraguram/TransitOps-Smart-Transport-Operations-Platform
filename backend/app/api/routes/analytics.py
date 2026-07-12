from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.core import Vehicle, Trip, Driver
from app.models.enums import VehicleStatus, TripStatus, DriverStatus
from app.schemas.analytics import DashboardStats

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    active_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.available).count()
    vehicles_in_maintenance = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.in_shop).count()
    active_trips = db.query(Trip).filter(Trip.status == TripStatus.dispatched).count()
    pending_trips = db.query(Trip).filter(Trip.status == TripStatus.draft).count()
    drivers_on_duty = db.query(Driver).filter(Driver.status == DriverStatus.on_trip).count()

    return DashboardStats(
        active_vehicles=active_vehicles,
        vehicles_in_maintenance=vehicles_in_maintenance,
        active_trips=active_trips,
        pending_trips=pending_trips,
        drivers_on_duty=drivers_on_duty
    )
