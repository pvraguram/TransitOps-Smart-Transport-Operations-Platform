from pydantic import BaseModel
from typing import Optional
from app.models.enums import VehicleStatus

class VehicleBase(BaseModel):
    registration_number: str
    name_model: str
    type: str
    max_load_capacity: float
    status: Optional[VehicleStatus] = VehicleStatus.available
    odometer: Optional[int] = 0
    acquisition_cost: Optional[float] = 0.0
    region_id: Optional[int] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleResponse(VehicleBase):
    id: int

    class Config:
        from_attributes = True
