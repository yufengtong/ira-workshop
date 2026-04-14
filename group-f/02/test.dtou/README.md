# 南方基金产品布局战略系统

面向公募基金高管和产品开发部领导的产品布局战略分析平台，支持按行业/公司维度查看产品布局、分析竞品战略、赋能产品规划决策。

## 功能特性

### 1. 行业维度分析
- 行业产品分布热力图
- 行业规模/数量趋势
- 行业竞争格局分析
- 行业机会识别

### 2. 公司维度分析
- 公司产品矩阵视图
- 产品状态分布（运作中/待发售/上报中）
- 公司战略标签（均衡型/聚焦型/激进型等）
- 竞品对标分析

### 3. 战略分析引擎
- 布局密度分析
- 产品空白点识别
- 战略差异化评分
- 优秀案例推荐

## 技术栈

- **后端**: Java 17 + Spring Boot 3.x + MyBatis-Plus + MySQL 8
- **前端**: React 18 + TypeScript + Ant Design + ECharts
- **数据**: Tushare API (通过.env配置)

## 快速开始

### 环境要求
- JDK 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

### 1. 克隆项目
```bash
cd southern-fund-strategy
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入您的 Tushare Token 和数据库配置
```

### 3. 初始化数据库
```bash
mysql -u root -p < backend/src/main/resources/db/schema.sql
```

### 4. 配置Tushare Token
编辑 `.env` 文件，填入您的Tushare Token：
```bash
TUSHARE_TOKEN=your_token_here
```

### 5. 启动后端服务
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

后端服务默认运行在 http://localhost:8080/api

应用启动时会自动从Tushare API加载初始数据。

### 6. 启动前端服务
```bash
cd frontend
npm install
npm run dev
```

前端服务默认运行在 http://localhost:3000

## 项目结构

```
southern-fund-strategy/
├── backend/                    # 后端项目
│   ├── src/main/java/         # Java源代码
│   │   └── com/southern/fund/
│   │       ├── controller/    # 控制器层
│   │       ├── service/       # 服务层
│   │       ├── mapper/        # 数据访问层
│   │       ├── entity/        # 实体类
│   │       ├── dto/           # 数据传输对象
│   │       ├── config/        # 配置类
│   │       └── utils/         # 工具类
│   ├── src/main/resources/    # 配置文件
│   │   ├── db/               # 数据库脚本
│   │   └── application.yml   # 应用配置
│   └── pom.xml               # Maven配置
├── frontend/                  # 前端项目
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   ├── components/       # 通用组件
│   │   ├── services/         # API服务
│   │   ├── types/            # TypeScript类型
│   │   ├── store/            # 状态管理
│   │   └── styles/           # 样式文件
│   ├── package.json
│   └── vite.config.ts
└── .env.example              # 环境变量模板
```

## API 接口

### 行业相关
- `GET /api/industries` - 获取行业列表
- `GET /api/industries/distribution` - 获取行业分布数据
- `GET /api/industries/{id}` - 获取行业详情

### 公司相关
- `GET /api/companies` - 获取公司列表
- `GET /api/companies/{code}` - 获取公司详情
- `GET /api/companies/{code}/products` - 获取公司产品
- `GET /api/companies/{code}/strategy` - 获取公司战略分析

### 分析相关
- `GET /api/analysis/gaps` - 市场空白点分析
- `GET /api/analysis/best-practices` - 优秀案例
- `POST /api/analysis/company/{code}/analyze` - 分析公司战略

### 同步相关
- `POST /api/sync/all` - 同步所有数据
- `POST /api/sync/companies` - 同步公司数据
- `POST /api/sync/products` - 同步产品数据

## 数据说明

本项目使用 Tushare 金融数据接口获取基金数据。您需要：
1. 注册 Tushare 账号：https://tushare.pro
2. 获取个人 Token
3. 在 .env 文件中配置 TUSHARE_TOKEN

⚠️ **注意**: Token 仅允许在本项目使用，禁止外传。

## 战略类型说明

| 类型 | 英文名 | 特征描述 |
|------|--------|----------|
| 均衡型 | balanced | 产品线完整，覆盖主流领域 |
| 聚焦型 | focused | 深耕细分领域，形成差异化优势 |
| 激进型 | aggressive | 积极扩张，快速布局新兴领域 |
| 保守型 | conservative | 稳健经营，注重风险控制 |

## 开发计划

- [x] 项目初始化
- [x] 后端基础架构
- [x] 数据同步模块
- [x] 核心业务接口
- [x] 前端框架搭建
- [x] 行业视图页面
- [x] 公司视图页面
- [x] 战略分析看板
- [x] 测试和优化

## 许可证

本项目仅供内部使用，未经授权不得外传。
