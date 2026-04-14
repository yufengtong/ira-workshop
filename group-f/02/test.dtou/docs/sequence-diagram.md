# 南方基金产品布局战略系统 - 时序图

## 1. 系统启动与数据初始化流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant SpringBoot as Spring Boot应用
    participant TushareConfig as Tushare配置类
    participant DataInitializer as 数据初始化器
    participant TushareClient as Tushare客户端
    participant TushareAPI as Tushare API
    participant MySQL as MySQL数据库

    User->>SpringBoot: 启动应用 (mvn spring-boot:run)
    SpringBoot->>TushareConfig: 初始化配置类
    TushareConfig->>TushareConfig: 检查tushare.token
    alt Token为空
        TushareConfig->>TushareConfig: 读取.env文件
        TushareConfig->>TushareConfig: 解析TUSHARE_TOKEN
    end
    TushareConfig-->>SpringBoot: 配置完成
    
    SpringBoot->>DataInitializer: 执行CommandLineRunner
    DataInitializer->>TushareClient: 请求基金公司数据
    TushareClient->>TushareAPI: POST /fund_company
    TushareAPI-->>TushareClient: 返回30家基金公司
    TushareClient-->>DataInitializer: 解析JSON数据
    DataInitializer->>MySQL: 插入基金公司数据
    
    DataInitializer->>TushareClient: 请求基金产品数据
    TushareClient->>TushareAPI: POST /fund_basic
    TushareAPI-->>TushareClient: 返回100只基金产品
    TushareClient-->>DataInitializer: 解析JSON数据
    DataInitializer->>MySQL: 插入基金产品数据
    
    DataInitializer->>MySQL: 更新公司统计数据
    DataInitializer->>MySQL: 插入战略分析数据
    DataInitializer-->>SpringBoot: 初始化完成
    SpringBoot-->>User: 应用启动成功
```

## 2. 用户查看行业布局流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as React前端
    participant IndustryController as 行业控制器
    participant IndustryService as 行业服务层
    participant FundIndustryMapper as 行业Mapper
    participant FundProductMapper as 产品Mapper
    participant MySQL as MySQL数据库

    User->>Frontend: 点击"行业布局"菜单
    Frontend->>IndustryController: GET /api/industries/distribution
    IndustryController->>IndustryService: getIndustryDistribution()
    IndustryService->>FundIndustryMapper: 查询所有行业
    FundIndustryMapper->>MySQL: SELECT * FROM fund_industry
    MySQL-->>FundIndustryMapper: 返回10个行业
    FundIndustryMapper-->>IndustryService: 行业列表
    
    loop 每个行业
        IndustryService->>FundProductMapper: 统计该行业产品数
        FundProductMapper->>MySQL: SELECT COUNT(*) WHERE industry_code=?
        MySQL-->>FundProductMapper: 产品数量
        FundProductMapper-->>IndustryService: 数量
    end
    
    IndustryService->>IndustryService: 计算市场份额
    IndustryService-->>IndustryController: 行业分布DTO列表
    IndustryController-->>Frontend: JSON响应
    Frontend->>Frontend: 渲染ECharts热力图
    Frontend-->>User: 显示行业分布可视化
```

