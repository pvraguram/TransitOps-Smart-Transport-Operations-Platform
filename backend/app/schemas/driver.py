from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.enums import DriverStatus

class DriverBase(BaseModel):
    first_name: str
    last_name: str
    license_number: str
    license_expiry_date: Optional[date] = None
    license_category_id: int
    status: Optional[DriverStatus] = DriverStatus.available
    region_id: int

class DriverCreate(DriverBase):
    pass

class DriverResponse(DriverBase):
    id: int

    class Config:
        from_attributes = True
