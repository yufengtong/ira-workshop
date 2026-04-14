# 南方基金产品布局战略系统 - 架构图

## 1. 系统整体架构图

```mermaid
graph TB
    subgraph 用户层["用户层"]
        User[公募基金高管/产品开发部领导]
    end

    subgraph 前端层["前端层 - React + TypeScript"]
        UI[Ant Design UI组件]
        Charts[ECharts 可视化图表]
        Router[React Router 路由]
        Store[Zustand 状态管理]
        Pages[页面组件]
    end

    subgraph 后端层["后端层 - Spring Boot"]
        Controller[REST API控制器]
        Service[业务服务层]
        Mapper[数据访问层 MyBatis-Plus]
        Entity[实体类]
        Config[配置类]
        Utils[工具类]
    end

    subgraph 数据层["数据层"]
        MySQL[(MySQL数据库)]
        TushareAPI[Tushare Pro API]
    end

    User -->|浏览/分析| UI
    UI --> Pages
    Pages --> Router
    Pages --> Store
    Pages --> Charts
    
    Pages -->|HTTP请求| Controller
    Controller --> Service
    Service --> Mapper
    Service --> Utils
    Mapper --> Entity
    
    Mapper -->|CRUD| MySQL
    Utils -->|API调用| TushareAPI
    Config -->|初始化| Service
```

## 2. 前端页面结构图

```mermaid
graph LR
    subgraph 布局["Layout布局"]
        Header[顶部导航]
        Sidebar[侧边栏菜单]
        Content[内容区域]
    end

    subgraph 路由页面["路由页面"]
        Dashboard[战略仪表盘<br/>StrategyDashboard]
        Industry[行业布局<br/>IndustryView]
        Company[公司布局<br/>CompanyView]
    end

    subgraph 组件库["公共组件"]
        StatCard[统计卡片]
        ScoreRing[评分环]
        StrategyTag[战略标签]
    end

    Sidebar -->|点击导航| Router[React Router]
    Router --> Dashboard
    Router --> Industry
    Router --> Company
    
    Dashboard --> StatCard
    Dashboard --> ScoreRing
    Dashboard --> StrategyTag
    Industry --> StatCard
    Company --> StatCard
```

## 3. 后端服务架构图

```mermaid
graph TB
    subgraph Controller层["Controller层 - REST API"]
        CC[CompanyController<br/>公司相关API]
        IC[IndustryController<br/>行业相关API]
        AC[AnalysisController<br/>分析相关API]
        SC[SyncController<br/>同步相关API]
    end

    subgraph Service层["Service层 - 业务逻辑"]
        CS[FundCompanyService<br/>公司服务]
        IS[FundIndustryService<br/>行业服务]
        SAS[StrategyAnalysisService<br/>战略分析服务]
        DSS[DataSyncService<br/>数据同步服务]
    end

    subgraph ServiceImpl层["ServiceImpl层 - 实现"]
        CSI[FundCompanyServiceImpl]
        ISI[FundIndustryServiceImpl]
        SASI[StrategyAnalysisServiceImpl]
        DSSI[DataSyncServiceImpl]
    end

    subgraph Mapper层["Mapper层 - 数据访问"]
        CM[FundCompanyMapper]
        IM[FundIndustryMapper]
        PM[FundProductMapper]
        SM[CompanyStrategyMapper]
        PSM[ProductStatusMapper]
    end

    CC --> CS
    IC --> IS
    AC --> SAS
    SC --> DSS
    
    CS --> CSI
    IS --> ISI
    SAS --> SASI
    DSS --> DSSI
    
    CSI --> CM
    CSI --> PM
    ISI --> IM
    SASI --> SM
    DSSI --> CM
    DSSI --> PM
```

## 4. 数据实体关系图

```mermaid
erDiagram
    FUND_COMPANY ||--o{ FUND_PRODUCT : "发布"
    FUND_COMPANY ||--o| COMPANY_STRATEGY : "拥有"
    FUND_INDUSTRY ||--o{ FUND_PRODUCT : "分类"
    FUND_PRODUCT ||--o| PRODUCT_STATUS : "状态"

    FUND_COMPANY {
        bigint id PK
        varchar company_code UK
        varchar company_name
        varchar short_name
        varchar establish_date
        decimal total_asset
        int product_count
        varchar strategy_type
        text strategy_desc
    }

    FUND_PRODUCT {
        bigint id PK
        varchar ts_code UK
        varchar name
        varchar company_code FK
        varchar fund_type
        varchar industry_code FK
        varchar status
        decimal asset
        varchar establish_date
    }

    FUND_INDUSTRY {
        bigint id PK
        varchar industry_code UK
        varchar industry_name
        varchar parent_code
        int level
        text description
    }

    COMPANY_STRATEGY {
        bigint id PK
        varchar company_code FK
        varchar strategy_type
        varchar strategy_name
        decimal concentration_score
        decimal diversification_score
        decimal innovation_score
        text analysis_desc
    }

    PRODUCT_STATUS {
        bigint id PK
        varchar status_code UK
        varchar status_name
        varchar color
        int sort_order
    }
```

