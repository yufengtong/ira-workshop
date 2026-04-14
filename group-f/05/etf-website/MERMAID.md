# ETF 涨跌幅排名网站 - Mermaid 架构图集

---

## 1. 系统架构总览

```mermaid
graph TB
    subgraph Browser["浏览器 (前端)"]
        UI["public/index.html<br/>单页面应用"]
        UI --> RankTable["ETF 排名表格"]
        UI --> OpinionCards["舆情分析卡片"]
        UI --> StatusBar["交易状态 / 倒计时"]
    end

    subgraph Server["Express Server (server.js)"]
        Router["API 路由层"]
        Cache["内存缓存<br/>etfData + lastUpdated"]
        Scheduler["定时刷新调度器<br/>scheduleNextRefresh()"]
    end

    subgraph Services["业务服务层 (services/)"]
        ETFData["etf-data.js<br/>ETF 行情数据服务"]
        Opinions["opencli-opinions.js<br/>舆情获取服务"]
        Analyzer["opinion-analyzer.js<br/>情绪分析引擎"]
        Calendar["trading-calendar.js<br/>交易日历工具"]
    end

    subgraph External["外部数据源"]
        EastMoney["东方财富 API<br/>push2.eastmoney.com"]
        OpenCLI["OpenCLI CLI"]
        Sina["新浪财经"]
        Xueqiu["雪球"]
        Zhihu["知乎"]
        Weibo["微博"]
    end

    Browser -- "HTTP API 请求" --> Server
    Router --> Cache
    Scheduler --> ETFData
    Scheduler --> Calendar
    Router --> ETFData
    Router --> Opinions
    Router --> Calendar
    Opinions --> Analyzer
    ETFData --> EastMoney
    Opinions --> OpenCLI
    OpenCLI --> Sina
    OpenCLI --> Xueqiu
    OpenCLI --> Zhihu
    OpenCLI --> Weibo

    style Browser fill:#1a2332,stroke:#3b82f6,color:#e5e7eb
    style Server fill:#1a2332,stroke:#10b981,color:#e5e7eb
    style Services fill:#1a2332,stroke:#f59e0b,color:#e5e7eb
    style External fill:#1a2332,stroke:#ef4444,color:#e5e7eb
```

---

## 2. 模块依赖关系图

```mermaid
graph LR
    ServerJS["server.js<br/>(入口)"]

    ETFData["services/<br/>etf-data.js"]
    OpenCLI["services/<br/>opencli-opinions.js"]
    Analyzer["services/<br/>opinion-analyzer.js"]
    Calendar["services/<br/>trading-calendar.js"]
    IndexHTML["public/<br/>index.html"]

    ServerJS -- "import fetchETFRanking" --> ETFData
    ServerJS -- "import fetchOpinions" --> OpenCLI
    ServerJS -- "import analyzeOpinions" --> Analyzer
    ServerJS -- "import isRefreshTime,<br/>msUntilNextRefreshSession,<br/>getTradingStatus" --> Calendar
    ServerJS -- "express.static" --> IndexHTML

    IndexHTML -- "fetch /api/*" --> ServerJS

    ETFData -- "fetch()" --> EastMoneyAPI["东方财富 API"]
    OpenCLI -- "exec('opencli ...')" --> CLITool["OpenCLI CLI"]
    Calendar -- "Date计算" --> TimeZone["北京时间转换"]

    style ServerJS fill:#2563eb,stroke:#3b82f6,color:#fff
    style ETFData fill:#059669,stroke:#10b981,color:#fff
    style OpenCLI fill:#d97706,stroke:#f59e0b,color:#fff
    style Analyzer fill:#dc2626,stroke:#ef4444,color:#fff
    style Calendar fill:#7c3aed,stroke:#8b5cf6,color:#fff
    style IndexHTML fill:#0891b2,stroke:#06b6d4,color:#fff
```

---

## 3. ETF 数据加载时序图

