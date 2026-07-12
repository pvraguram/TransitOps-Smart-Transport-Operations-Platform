from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.lookups import Region, VehicleType, LicenseCategory
from app.models.enums import MaintenanceType, ExpenseType

router = APIRouter()

@router.get("/regions")
def get_regions(db: Session = Depends(get_db)):
    return [{"id": r.id, "name": r.name} for r in db.query(Region).all()]

@router.get("/vehicle-types")
def get_vehicle_types(db: Session = Depends(get_db)):
    return [{"id": t.id, "name": t.name, "description": t.description} for t in db.query(VehicleType).all()]

@router.get("/license-categories")
def get_license_categories(db: Session = Depends(get_db)):
    return [{"id": c.id, "name": c.name, "description": c.description} for c in db.query(LicenseCategory).all()]

@router.get("/maintenance-types")
def get_maintenance_types():
    return [t.value for t in MaintenanceType]

@router.get("/expense-types")
def get_expense_types():
    return [t.value for t in ExpenseType]