## 5. 数据流图 - 系统启动初始化

```mermaid
sequenceDiagram
    participant SpringBoot as Spring Boot
    participant TushareConfig as TushareConfig
    participant DataInitializer as DataInitializer
    participant TushareClient as TushareClient
    participant TushareAPI as Tushare API
    participant MySQL as MySQL

    SpringBoot->>TushareConfig: 初始化配置
    TushareConfig->>TushareConfig: 读取.env文件
    TushareConfig->>TushareConfig: 加载TUSHARE_TOKEN
    TushareConfig-->>SpringBoot: 配置完成

    SpringBoot->>DataInitializer: 执行CommandLineRunner
    
    DataInitializer->>TushareClient: 请求基金公司数据
    TushareClient->>TushareAPI: POST /fund_company
    TushareAPI-->>TushareClient: 返回30家基金公司
    TushareClient-->>DataInitializer: JSON数据
    DataInitializer->>MySQL: 插入fund_company表

    DataInitializer->>TushareClient: 请求基金产品数据
    TushareClient->>TushareAPI: POST /fund_basic
    TushareAPI-->>TushareClient: 返回100只基金产品
    TushareClient-->>DataInitializer: JSON数据
    DataInitializer->>MySQL: 插入fund_product表

    DataInitializer->>MySQL: 更新公司统计数据
    DataInitializer->>MySQL: 插入战略分析数据
```

## 6. 数据流图 - 用户查看行业布局

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as React前端
    participant IndustryController as IndustryController
    participant IndustryService as FundIndustryService
    participant IndustryMapper as FundIndustryMapper
    participant ProductMapper as FundProductMapper
    participant MySQL as MySQL

    User->>Frontend: 点击"行业布局"菜单
    Frontend->>IndustryController: GET /api/industries/distribution
    IndustryController->>IndustryService: getIndustryDistribution()
    
    IndustryService->>IndustryMapper: 查询所有行业
    IndustryMapper->>MySQL: SELECT * FROM fund_industry
    MySQL-->>IndustryMapper: 10个行业
    IndustryMapper-->>IndustryService: 行业列表
    
    loop 每个行业
        IndustryService->>ProductMapper: 统计产品数
        ProductMapper->>MySQL: SELECT COUNT(*)
        MySQL-->>ProductMapper: 数量
        ProductMapper-->>IndustryService: 返回
    end
    
    IndustryService->>IndustryService: 计算市场份额
    IndustryService-->>IndustryController: IndustryDistributionDTO列表
    IndustryController-->>Frontend: JSON响应
    Frontend->>Frontend: ECharts渲染热力图
    Frontend-->>User: 显示行业分布
```

## 7. 数据流图 - 用户查看公司详情

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as React前端
    participant CompanyController as CompanyController
    participant CompanyService as FundCompanyService
    participant CompanyMapper as FundCompanyMapper
    participant ProductMapper as FundProductMapper
    participant StrategyMapper as CompanyStrategyMapper
    participant MySQL as MySQL

    User->>Frontend: 点击某基金公司
    Frontend->>CompanyController: GET /api/companies/{code}/products
    CompanyController->>CompanyService: getCompanyProducts(code)
    
    CompanyService->>CompanyMapper: 查询公司信息
    CompanyMapper->>MySQL: SELECT * FROM fund_company
    MySQL-->>CompanyMapper: 公司信息
    CompanyMapper-->>CompanyService: FundCompany
    
    CompanyService->>ProductMapper: 查询公司产品
    ProductMapper->>MySQL: SELECT * FROM fund_product
    MySQL-->>ProductMapper: 产品列表
    ProductMapper-->>CompanyService: 产品列表
    
    CompanyService->>CompanyService: 按状态/行业分类统计
    CompanyService-->>CompanyController: CompanyProductDTO
    IndustryController-->>Frontend: JSON响应
    Frontend-->>User: 显示产品矩阵

    User->>Frontend: 切换"战略分析"标签
    Frontend->>CompanyController: GET /api/companies/{code}/strategy
    CompanyController->>CompanyService: getCompanyStrategy(code)
    CompanyService->>StrategyMapper: 查询战略数据
    StrategyMapper->>MySQL: SELECT * FROM company_strategy
    MySQL-->>StrategyMapper: 战略数据
    StrategyMapper-->>CompanyService: CompanyStrategy
    CompanyService->>CompanyService: 计算战略评分
    CompanyService-->>CompanyController: StrategyAnalysisDTO
    CompanyController-->>Frontend: JSON响应
    Frontend-->>User: 显示雷达图和评分
```

## 8. 模块依赖关系图