```mermaid
sequenceDiagram
    participant B as 浏览器
    participant S as server.js
    participant C as 内存缓存
    participant E as etf-data.js
    participant API as 东方财富 API

    Note over B,API: 页面初始化加载

    B->>S: GET /api/etf-ranking
    S->>C: 检查缓存
    alt 缓存命中
        C-->>S: 返回缓存数据
        S-->>B: { success, data, cached: true }
    else 缓存未命中（首次请求）
        S->>E: fetchETFRanking()
        par 并发请求
            E->>API: 获取涨幅前30 (order=desc)
            E->>API: 获取跌幅前30 (order=asc)
        end
        API-->>E: 涨幅 ETF 列表
        API-->>E: 跌幅 ETF 列表
        E->>E: 过滤异常 + 各取前5
        E-->>S: { gainers, losers, fetchTime }
        S->>C: 更新缓存
        S-->>B: { success, data, cached: false }
    end

    B->>B: renderETFTable(gainers)<br/>renderETFTable(losers)
```

---

## 4. 舆情分析完整时序图

```mermaid
sequenceDiagram
    participant B as 浏览器
    participant S as server.js
    participant Op as opencli-opinions.js
    participant CLI as OpenCLI CLI
    participant An as opinion-analyzer.js
    participant Sina as 新浪财经
    participant XQ as 雪球
    participant ZH as 知乎
    participant WB as 微博

    B->>S: GET /api/opinions-all
    S->>S: 获取缓存 ETF 列表<br/>(gainers + losers)

    loop 每批 3 只 ETF (batchSize=3)
        par 并发获取 3 只 ETF 舆情
            S->>Op: fetchOpinions(code, name)
            S->>Op: fetchOpinions(code, name)
            S->>Op: fetchOpinions(code, name)
        end

        par 每只 ETF 并发 4 平台
            Op->>CLI: opencli sinafinance news
            CLI-->>Sina: 请求
            Sina-->>CLI: 新闻数据
            CLI-->>Op: JSON 结果

            Op->>CLI: opencli xueqiu comments
            CLI-->>XQ: 请求
            XQ-->>CLI: 讨论数据
            CLI-->>Op: JSON 结果

            Op->>CLI: opencli zhihu search
            CLI-->>ZH: 请求
            ZH-->>CLI: 搜索结果
            CLI-->>Op: JSON 结果

            Op->>CLI: opencli weibo search
            CLI-->>WB: 请求
            WB-->>CLI: 搜索结果
            CLI-->>Op: JSON 结果
        end

        Op-->>S: 汇总舆情数据
        S->>An: analyzeOpinions(opinions, etf)
        An->>An: 逐条情绪分析 (关键词匹配)
        An->>An: 计算情绪分布
        An->>An: 提取关键话题
        An->>An: 生成摘要
        An-->>S: 分析报告
    end

    S-->>B: { success, data: { [code]: { opinions, analysis } } }
    B->>B: renderAnalysis()
```

---

## 5. 服务端定时刷新调度状态机

```mermaid
stateDiagram-v2
    [*] --> 判断时段: 服务启动 / scheduleNextRefresh()

    判断时段 --> 交易时段刷新: isRefreshTime() == true
    判断时段 --> 等待下一时段: isRefreshTime() == false

    state 交易时段刷新 {
        [*] --> 立即拉取数据
        立即拉取数据 --> 等待3分钟: refreshETFData()
        等待3分钟 --> 检查时段: setTimeout(3min)
        检查时段 --> 立即拉取数据: isRefreshTime() == true
        检查时段 --> [*]: isRefreshTime() == false
    }

    交易时段刷新 --> 等待下一时段: 时段结束

    state 等待下一时段 {
        [*] --> 计算等待时间: msUntilNextRefreshSession()
        计算等待时间 --> 分段等待: waitMs > 30min 时分段
        计算等待时间 --> 直接等待: waitMs <= 30min
        分段等待 --> [*]: setTimeout(30min)
        直接等待 --> [*]: setTimeout(waitMs)
    }

    等待下一时段 --> 判断时段: 等待结束
```

---

## 6. 前端自动刷新调度状态机

