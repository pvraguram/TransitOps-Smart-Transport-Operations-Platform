from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.enums import MaintenanceType, MaintenanceStatus

class MaintenanceBase(BaseModel):
    vehicle_id: int
    date: date
    type: MaintenanceType
    status: Optional[MaintenanceStatus] = MaintenanceStatus.active
    description: Optional[str] = None
    cost: Optional[float] = 0.0

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceResponse(MaintenanceBase):
    id: int

    class Config:
        from_attributes = True
