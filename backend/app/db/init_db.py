import logging
from passlib.context import CryptContext
from app.db.database import engine, SessionLocal
from app.models.base import Base
# Import all models to ensure they are registered with the Base
from app.models.lookups import VehicleType, Region, LicenseCategory
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

    db = SessionLocal()
    try:
        # Seed default user if none exist
        user = db.query(User).filter(User.email == "admin@transitops.com").first()
        if not user:
            logger.info("Seeding default admin user...")
            new_user = User(
                email="admin@transitops.com",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                full_name="System Admin",
                is_active=True
            )
            db.add(new_user)
        
        # Seed Lookup tables if empty
        if db.query(Region).count() == 0:
            logger.info("Seeding regions...")
            db.add_all([
                Region(name="North"), Region(name="South"), Region(name="East"), Region(name="West")
            ])

        if db.query(VehicleType).count() == 0:
            logger.info("Seeding vehicle types...")
            db.add_all([
                VehicleType(name="Truck", description="Heavy cargo truck"),
                VehicleType(name="Van", description="Delivery van"),
                VehicleType(name="Car", description="Standard passenger car")
            ])
            
        if db.query(LicenseCategory).count() == 0:
            logger.info("Seeding license categories...")
            db.add_all([
                LicenseCategory(category="CDL-A"),
                LicenseCategory(category="CDL-B"),
                LicenseCategory(category="Standard")
            ])

        db.commit()
        logger.info("Database seeding complete.")
    except Exception as e:
        logger.error(f"An error occurred during database seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
