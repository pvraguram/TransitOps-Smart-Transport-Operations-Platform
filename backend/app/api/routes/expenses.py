from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.core import Expense, FuelLog
from app.schemas.expense import ExpenseCreate, ExpenseResponse, FuelLogCreate, FuelLogResponse

router = APIRouter()

@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(db: Session = Depends(get_db)):
    return db.query(Expense).all()

@router.post("/", response_model=ExpenseResponse)
def create_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db)):
    expense = Expense(**expense_in.dict())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.get("/fuel", response_model=List[FuelLogResponse])
def get_fuel_logs(db: Session = Depends(get_db)):
    return db.query(FuelLog).all()

@router.post("/fuel", response_model=FuelLogResponse)
def create_fuel_log(log_in: FuelLogCreate, db: Session = Depends(get_db)):
    log = FuelLog(**log_in.dict())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
