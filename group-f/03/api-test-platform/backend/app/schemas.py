from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    base_url: str


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class Project(ProjectBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class InterfaceBase(BaseModel):
    name: str
    path: str
    method: str
    headers: Optional[Dict[str, Any]] = {}
    request_body: Optional[Dict[str, Any]] = None


class InterfaceCreate(InterfaceBase):
    project_id: int


class InterfaceUpdate(InterfaceBase):
    pass


class Interface(InterfaceBase):
    id: int
    project_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class TestCaseBase(BaseModel):
    name: str
    description: Optional[str] = None
    request_params: Optional[Dict[str, Any]] = {}
    request_body: Optional[Dict[str, Any]] = None
    expected_status: int
    expected_response: Optional[Dict[str, Any]] = None


class TestCaseCreate(TestCaseBase):
    interface_id: int


class TestCaseUpdate(TestCaseBase):
    pass


class TestCase(TestCaseBase):
    id: int
    interface_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class TestCaseWithInterface(TestCase):
    interface: Interface
    
    class Config:
        from_attributes = True


class ExportRequest(BaseModel):
    project_id: Optional[int] = None
    interface_id: Optional[int] = None
    testcase_ids: Optional[list[int]] = None


class GenerateCodeRequest(BaseModel):
    testcase_id: int
    code_type: str = "pytest"  # pytest, script
