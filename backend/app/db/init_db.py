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

if __name__ == "__main__":
    init_db()
