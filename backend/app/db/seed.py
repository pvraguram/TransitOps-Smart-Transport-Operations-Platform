import logging
from app.db.database import SessionLocal
from app.models.core import User
from passlib.context import CryptContext

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@transitops.in").first()
        if not user:
            logger.info("Creating default admin user")
            user = User(
                email="admin@transitops.in",
                hashed_password=pwd_context.hash("admin123"),
                full_name="Admin",
                role="admin"
            )
            db.add(user)
            db.commit()
            logger.info("Default admin user created")
        else:
            logger.info("Admin user already exists")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
