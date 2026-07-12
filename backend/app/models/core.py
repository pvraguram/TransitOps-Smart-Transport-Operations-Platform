from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, Enum as SQLEnum, Date, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import Base
from app.models.enums import VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus, MaintenanceType, ExpenseType

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="user")
    full_name = Column(String)

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    max_load_capacity = Column(Float, default=0.0)
    type_id = Column(Integer, ForeignKey("vehicle_types.id"), nullable=False)
    status = Column(SQLEnum(VehicleStatus, name="vehiclestatus"), default=VehicleStatus.available, nullable=False)
    mileage = Column(Integer, default=0)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)

    # Relationships
    type = relationship("VehicleType")
    region = relationship("Region")
    trips = relationship("Trip", back_populates="vehicle")
    maintenance_records = relationship("MaintenanceRecord", back_populates="vehicle")
    fuel_logs = relationship("FuelLog", back_populates="vehicle")

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    license_number = Column(String, unique=True, index=True, nullable=False)
    license_expiry_date = Column(Date)
    license_category_id = Column(Integer, ForeignKey("license_categories.id"), nullable=False)
    status = Column(SQLEnum(DriverStatus, name="driverstatus"), default=DriverStatus.available, nullable=False)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)

    # Relationships
    license_category = relationship("LicenseCategory")
    region = relationship("Region")
    trips = relationship("Trip", back_populates="driver")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    cargo_weight = Column(Float)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    status = Column(SQLEnum(TripStatus, name="tripstatus"), default=TripStatus.draft, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
    expenses = relationship("Expense", back_populates="trip")

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    date = Column(Date, nullable=False)
    type = Column(SQLEnum(MaintenanceType, name="maintenancetype"), nullable=False)
    status = Column(SQLEnum(MaintenanceStatus, name="maintenancestatus"), default=MaintenanceStatus.active, nullable=False)
    description = Column(Text)
    cost = Column(Float, default=0.0)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenance_records")

class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    date = Column(Date, nullable=False)
    gallons = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    odometer_reading = Column(Integer)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="fuel_logs")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    type = Column(SQLEnum(ExpenseType, name="expensetype"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text)
    date = Column(Date, nullable=False)

    # Relationships
    trip = relationship("Trip", back_populates="expenses")
