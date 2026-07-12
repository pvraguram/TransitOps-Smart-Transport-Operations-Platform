from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.enums import ExpenseType

class ExpenseBase(BaseModel):
    trip_id: int
    type: ExpenseType
    amount: float
    description: Optional[str] = None
    date: date

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int

    class Config:
        from_attributes = True

class FuelLogBase(BaseModel):
    vehicle_id: int
    date: date
    liters: float
    cost: float
    odometer_reading: Optional[int] = None

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogResponse(FuelLogBase):
    id: int

    class Config:
        from_attributes = True
