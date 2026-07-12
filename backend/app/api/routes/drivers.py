from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.core import Driver
from app.schemas.driver import DriverCreate, DriverResponse

router = APIRouter()

@router.get("/", response_model=List[DriverResponse])
def get_drivers(db: Session = Depends(get_db)):
    return db.query(Driver).all()

@router.post("/", response_model=DriverResponse)
def create_driver(driver_in: DriverCreate, db: Session = Depends(get_db)):
    driver = Driver(**driver_in.dict())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver
