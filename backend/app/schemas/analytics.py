from pydantic import BaseModel

class DashboardStats(BaseModel):
    active_vehicles: int
    vehicles_in_maintenance: int
    active_trips: int
    pending_trips: int
    drivers_on_duty: int
