from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    base_url = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    interfaces = relationship("Interface", back_populates="project", cascade="all, delete-orphan")


class Interface(Base):
    __tablename__ = "interfaces"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(100), nullable=False)
    path = Column(String(500), nullable=False)
    method = Column(String(10), nullable=False)
    headers = Column(JSON, default=dict)
    request_body = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    project = relationship("Project", back_populates="interfaces")
    test_cases = relationship("TestCase", back_populates="interface", cascade="all, delete-orphan")


class TestCase(Base):
    __tablename__ = "test_cases"
    
    id = Column(Integer, primary_key=True, index=True)
    interface_id = Column(Integer, ForeignKey("interfaces.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    request_params = Column(JSON, default=dict)
    request_body = Column(JSON, nullable=True)
    expected_status = Column(Integer, nullable=False)
    expected_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    interface = relationship("Interface", back_populates="test_cases")
