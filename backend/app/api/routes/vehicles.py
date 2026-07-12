from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.core import Vehicle
from app.models.enums import VehicleStatus
from app.schemas.vehicle import VehicleCreate, VehicleResponse

router = APIRouter()

@router.get("/", response_model=List[VehicleResponse])
def get_vehicles(status: Optional[VehicleStatus] = None, type: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Vehicle)
    if status:
        query = query.filter(Vehicle.status == status)
    if type:
        query = query.filter(Vehicle.type_id == type)
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