## 3. 用户查看公司详情流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as React前端
    participant CompanyController as 公司控制器
    participant CompanyService as 公司服务层
    participant FundCompanyMapper as 公司Mapper
    participant FundProductMapper as 产品Mapper
    participant CompanyStrategyMapper as 战略Mapper
    participant MySQL as MySQL数据库

    User->>Frontend: 点击某基金公司
    Frontend->>CompanyController: GET /api/companies/{code}/products
    CompanyController->>CompanyService: getCompanyProducts(code)
    
    CompanyService->>FundCompanyMapper: 查询公司信息
    FundCompanyMapper->>MySQL: SELECT * FROM fund_company WHERE code=?
    MySQL-->>FundCompanyMapper: 公司信息
    FundCompanyMapper-->>CompanyService: FundCompany
    
    CompanyService->>FundProductMapper: 查询公司产品
    FundProductMapper->>MySQL: SELECT * FROM fund_product WHERE company_code=?
    MySQL-->>FundProductMapper: 产品列表
    FundProductMapper-->>CompanyService: 产品列表
    
    CompanyService->>CompanyService: 按状态分类统计
    CompanyService->>CompanyService: 按行业分类统计
    CompanyService-->>CompanyController: CompanyProductDTO
    CompanyController-->>Frontend: JSON响应
    Frontend->>Frontend: 渲染产品矩阵表格
    Frontend-->>User: 显示公司产品布局
    
    User->>Frontend: 切换"战略分析"标签
    Frontend->>CompanyController: GET /api/companies/{code}/strategy
    CompanyController->>CompanyService: getCompanyStrategy(code)
    CompanyService->>CompanyStrategyMapper: 查询战略分析
    CompanyStrategyMapper->>MySQL: SELECT * FROM company_strategy WHERE code=?
    MySQL-->>CompanyStrategyMapper: 战略数据
    CompanyStrategyMapper-->>CompanyService: CompanyStrategy
    CompanyService->>CompanyService: 计算战略评分
    CompanyService-->>CompanyController: StrategyAnalysisDTO
    CompanyController-->>Frontend: JSON响应
    Frontend->>Frontend: 渲染雷达图和评分
    Frontend-->>User: 显示战略分析结果
```

## 4. 市场空白点分析流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as React前端
    participant AnalysisController as 分析控制器
    participant AnalysisService as 分析服务层
    participant FundIndustryMapper as 行业Mapper
    participant FundProductMapper as 产品Mapper
    participant MySQL as MySQL数据库

    User->>Frontend: 点击"市场空白"菜单
    Frontend->>AnalysisController: GET /api/analysis/gaps
    AnalysisController->>AnalysisService: analyzeMarketGaps()
    
    AnalysisService->>FundIndustryMapper: 查询所有行业
    FundIndustryMapper->>MySQL: SELECT * FROM fund_industry
    MySQL-->>FundIndustryMapper: 行业列表
    FundIndustryMapper-->>AnalysisService: 行业列表
    
    loop 每个行业
        AnalysisService->>FundProductMapper: 统计当前产品数
        FundProductMapper->>MySQL: SELECT COUNT(*) WHERE industry_code=?
        MySQL-->>FundProductMapper: 当前数量
        FundProductMapper-->>AnalysisService: 数量
        AnalysisService->>AnalysisService: 计算潜在需求
        AnalysisService->>AnalysisService: 计算机会评分
    end
    
    AnalysisService->>AnalysisService: 按机会评分排序
    AnalysisService-->>AnalysisController: MarketGapDTO列表
    AnalysisController-->>Frontend: JSON响应
    Frontend->>Frontend: 渲染机会评分表格
    Frontend-->>User: 显示市场空白点分析
```

## 5. 优秀案例推荐流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as React前端
    participant AnalysisController as 分析控制器
    participant AnalysisService as 分析服务层
    participant FundCompanyMapper as 公司Mapper
    participant CompanyStrategyMapper as 战略Mapper
    participant MySQL as MySQL数据库

    User->>Frontend: 点击"优秀案例"菜单
    Frontend->>AnalysisController: GET /api/analysis/best-practices
    AnalysisController->>AnalysisService: getBestPractices()
    
    AnalysisService->>FundCompanyMapper: 查询所有公司
    FundCompanyMapper->>MySQL: SELECT * FROM fund_company
    MySQL-->>FundCompanyMapper: 公司列表
    FundCompanyMapper-->>AnalysisService: 公司列表
    
    loop 每个公司
        AnalysisService->>CompanyStrategyMapper: 查询战略数据
        CompanyStrategyMapper->>MySQL: SELECT * FROM company_strategy WHERE code=?
        MySQL-->>CompanyStrategyMapper: 战略数据
        CompanyStrategyMapper-->>AnalysisService: CompanyStrategy
        AnalysisService->>AnalysisService: 计算综合评分
        AnalysisService->>AnalysisService: 识别核心优势
    end
    
    AnalysisService->>AnalysisService: 按评分排序取Top10
    AnalysisService-->>AnalysisController: BestPracticeDTO列表
    AnalysisController-->>Frontend: JSON响应
    Frontend->>Frontend: 渲染案例卡片
    Frontend-->>User: 显示优秀案例推荐