```mermaid
graph TB
    subgraph Frontend["前端模块"]
        Pages["pages/"]
        Components["components/"]
        Services["services/"]
        Store["store/"]
        Types["types/"]
    end

    subgraph Backend["后端模块"]
        Controllers["controller/"]
        ServicesB["service/"]
        Mappers["mapper/"]
        Entities["entity/"]
        DTOs["dto/"]
        Configs["config/"]
        Utils["utils/"]
    end

    Pages --> Components
    Pages --> Services
    Pages --> Store
    Services --> Types
    Store --> Types
    Components --> Types

    Controllers --> ServicesB
    ServicesB --> Mappers
    ServicesB --> Entities
    ServicesB --> Utils
    ServicesB --> DTOs
    Mappers --> Entities
    Configs --> Utils
```

## 9. 技术栈全景图

```mermaid
graph TB
    subgraph 前端技术栈["前端技术栈"]
        React["React 18"]
        TS["TypeScript"]
        Vite["Vite构建工具"]
        AntD["Ant Design"]
        ECharts["ECharts图表"]
        Zustand["Zustand状态管理"]
        ReactRouter["React Router"]
    end

    subgraph 后端技术栈["后端技术栈"]
        SpringBoot["Spring Boot 3.x"]
        MyBatisPlus["MyBatis-Plus"]
        Lombok["Lombok"]
        HttpClient["Apache HttpClient 5"]
        Jackson["Jackson JSON"]
    end

    subgraph 数据存储["数据存储"]
        MySQL[(MySQL 8)]
        Tushare[(Tushare Pro API)]
    end

    subgraph 开发工具["开发工具"]
        Maven["Maven构建"]
        Node["Node.js/npm"]
        Git["Git版本控制"]
    end

    React --> TS
    TS --> Vite
    AntD --> React
    ECharts --> React
    Zustand --> React
    ReactRouter --> React

    SpringBoot --> MyBatisPlus
    SpringBoot --> Lombok
    SpringBoot --> HttpClient
    SpringBoot --> Jackson

    MyBatisPlus --> MySQL
    HttpClient --> Tushare
```

## 10. 项目文件结构图

```mermaid
graph TD
    Root["southern-fund-strategy/"] --> Frontend["frontend/"]
    Root --> Backend["backend/"]
    Root --> Docs["docs/"]
    Root --> Env[".env"]
    Root --> Readme["README.md"]

    Frontend --> FSrc["src/"]
    Frontend --> FPublic["public/"]
    Frontend --> FConfig["vite.config.ts"]
    Frontend --> FPackage["package.json"]

    FSrc --> FPages["pages/"]
    FSrc --> FComponents["components/"]
    FSrc --> FServices["services/"]
    FSrc --> FStore["store/"]
    FSrc --> FTypes["types/"]
    FSrc --> FApp["App.tsx"]
    FSrc --> FMain["main.tsx"]

    Backend --> BSrc["src/"]
    Backend --> BPom["pom.xml"]

    BSrc --> BMain["main/java/..."]
    BSrc --> BTest["test/java/..."]
    BSrc --> BResources["resources/"]

    BMain --> BController["controller/"]
    BMain --> BService["service/"]
    BMain --> BMapper["mapper/"]
    BMain --> BEntity["entity/"]
    BMain --> BDTO["dto/"]
    BMain --> BConfig["config/"]
    BMain --> BUtils["utils/"]

    Docs --> Arch["architecture-mermaid.md"]
    Docs --> Sequence["sequence-diagram.md"]
```

---

## 图谱分析结果

基于代码扫描生成的知识图谱分析:

### 关键节点 (连接数最多)
| 排名 | 节点 | 连接数 | 说明 |
|------|------|--------|------|
| 1 | FundCompanyServiceImpl.java | 21 | 公司服务实现核心 |
| 2 | DataInitializer.java | 19 | 数据初始化器 |
| 3 | StrategyAnalysisServiceImpl.java | 19 | 战略分析服务实现 |
| 4 | DataSyncServiceImpl.java | 19 | 数据同步服务实现 |
| 5 | FundIndustryServiceImpl.java | 17 | 行业服务实现 |
| 6 | TushareClient.java | 15 | Tushare API客户端 |
| 7 | CompanyView.tsx | 12 | 公司视图页面 |
| 8 | StrategyDashboard.tsx | 10 | 战略仪表盘页面 |
| 9 | TushareApiTest.java | 10 | API测试类 |
| 10 | TushareConfig.java | 10 | 配置类 |

### 社区分布 (代码模块分组)
- 社区0: 9节点 - 前端页面组件
- 社区1: 7节点 - 后端服务实现
- 社区2-6: 6节点 - 各业务模块
- 其他: 5节点 - 工具类和配置

### 架构特点
1. **分层清晰**: Controller -> Service -> Mapper 三层架构
2. **前后端分离**: React前端 + Spring Boot后端
3. **数据驱动**: 从Tushare API获取真实数据
4. **模块化**: 按业务功能划分模块，职责单一
