# 股票分析平台

一个基于 React + Spring Boot 的股票分析平台,实时获取新浪财经数据并展示。

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Ant Design
- ECharts
- Axios

### 后端
- Spring Boot 3.2
- Spring Data JPA
- H2 数据库
- Maven

## 项目结构

```
qoder-test/
├── backend/              # 后端项目
│   ├── src/main/java/com/stock/
│   │   ├── StockAnalysisApplication.java
│   │   ├── controller/   # REST API控制器
│   │   ├── service/      # 业务逻辑
│   │   ├── model/        # 数据实体
│   │   ├── repository/   # 数据访问层
│   │   └── config/       # 配置类
│   └── pom.xml
└── frontend/             # 前端项目
    ├── src/
    │   ├── api/          # API调用
    │   ├── components/   # React组件
    │   ├── types/        # TypeScript类型
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## 快速开始

### 1. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端将运行在 http://localhost:8080

H2数据库控制台: http://localhost:8080/h2-console
- JDBC URL: jdbc:h2:mem:stockdb
- 用户名: sa
- 密码: (空)

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端将运行在 http://localhost:5173

## 功能特性

- ✅ 实时获取新浪财经股票数据
- ✅ 股票列表展示(代码、名称、价格、涨跌幅)
- ✅ 涨跌幅颜色标识(红涨绿跌)
- ✅ 股票价格走势图(ECharts)
- ✅ 自动刷新机制(30秒)
- ✅ H2数据库缓存历史数据
- ✅ 响应式UI设计
- ✅ 详细股票信息展示

## API接口

### 后端接口

- `GET /api/stocks/realtime?codes=sz002603,sz002604` - 获取实时行情
- `POST /api/stocks/refresh?codes=sz002603,sz002604` - 刷新并保存数据
- `GET /api/stocks/history/{code}?hours=24` - 获取历史数据

## 数据源

使用新浪财经API:
```
https://hq.sinajs.cn/list=sz002603,sz002604
Referer: https://finance.sina.com.cn
```

## 默认监控股票

- sz002603
- sz002604

## 开发说明

1. 前端通过Vite代理转发API请求到后端
2. 后端通过RestTemplate调用新浪API,设置Referer请求头
3. 解析返回的数据并保存到H2数据库
4. 前端每30秒自动刷新数据
5. 点击股票可查看详细信息和走势图

## 注意事项

- 新浪API可能在工作时间(9:30-15:00)返回实时数据
- 非交易时间返回的是最近一个交易日的数据
- 确保网络连接正常
