from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.enums import DriverStatus

class DriverBase(BaseModel):
    first_name: str
    last_name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: str
    safety_score: Optional[int] = 100
    status: Optional[DriverStatus] = DriverStatus.available
    region_id: Optional[int] = None

class DriverCreate(DriverBase):
    pass

class DriverResponse(DriverBase):
    id: int

    class Config:
        from_attributes = True
