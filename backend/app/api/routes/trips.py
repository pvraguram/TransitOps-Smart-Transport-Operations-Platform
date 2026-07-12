from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from app.db.database import get_db
from app.models.core import Trip, Vehicle, Driver
from app.models.enums import VehicleStatus, DriverStatus, TripStatus
from app.schemas.trip import TripCreate, TripResponse, TripDispatch

router = APIRouter()

@router.get("/", response_model=List[TripResponse])
def get_trips(db: Session = Depends(get_db)):
    return db.query(Trip).all()

@router.post("/dispatch", response_model=TripResponse)
def dispatch_trip(trip_in: TripDispatch, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == trip_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    driver = db.query(Driver).filter(Driver.id == trip_in.driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    if trip_in.cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(status_code=400, detail="Overloaded")

    if vehicle.status != VehicleStatus.available:
        raise HTTPException(status_code=400, detail="Vehicle not available")

    if driver.status == DriverStatus.suspended:
        raise HTTPException(status_code=400, detail="Driver is suspended")

    if driver.license_expiry_date and driver.license_expiry_date < date.today():
        raise HTTPException(status_code=400, detail="Driver license expired")

    if driver.status != DriverStatus.available:
        raise HTTPException(status_code=400, detail="Driver not available")

    vehicle.status = VehicleStatus.on_trip
    driver.status = DriverStatus.on_trip

    trip = Trip(
        vehicle_id=trip_in.vehicle_id,
        driver_id=trip_in.driver_id,
        cargo_weight=trip_in.cargo_weight,
        planned_distance=trip_in.planned_distance,
        origin=trip_in.origin,
        destination=trip_in.destination,
        status=TripStatus.dispatched,
        start_time=datetime.utcnow()
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

@router.put("/{trip_id}/status", response_model=TripResponse)
def update_trip_status(trip_id: int, status: TripStatus, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    trip.status = status
    if status in [TripStatus.completed, TripStatus.cancelled]:
        trip.end_time = datetime.utcnow()
        vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
        driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
        if vehicle:
            vehicle.status = VehicleStatus.available
        if driver:
            driver.status = DriverStatus.available
            
    db.commit()
    db.refresh(trip)
    return trip
