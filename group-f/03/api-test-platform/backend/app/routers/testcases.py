from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, schemas, database

router = APIRouter(prefix="/api/testcases", tags=["testcases"])


@router.get("", response_model=List[schemas.TestCase])
def list_test_cases(interface_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_test_cases(db, interface_id=interface_id, skip=skip, limit=limit)


@router.post("", response_model=schemas.TestCase)
def create_test_case(test_case: schemas.TestCaseCreate, db: Session = Depends(database.get_db)):
    return crud.create_test_case(db, test_case)


@router.get("/{test_case_id}", response_model=schemas.TestCaseWithInterface)
def get_test_case(test_case_id: int, db: Session = Depends(database.get_db)):
    test_case = crud.get_test_case(db, test_case_id)
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")
    return test_case


@router.put("/{test_case_id}", response_model=schemas.TestCase)
def update_test_case(test_case_id: int, test_case: schemas.TestCaseUpdate, db: Session = Depends(database.get_db)):
    db_test_case = crud.update_test_case(db, test_case_id, test_case)
    if not db_test_case:
        raise HTTPException(status_code=404, detail="Test case not found")
    return db_test_case


@router.delete("/{test_case_id}")
def delete_test_case(test_case_id: int, db: Session = Depends(database.get_db)):
    db_test_case = crud.delete_test_case(db, test_case_id)
    if not db_test_case:
        raise HTTPException(status_code=404, detail="Test case not found")
    return {"message": "Test case deleted successfully"}
