from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, schemas, database

router = APIRouter(prefix="/api/interfaces", tags=["interfaces"])


@router.get("", response_model=List[schemas.Interface])
def list_interfaces(project_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_interfaces(db, project_id=project_id, skip=skip, limit=limit)


@router.post("", response_model=schemas.Interface)
def create_interface(interface: schemas.InterfaceCreate, db: Session = Depends(database.get_db)):
    return crud.create_interface(db, interface)


@router.get("/{interface_id}", response_model=schemas.Interface)
def get_interface(interface_id: int, db: Session = Depends(database.get_db)):
    interface = crud.get_interface(db, interface_id)
    if not interface:
        raise HTTPException(status_code=404, detail="Interface not found")
    return interface


@router.put("/{interface_id}", response_model=schemas.Interface)
def update_interface(interface_id: int, interface: schemas.InterfaceUpdate, db: Session = Depends(database.get_db)):
    db_interface = crud.update_interface(db, interface_id, interface)
    if not db_interface:
        raise HTTPException(status_code=404, detail="Interface not found")
    return db_interface


@router.delete("/{interface_id}")
def delete_interface(interface_id: int, db: Session = Depends(database.get_db)):
    db_interface = crud.delete_interface(db, interface_id)
    if not db_interface:
        raise HTTPException(status_code=404, detail="Interface not found")
    return {"message": "Interface deleted successfully"}
