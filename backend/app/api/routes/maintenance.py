from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.core import MaintenanceRecord, Vehicle
from app.models.enums import MaintenanceStatus, VehicleStatus
from app.schemas.maintenance import MaintenanceCreate, MaintenanceResponse

router = APIRouter()

@router.get("/", response_model=List[MaintenanceResponse])
def get_maintenance(db: Session = Depends(get_db)):
    return db.query(MaintenanceRecord).all()

@router.post("/", response_model=MaintenanceResponse)
def create_maintenance(maint_in: MaintenanceCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == maint_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    maint = MaintenanceRecord(**maint_in.dict())
    db.add(maint)
    
    if maint.status == MaintenanceStatus.active:
        vehicle.status = VehicleStatus.in_shop
        
    db.commit()
    db.refresh(maint)
    return maint

@router.put("/{id}/status", response_model=MaintenanceResponse)
def update_maintenance_status(id: int, status: MaintenanceStatus, db: Session = Depends(get_db)):
    maint = db.query(MaintenanceRecord).filter(MaintenanceRecord.id == id).first()
    if not maint:
        raise HTTPException(status_code=404, detail="Record not found")

    maint.status = status
    if status == MaintenanceStatus.completed:
        vehicle = db.query(Vehicle).filter(Vehicle.id == maint.vehicle_id).first()
        if vehicle:
            vehicle.status = VehicleStatus.available

    db.commit()
    db.refresh(maint)
    return maint
