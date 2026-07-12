from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.enums import TripStatus

class TripBase(BaseModel):
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    origin: str
    destination: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[TripStatus] = TripStatus.draft

class TripCreate(TripBase):
    pass

class TripDispatch(BaseModel):
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    origin: str
    destination: str

class TripResponse(TripBase):
    id: int

    class Config:
        from_attributes = True
