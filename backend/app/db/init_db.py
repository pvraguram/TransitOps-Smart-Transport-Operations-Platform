import logging
from passlib.context import CryptContext
from app.db.database import engine, SessionLocal
from app.models.base import Base
# Import all models to ensure they are registered with the Base
from app.models.lookups import Region, VehicleType, LicenseCategory
from app.models.core import User, Vehicle, Driver, Trip, MaintenanceRecord, FuelLog, Expense

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def init_db():
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created.")

    # Seed data
    db = SessionLocal()
    try:
        # Seed Regions
        if not db.query(Region).first():
            regions = [Region(name="Delhi NCR"), Region(name="Mumbai Metro"), Region(name="Bangalore Hub")]
            db.add_all(regions)

        # Seed Vehicle Types
        if not db.query(VehicleType).first():
            types = [VehicleType(name="Heavy Truck"), VehicleType(name="Light Commercial"), VehicleType(name="Van")]
            db.add_all(types)

        # Seed License Categories
        if not db.query(LicenseCategory).first():
            categories = [LicenseCategory(name="HMV"), LicenseCategory(name="LMV")]
            db.add_all(categories)

        db.commit()

        # Seed initial admin user
        if not db.query(User).filter(User.email == "admin@transitops.com").first():
            user = User(
                email="admin@transitops.com",
                hashed_password=get_password_hash("admin123"),
                role="Fleet Manager",
                full_name="Admin",
            )
            db.add(user)
            db.commit()

        # Seed initial vehicle
        if not db.query(Vehicle).first():
            region = db.query(Region).first()
            vehicle = Vehicle(
                registration_number="KA-01-AB-1234",
                name_model="Tata Ace Gold",
                type="Van",
                max_load_capacity=10.5,
                odometer=15000,
                acquisition_cost=850000,
                region_id=region.id if region else None,
            )
            db.add(vehicle)
            db.commit()

        # Seed initial driver
        if not db.query(Driver).first():
            region = db.query(Region).first()
            from datetime import date, timedelta
            driver = Driver(
                first_name="Ramesh",
                last_name="Kumar",
                license_number="DL-142023",
                license_category="LMV",
                license_expiry_date=date.today() + timedelta(days=730),
                contact_number="+91 90000 00000",
                region_id=region.id if region else None,
            )
            db.add(driver)
            db.commit()

        logger.info("Database seeded successfully.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