```mermaid
stateDiagram-v2
    [*] --> 初始化: init()

    初始化 --> 加载ETF数据: loadETFRanking()
    加载ETF数据 --> 启动自动刷新: startAutoRefresh()

    启动自动刷新 --> 查询交易状态: fetchTradingStatus()

    查询交易状态 --> 交易时段模式: isRefreshTime == true
    查询交易状态 --> 空闲轮询模式: isRefreshTime == false

    state 交易时段模式 {
        [*] --> 启动倒计时
        启动倒计时 --> 等待3分钟: setInterval(3min)
        等待3分钟 --> 静默刷新数据: loadETFRanking(silent)
        静默刷新数据 --> 再次检查状态: fetchTradingStatus()
        再次检查状态 --> 等待3分钟: isRefreshTime == true
        再次检查状态 --> [*]: isRefreshTime == false
    }

    state 空闲轮询模式 {
        [*] --> 显示非交易时段
        显示非交易时段 --> 每分钟检测: setInterval(1min)
        每分钟检测 --> 检查是否进入交易: fetchTradingStatus()
        检查是否进入交易 --> 每分钟检测: isRefreshTime == false
        检查是否进入交易 --> [*]: isRefreshTime == true
    }

    交易时段模式 --> 空闲轮询模式: 时段结束
    空闲轮询模式 --> 交易时段模式: 进入交易时段

    note right of 交易时段模式: 3分钟刷新间隔<br/>显示倒计时
    note right of 空闲轮询模式: 1分钟检测间隔<br/>显示"非交易时段"
```

---

## 7. A 股交易时段时间线

```mermaid
gantt
    title A 股交易日时段分布 (北京时间)
    dateFormat HH:mm
    axisFormat %H:%M

    section 刷新时段
    上午刷新 (含集合竞价)    :active, r1, 09:15, 11:30
    下午刷新 (含盘后缓冲)    :active, r2, 12:55, 15:05

    section 正式交易
    上午盘                    :crit, t1, 09:30, 11:30
    下午盘                    :crit, t2, 13:00, 15:00

    section 非交易
    盘前                      :done, n1, 00:00, 09:15
    午间休市                  :done, n2, 11:30, 12:55
    盘后                      :done, n3, 15:05, 23:59
```

---

## 8. 情绪分析处理流程

```mermaid
flowchart TD
    Start["输入: 原始舆情列表<br/>opinions.all"] --> Loop["遍历每条观点"]

    Loop --> Match{"关键词匹配"}
    Match --> Bullish["匹配看多词<br/>(34个关键词)<br/>bullishScore++"]
    Match --> Bearish["匹配看空词<br/>(34个关键词)<br/>bearishScore++"]
    Match --> Neutral["匹配中性词<br/>(13个关键词)<br/>neutralScore++"]

    Bullish --> Score["计算得分"]
    Bearish --> Score
    Neutral --> Score

    Score --> Judge{"判断情绪倾向"}
    Judge -- "bullish > bearish & neutral" --> TagBull["标记: bullish"]
    Judge -- "bearish > bullish & neutral" --> TagBear["标记: bearish"]
    Judge -- "其他" --> TagNeut["标记: neutral"]

    TagBull --> Collect["汇总全部标注结果"]
    TagBear --> Collect
    TagNeut --> Collect

    Collect --> Dist["统计情绪分布<br/>bullish / bearish / neutral"]
    Collect --> Topics["提取热门话题 TOP 8<br/>extractKeyTopics()"]
    Collect --> Source["按来源统计<br/>countBySource()"]
    Collect --> Rep["选取代表性观点<br/>每来源热度最高1条"]

    Dist --> Summary["生成自然语言摘要<br/>generateSummary()"]
    Topics --> Report["输出: 分析报告"]
    Source --> Report
    Rep --> Report
    Summary --> Report

    Report --> End["{ summary, overallSentiment,<br/>sentimentDistribution,<br/>keyTopics, sourceCounts,<br/>representativeOpinions }"]

    style Start fill:#3b82f6,stroke:#2563eb,color:#fff
    style End fill:#10b981,stroke:#059669,color:#fff
    style Judge fill:#f59e0b,stroke:#d97706,color:#fff
```

---

## 9. API 路由请求流程图