```

## 6. 数据同步流程

```mermaid
sequenceDiagram
    participant Admin as 管理员
    participant Frontend as React前端
    participant SyncController as 同步控制器
    participant SyncService as 同步服务层
    participant TushareClient as Tushare客户端
    participant TushareAPI as Tushare API
    participant FundCompanyMapper as 公司Mapper
    participant FundProductMapper as 产品Mapper
    participant MySQL as MySQL数据库

    Admin->>Frontend: 点击"数据同步"按钮
    Frontend->>SyncController: POST /api/sync/all
    SyncController->>SyncService: syncAllData()
    
    SyncService->>TushareClient: 请求最新基金公司数据
    TushareClient->>TushareAPI: POST /fund_company
    TushareAPI-->>TushareClient: 返回最新数据
    TushareClient-->>SyncService: 解析后的数据
    
    loop 每个公司
        SyncService->>FundCompanyMapper: 检查是否存在
        FundCompanyMapper->>MySQL: SELECT * WHERE code=?
        MySQL-->>FundCompanyMapper: 查询结果
        alt 公司不存在
            FundCompanyMapper->>MySQL: INSERT INTO fund_company
            MySQL-->>FundCompanyMapper: 插入成功
        else 公司已存在
            FundCompanyMapper->>MySQL: UPDATE fund_company
            MySQL-->>FundCompanyMapper: 更新成功
        end
    end
    
    SyncService->>TushareClient: 请求最新基金产品数据
    TushareClient->>TushareAPI: POST /fund_basic
    TushareAPI-->>TushareClient: 返回最新数据
    TushareClient-->>SyncService: 解析后的数据
    
    loop 每个产品
        SyncService->>FundProductMapper: 检查是否存在
        FundProductMapper->>MySQL: SELECT * WHERE ts_code=?
        MySQL-->>FundProductMapper: 查询结果
        alt 产品不存在
            FundProductMapper->>MySQL: INSERT INTO fund_product
            MySQL-->>FundProductMapper: 插入成功
        else 产品已存在
            FundProductMapper->>MySQL: UPDATE fund_product
            MySQL-->>FundProductMapper: 更新成功
        end
    end
    
    SyncService-->>SyncController: 同步结果统计
    SyncController-->>Frontend: JSON响应
    Frontend-->>Admin: 显示同步成功提示
```

## 7. 前端路由跳转流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant Browser as 浏览器
    participant ReactRouter as React Router
    participant Layout as 布局组件
    participant Page as 页面组件
    participant Zustand as Zustand状态管理
    participant API as API服务层

    User->>Browser: 输入URL或点击导航
    Browser->>ReactRouter: 路由匹配
    ReactRouter->>Layout: 渲染主布局
    Layout->>Layout: 渲染侧边栏菜单
    Layout->>Layout: 渲染顶部导航
    
    alt 需要权限验证
        Layout->>Zustand: 检查用户登录状态
        Zustand-->>Layout: 返回认证状态
        alt 未登录
            Layout->>ReactRouter: 重定向到登录页
        end
    end
    
    Layout->>Page: 渲染页面组件
    Page->>Zustand: 获取全局状态
    Zustand-->>Page: 返回状态数据
    
    alt 需要加载数据
        Page->>API: 调用API接口
        API-->>Page: 返回数据
        Page->>Zustand: 更新状态
        Page->>Page: 更新本地state
    end
    
    Page->>Page: 渲染图表组件
    Page->>Page: 渲染表格组件
    Page-->>Layout: 页面渲染完成
    Layout-->>ReactRouter: 布局渲染完成
    ReactRouter-->>Browser: 路由处理完成
    Browser-->>User: 显示页面内容
```

## 组件说明

| 组件 | 职责 |
|------|------|
| **Spring Boot应用** | 后端服务入口，负责应用生命周期管理 |
| **TushareConfig** | 配置管理，自动加载.env文件中的Token |
| **DataInitializer** | 应用启动时初始化数据 |
| **TushareClient** | 封装Tushare API调用 |
| **XxxController** | REST API控制器，处理HTTP请求 |
| **XxxService** | 业务逻辑层，处理核心业务 |
| **XxxMapper** | 数据访问层，使用MyBatis-Plus |
| **React前端** | 用户界面，使用Ant Design + ECharts |
| **Zustand** | 前端状态管理 |
| **React Router** | 前端路由管理 |
