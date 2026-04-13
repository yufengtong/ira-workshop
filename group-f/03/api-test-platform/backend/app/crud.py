from sqlalchemy.orm import Session
from . import models, schemas


# Project CRUD
def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()


def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Project).offset(skip).limit(limit).all()


def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def update_project(db: Session, project_id: int, project: schemas.ProjectUpdate):
    db_project = get_project(db, project_id)
    if db_project:
        for key, value in project.model_dump().items():
            setattr(db_project, key, value)
        db.commit()
        db.refresh(db_project)
    return db_project


def delete_project(db: Session, project_id: int):
    db_project = get_project(db, project_id)
    if db_project:
        db.delete(db_project)
        db.commit()
    return db_project


# Interface CRUD
def get_interface(db: Session, interface_id: int):
    return db.query(models.Interface).filter(models.Interface.id == interface_id).first()


def get_interfaces(db: Session, project_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Interface)
    if project_id:
        query = query.filter(models.Interface.project_id == project_id)
    return query.offset(skip).limit(limit).all()


def create_interface(db: Session, interface: schemas.InterfaceCreate):
    db_interface = models.Interface(**interface.model_dump())
    db.add(db_interface)
    db.commit()
    db.refresh(db_interface)
    return db_interface


def update_interface(db: Session, interface_id: int, interface: schemas.InterfaceUpdate):
    db_interface = get_interface(db, interface_id)
    if db_interface:
        for key, value in interface.model_dump().items():
            setattr(db_interface, key, value)
        db.commit()
        db.refresh(db_interface)
    return db_interface


def delete_interface(db: Session, interface_id: int):
    db_interface = get_interface(db, interface_id)
    if db_interface:
        db.delete(db_interface)
        db.commit()
    return db_interface


# TestCase CRUD
def get_test_case(db: Session, test_case_id: int):
    return db.query(models.TestCase).filter(models.TestCase.id == test_case_id).first()


def get_test_cases(db: Session, interface_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.TestCase)
    if interface_id:
        query = query.filter(models.TestCase.interface_id == interface_id)
    return query.offset(skip).limit(limit).all()


def get_test_cases_by_project(db: Session, project_id: int):
    return db.query(models.TestCase).join(models.Interface).filter(
        models.Interface.project_id == project_id
    ).all()


def create_test_case(db: Session, test_case: schemas.TestCaseCreate):
    db_test_case = models.TestCase(**test_case.model_dump())
    db.add(db_test_case)
    db.commit()
    db.refresh(db_test_case)
    return db_test_case


def update_test_case(db: Session, test_case_id: int, test_case: schemas.TestCaseUpdate):
    db_test_case = get_test_case(db, test_case_id)
    if db_test_case:
        for key, value in test_case.model_dump().items():
            setattr(db_test_case, key, value)
        db.commit()
        db.refresh(db_test_case)
    return db_test_case


def delete_test_case(db: Session, test_case_id: int):
    db_test_case = get_test_case(db, test_case_id)
    if db_test_case:
        db.delete(db_test_case)
        db.commit()
    return db_test_case
