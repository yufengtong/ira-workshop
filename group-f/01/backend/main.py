"""
基金对比服务 - FastAPI 后端
提供基金数据查询和对比接口
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random

app = FastAPI(title="基金对比服务", version="1.0.0")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== 数据模型 ==============

class FundInfo(BaseModel):
    """基金基本信息"""
    code: str
    name: str
    type: str
    manager: str
    company: str
    establishment_date: str
    net_value: float
    total_assets: float


class FundPerformance(BaseModel):
    """基金业绩表现"""
    return_1m: float
    return_3m: float
    return_6m: float
    return_1y: float
    return_3y: float
    return_since_inception: float
    annualized_return: float
    max_drawdown: float
    sharpe_ratio: float
    volatility: float


class FundRisk(BaseModel):
    """基金风险指标"""
    risk_level: str
    alpha: float
    beta: float
    standard_deviation: float
    var_95: float


class FundDetail(BaseModel):
    """基金详情"""
    info: FundInfo
    performance: FundPerformance
    risk: FundRisk
    history: List[dict]


class FundCompareRequest(BaseModel):
    """基金对比请求"""
    fund_codes: List[str]


class FundCompareResponse(BaseModel):
    """基金对比响应"""
    funds: List[FundDetail]
    comparison_date: str


# ============== 模拟数据 ==============

# 模拟基金数据库
MOCK_FUNDS = {
    "000001": {
        "info": {
            "code": "000001",
            "name": "华夏成长混合",
            "type": "混合型",
            "manager": "王晓明",
            "company": "华夏基金",
            "establishment_date": "2001-12-18",
            "net_value": 1.5234,
            "total_assets": 45.6
        },
        "performance": {
            "return_1m": 2.35,
            "return_3m": 5.67,
            "return_6m": 8.92,
            "return_1y": 15.23,
            "return_3y": 28.45,
            "return_since_inception": 342.5,
            "annualized_return": 8.5,
            "max_drawdown": -18.5,
            "sharpe_ratio": 0.85,
            "volatility": 15.2
        },
        "risk": {
            "risk_level": "中高风险",
            "alpha": 2.3,
            "beta": 0.95,
            "standard_deviation": 14.8,
            "var_95": -2.5
        }
    },
    "000002": {
        "info": {
            "code": "000002",
            "name": "易方达蓝筹精选",
            "type": "股票型",
            "manager": "张坤",
            "company": "易方达基金",
            "establishment_date": "2018-09-05",
            "net_value": 2.8456,
            "total_assets": 523.8
        },
        "performance": {
            "return_1m": 3.12,
            "return_3m": 7.89,
            "return_6m": 12.34,
            "return_1y": 22.56,
            "return_3y": 45.67,
            "return_since_inception": 184.56,
            "annualized_return": 12.3,
            "max_drawdown": -25.3,
            "sharpe_ratio": 1.12,
            "volatility": 18.5
        },
        "risk": {
            "risk_level": "高风险",
            "alpha": 4.5,
            "beta": 1.05,
            "standard_deviation": 17.2,
            "var_95": -3.2
        }
    },
    "000003": {
        "info": {
            "code": "000003",
            "name": "招商中证白酒指数",
            "type": "指数型",
            "manager": "侯昊",
            "company": "招商基金",
            "establishment_date": "2015-05-27",
            "net_value": 1.2345,
            "total_assets": 892.3
        },
        "performance": {
            "return_1m": 1.89,
            "return_3m": 4.56,
            "return_6m": 6.78,
            "return_1y": 18.90,
            "return_3y": 35.67,
            "return_since_inception": 123.45,
            "annualized_return": 10.2,
            "max_drawdown": -32.1,
            "sharpe_ratio": 0.92,
            "volatility": 22.3
        },
        "risk": {
            "risk_level": "高风险",
            "alpha": 1.8,
            "beta": 1.15,
            "standard_deviation": 21.5,
            "var_95": -4.1
        }
    },
    "000004": {
        "info": {
            "code": "000004",
            "name": "广发稳健增长",
            "type": "混合型",
            "manager": "傅友兴",
            "company": "广发基金",
            "establishment_date": "2004-07-26",
            "net_value": 2.1234,
            "total_assets": 156.7
        },
        "performance": {
            "return_1m": 1.56,
            "return_3m": 4.23,
            "return_6m": 7.45,
            "return_1y": 12.34,
            "return_3y": 25.67,
            "return_since_inception": 412.3,
            "annualized_return": 9.8,
            "max_drawdown": -15.2,
            "sharpe_ratio": 1.05,
            "volatility": 12.3
        },
        "risk": {
            "risk_level": "中风险",
            "alpha": 3.2,
            "beta": 0.85,
            "standard_deviation": 11.8,
            "var_95": -1.8
        }
    },
    "000005": {
        "info": {
            "code": "000005",
            "name": "天弘余额宝货币",
            "type": "货币型",
            "manager": "王登峰",
            "company": "天弘基金",
            "establishment_date": "2013-05-29",
            "net_value": 1.0001,
            "total_assets": 7654.3
        },
        "performance": {
            "return_1m": 0.18,
            "return_3m": 0.55,
            "return_6m": 1.12,
            "return_1y": 2.25,
            "return_3y": 7.35,
            "return_since_inception": 28.5,
            "annualized_return": 2.3,
            "max_drawdown": -0.01,
            "sharpe_ratio": 0.15,
            "volatility": 0.2
        },
        "risk": {
            "risk_level": "低风险",
            "alpha": 0.05,
            "beta": 0.01,
            "standard_deviation": 0.15,
            "var_95": -0.001
        }
    }
}


def generate_history_data(fund_code: str) -> List[dict]:
    """生成基金历史净值数据"""
    history = []
    base_value = MOCK_FUNDS.get(fund_code, {}).get("info", {}).get("net_value", 1.0)
    
    # 生成过去一年的数据
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    current_date = start_date
    
    current_value = base_value * 0.85  # 从较低点开始
    
    while current_date <= end_date:
        # 模拟净值波动
        change = random.uniform(-0.02, 0.025)
        current_value = current_value * (1 + change)
        
        history.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "nav": round(current_value, 4),
            "accumulated_nav": round(current_value * 1.05, 4)
        })
        
        current_date += timedelta(days=1)
    
    return history


# ============== API 接口 ==============

@app.get("/")
def root():
    """根路径"""
    return {"message": "基金对比服务 API", "version": "1.0.0"}


@app.get("/api/funds/search")
def search_funds(keyword: Optional[str] = None) -> List[FundInfo]:
    """搜索基金"""
    results = []
    for code, data in MOCK_FUNDS.items():
        if keyword is None or \
           keyword.lower() in code.lower() or \
           keyword.lower() in data["info"]["name"].lower():
            results.append(FundInfo(**data["info"]))
    return results


@app.get("/api/funds/{fund_code}")
def get_fund_detail(fund_code: str) -> FundDetail:
    """获取基金详情"""
    if fund_code not in MOCK_FUNDS:
        raise HTTPException(status_code=404, detail=f"基金 {fund_code} 不存在")
    
    fund_data = MOCK_FUNDS[fund_code]
    history = generate_history_data(fund_code)
    
    return FundDetail(
        info=FundInfo(**fund_data["info"]),
        performance=FundPerformance(**fund_data["performance"]),
        risk=FundRisk(**fund_data["risk"]),
        history=history
    )


@app.post("/api/funds/compare")
def compare_funds(request: FundCompareRequest) -> FundCompareResponse:
    """对比多只基金"""
    if len(request.fund_codes) < 2:
        raise HTTPException(status_code=400, detail="至少需要选择2只基金进行对比")
    
    if len(request.fund_codes) > 5:
        raise HTTPException(status_code=400, detail="最多支持5只基金同时对比")
    
    funds = []
    for code in request.fund_codes:
        if code not in MOCK_FUNDS:
            raise HTTPException(status_code=404, detail=f"基金 {code} 不存在")
        
        fund_data = MOCK_FUNDS[code]
        history = generate_history_data(code)
        
        funds.append(FundDetail(
            info=FundInfo(**fund_data["info"]),
            performance=FundPerformance(**fund_data["performance"]),
            risk=FundRisk(**fund_data["risk"]),
            history=history
        ))
    
    return FundCompareResponse(
        funds=funds,
        comparison_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )


@app.get("/api/funds/popular/list")
def get_popular_funds() -> List[FundInfo]:
    """获取热门基金列表"""
    return [FundInfo(**data["info"]) for data in MOCK_FUNDS.values()]


# ============== 启动入口 ==============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