```mermaid
flowchart LR
    subgraph Client["客户端请求"]
        R1["GET /api/trading-status"]
        R2["GET /api/etf-ranking"]
        R3["GET /api/opinions/:symbol"]
        R4["GET /api/opinions-all"]
    end

    subgraph Handler["路由处理"]
        R1 --> H1["getTradingStatus()<br/>+ isRefreshTime()"]
        R2 --> H2{"cache.etfData<br/>存在?"}
        R3 --> H3["fetchOpinions(symbol, name)"]
        R4 --> H4["批量获取 + 分析<br/>batchSize = 3"]
    end

    H2 -- "是" --> C1["返回缓存数据<br/>cached: true"]
    H2 -- "否" --> F1["fetchETFRanking()"] --> U1["更新缓存"] --> C2["返回新数据<br/>cached: false"]

    H3 --> P1["并发 4 平台"]
    P1 --> Sina["新浪财经"]
    P1 --> XQ["雪球"]
    P1 --> ZH["知乎"]
    P1 --> WB["微博"]

    H4 --> LOOP["循环每批 ETF"]
    LOOP --> P1
    LOOP --> AN["analyzeOpinions()"]

    subgraph Response["响应格式"]
        C1 --> JSON1["{ success, data, cached, trading }"]
        C2 --> JSON1
        H1 --> JSON2["{ label, isTradingDay,<br/>isTradingTime, autoRefresh }"]
        P1 --> JSON3["{ success, data: opinions }"]
        AN --> JSON4["{ success, data: { [code]: analysis } }"]
    end

    style Client fill:#1a2332,stroke:#3b82f6,color:#e5e7eb
    style Handler fill:#1a2332,stroke:#10b981,color:#e5e7eb
    style Response fill:#1a2332,stroke:#f59e0b,color:#e5e7eb
```

---

## 10. 前端页面组件结构

```mermaid
graph TD
    Page["index.html 页面"]

    Page --> Header["Header 区域"]
    Page --> Main["Main 主内容区"]

    Header --> Title["标题: ETF 涨跌幅排名"]
    Header --> Badge["标签: A股场内"]
    Header --> Meta["元信息栏"]
    Meta --> TradingLabel["#trading-label<br/>交易状态标签"]
    Meta --> MarketStatus["#market-status<br/>连接状态指示灯"]
    Meta --> UpdateTime["#update-time<br/>最后更新时间"]
    Meta --> Countdown["#countdown<br/>刷新倒计时"]
    Meta --> RefreshBtn["刷新数据按钮"]

    Main --> Rankings["排名区域<br/>.rankings-grid"]
    Main --> Analysis["舆情分析区<br/>.analysis-section"]

    Rankings --> Gainers["涨幅前五面板<br/>#gainers-body"]
    Rankings --> Losers["跌幅前五面板<br/>#losers-body"]

    Gainers --> GTable["ETF 表格<br/>代码|名称|最新价|涨跌幅|成交额"]
    Losers --> LTable["ETF 表格<br/>代码|名称|最新价|涨跌幅|成交额"]

    Analysis --> SectionHeader["区域标题 + 获取舆情按钮"]
    Analysis --> ProgressBar["#opinions-status<br/>进度条 (获取中)"]
    Analysis --> Container["#analysis-container<br/>分析卡片网格"]

    Container --> Card["分析卡片 .analysis-card"]
    Card --> CardHead["卡片头: ETF名称 + 涨跌幅"]
    Card --> SentimentBar["情绪分布条<br/>看多|中性|看空"]
    Card --> SummaryText["分析摘要文字"]
    Card --> KeyTopics["关键话题标签"]
    Card --> SourceStatus["数据源状态标识"]
    Card --> OpinionList["代表性观点列表"]

    style Page fill:#0a0e17,stroke:#3b82f6,color:#e5e7eb
    style Header fill:#111827,stroke:#2a3548,color:#e5e7eb
    style Main fill:#0a0e17,stroke:#2a3548,color:#e5e7eb
    style Card fill:#1a2332,stroke:#2a3548,color:#e5e7eb
```
