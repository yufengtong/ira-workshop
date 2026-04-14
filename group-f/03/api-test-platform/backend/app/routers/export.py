from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from .. import crud, schemas, database
import pytest_generator
import script_generator
import excel_generator
import os

router = APIRouter(prefix="/api/export", tags=["export"])


@router.post("/pytest/{interface_id}")
def export_pytest(interface_id: int, db: Session = Depends(database.get_db)):
    """导出pytest代码"""
    interface = crud.get_interface(db, interface_id)
    if not interface:
        raise HTTPException(status_code=404, detail="Interface not found")
    
    project = crud.get_project(db, interface.project_id)
    test_cases = crud.get_test_cases(db, interface_id=interface_id)
    
    code = pytest_generator.generate_pytest_code(project, interface, test_cases)
    filepath, filename = pytest_generator.save_pytest_file(project.name, interface.name, code)
    
    return {
        "code": code,
        "filename": filename,
        "download_url": f"/api/export/download/{filename}"
    }


@router.post("/script/{test_case_id}")
def export_script(test_case_id: int, db: Session = Depends(database.get_db)):
    """导出Python requests脚本"""
    test_case = crud.get_test_case(db, test_case_id)
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")
    
    interface = crud.get_interface(db, test_case.interface_id)
    project = crud.get_project(db, interface.project_id)
    
    code = script_generator.generate_script(project, interface, test_case)
    filepath, filename = script_generator.save_script_file(project.name, test_case.name, code)
    
    return {
        "code": code,
        "filename": filename,
        "download_url": f"/api/export/download/{filename}"
    }


@router.post("/excel")
def export_excel(request: schemas.ExportRequest, db: Session = Depends(database.get_db)):
    """导出Excel测试用例文档"""
    if request.project_id:
        project = crud.get_project(db, request.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        interfaces = crud.get_interfaces(db, project_id=request.project_id)
        test_cases = crud.get_test_cases_by_project(db, request.project_id)
    elif request.interface_id:
        interface = crud.get_interface(db, request.interface_id)
        if not interface:
            raise HTTPException(status_code=404, detail="Interface not found")
        
        project = crud.get_project(db, interface.project_id)
        interfaces = [interface]
        test_cases = crud.get_test_cases(db, interface_id=request.interface_id)
    else:
        raise HTTPException(status_code=400, detail="Must provide project_id or interface_id")
    
    filepath, filename = excel_generator.generate_excel(project, interfaces, test_cases)
    
    return {
        "filename": filename,
        "download_url": f"/api/export/download/{filename}"
    }


@router.get("/download/{filename}")
def download_file(filename: str):
    """下载生成的文件"""
    filepath = f"generated_tests/{filename}"
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        filepath,
        filename=filename,
        media_type="application/octet-stream"
    )


@router.post("/generate-code")
def generate_code(request: schemas.GenerateCodeRequest, db: Session = Depends(database.get_db)):
    """生成代码预览（不保存文件）"""
    test_case = crud.get_test_case(db, request.testcase_id)
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")
    
    interface = crud.get_interface(db, test_case.interface_id)
    project = crud.get_project(db, interface.project_id)
    
    if request.code_type == "pytest":
        code = pytest_generator.generate_pytest_code(project, interface, [test_case])
    elif request.code_type == "script":
        code = script_generator.generate_script(project, interface, test_case)
    else:
        raise HTTPException(status_code=400, detail="Invalid code_type. Use 'pytest' or 'script'")
    
    return {"code": code, "type": request.code_type}
