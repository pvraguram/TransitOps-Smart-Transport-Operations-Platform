import enum

class VehicleStatus(str, enum.Enum):
    available = "available"
    on_trip = "on_trip"
    in_shop = "in_shop"
    retired = "retired"

class DriverStatus(str, enum.Enum):
    available = "available"
    on_trip = "on_trip"
    off_duty = "off_duty"
    suspended = "suspended"

class TripStatus(str, enum.Enum):
    draft = "draft"
    dispatched = "dispatched"
    completed = "completed"
    cancelled = "cancelled"

class MaintenanceStatus(str, enum.Enum):
    active = "active"
    completed = "completed"

class MaintenanceType(str, enum.Enum):
    routine = "routine"
    repair = "repair"
    inspection = "inspection"

class ExpenseType(str, enum.Enum):
    toll = "toll"
    parking = "parking"
    fine = "fine"
    other = "other"
