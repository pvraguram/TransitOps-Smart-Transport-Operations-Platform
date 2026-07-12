from pydantic import BaseModel
from typing import Optional
from app.models.enums import VehicleStatus

class VehicleBase(BaseModel):
    registration_number: str
    max_load_capacity: float
    type_id: int
    status: Optional[VehicleStatus] = VehicleStatus.available
    mileage: Optional[int] = 0
    region_id: int

class VehicleCreate(VehicleBase):
    pass

class VehicleResponse(VehicleBase):
    id: int

    class Config:
        from_attributes = True
