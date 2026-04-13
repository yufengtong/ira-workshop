from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import projects, interfaces, testcases, export

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Test Platform",
    description="API接口自动化测试平台",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(projects.router)
app.include_router(interfaces.router)
app.include_router(testcases.router)
app.include_router(export.router)


@app.get("/")
def root():
    return {
        "message": "API Test Platform Backend",
        "docs": "/docs"
    }
