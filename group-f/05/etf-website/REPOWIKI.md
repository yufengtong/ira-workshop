# RepoWiki: ETF 涨跌幅排名网站

## 1. 项目概述

**项目名称**: etf-ranking-website
**版本**: 1.0.0
**描述**: 国内 A 股场内 ETF 涨跌幅排名网站，集成基于 OpenCLI 的多平台舆情分析功能。

该项目是一个全栈 Web 应用，实时展示 A 股场内 ETF 的涨跌幅排名（涨幅前 5 / 跌幅前 5），并通过 OpenCLI 命令行工具从新浪财经、雪球、知乎、微博等平台采集舆情数据，进行情绪分析后呈现给用户。

---

## 2. 技术栈

| 层级 | 技术 |
|------|------|
| 运行时 | Node.js (ESM) |
| 后端框架 | Express 4.x |
| 前端 | 原生 HTML / CSS / JavaScript (SPA) |
| 数据源 | 东方财富公开 API、OpenCLI CLI 工具 |
| 包管理 | npm |

---

## 3. 目录结构

```
etf-website/
├── server.js                       # Express 服务入口，API 路由 & 定时刷新调度
├── package.json                    # 项目配置与依赖
├── package-lock.json               # 依赖锁定文件
├── public/
│   └── index.html                  # 前端单页面（HTML + CSS + JS 内联）
├── services/
│   ├── etf-data.js                 # ETF 行情数据获取服务（东方财富 API）
│   ├── opencli-opinions.js         # 多平台舆情获取服务（OpenCLI）
│   ├── opinion-analyzer.js         # 舆情情绪分析引擎
│   └── trading-calendar.js         # A 股交易日历工具
└── node_modules/                   # 依赖包（express 及其子依赖）
```

---

## 4. 核心模块详解

### 4.1 `server.js` — 服务入口

**职责**: Express HTTP 服务器、API 路由定义、服务端缓存与定时刷新调度。

**关键设计**:
- **内存缓存**: 使用 `cache` 对象缓存 ETF 数据（`etfData` + `lastUpdated`），避免每次请求都调用外部 API。
- **智能定时刷新**: 仅在交易时段（含集合竞价）内每 3 分钟自动拉取数据；非交易时段暂停刷新并等待下一个时段。调度逻辑通过 `scheduleNextRefresh()` → `waitForNextSession()` 实现分段等待，规避 `setTimeout` 长时间精度问题。

**API 路由**:

| 路由 | 方法 | 描述 |
|------|------|------|
| `/api/trading-status` | GET | 返回当前交易状态（是否交易日、是否交易时段、北京时间等） |
| `/api/etf-ranking` | GET | 返回 ETF 涨跌幅排名数据（优先返回缓存，首次请求主动拉取） |
| `/api/opinions/:symbol` | GET | 获取指定 ETF 的多平台舆情数据（query 参数 `name` 传递名称） |
| `/api/opinions-all` | GET | 批量获取所有上榜 ETF 的舆情并进行情绪分析（并发度 3） |

**静态文件**: `public/` 目录通过 `express.static` 提供服务。

---

### 4.2 `services/etf-data.js` — ETF 行情数据服务

**职责**: 从东方财富公开 API 获取 A 股场内 ETF 实时行情排名。

**数据源**: `https://push2.eastmoney.com/api/qt/clist/get`

**核心函数**:

| 函数 | 描述 |
|------|------|
| `fetchETFList(order, limit)` | 按涨跌幅排序获取 ETF 列表，返回标准化的 ETF 对象数组 |
| `fetchETFRanking()` | **导出** — 并发获取涨幅前 30 和跌幅前 30，过滤异常数据后各取前 5 |

**ETF 数据字段**:
```
code, name, price, changePercent, changeAmount, volume, turnover,
amplitude, turnoverRate, pe, volumeRatio, high, low, open, prevClose
```

**注意事项**:
- 东方财富 API 可能返回 JSONP 格式，代码通过正则去除包裹函数后解析 JSON。
- 请求头伪装浏览器 User-Agent 并设置 Referer 为东方财富行情页。

---

### 4.3 `services/opencli-opinions.js` — 舆情获取服务

**职责**: 通过调用本地 `opencli` CLI 工具，从多个平台获取 ETF 相关的舆情讨论。

**数据源优先级**:

| 平台 | 类型 | 需要浏览器扩展 | 说明 |
|------|------|:-:|------|
| 新浪财经快讯 | public | 否 | 实时财经新闻，作为保底数据源 |
| 雪球 | cookie | 是 | 个股讨论动态 |
| 知乎 | cookie | 是 | 深度投资观点 |
| 微博 | cookie | 是 | 热点舆情 |

**核心函数**:

| 函数 | 描述 |
|------|------|
| `runOpenCLI(args, timeout)` | 执行 opencli 命令并返回 JSON 结果（兼容 Windows `.cmd`） |
| `fetchSinaFinanceNews(name, limit)` | 从新浪财经 7x24 快讯获取与 ETF 相关的新闻 |
| `fetchSinaFinanceStock(code)` | 获取 ETF 关联板块的实时股价信息 |
| `fetchXueqiuComments(symbol, limit)` | 从雪球获取 ETF 讨论动态 |
| `fetchZhihuOpinions(name, limit)` | 从知乎搜索 ETF 相关讨论 |
| `fetchWeiboOpinions(name, limit)` | 从微博搜索 ETF 相关讨论 |
| `fetchOpinions(symbol, name)` | **导出** — 并发获取所有平台数据，返回汇总结果 |

**辅助功能**:
- `extractKeywords(name)`: 从 ETF 名称提取核心搜索关键词。内置 18 个行业映射表（如"芯片" → ["芯片","半导体","集成电路"]），自动去除基金公司后缀。
- `formatXueqiuSymbol(code)` / `formatSinaSymbol(code)`: 将通用 ETF 代码转换为各平台特定格式。
- **新浪新闻缓存**: `getCachedSinaNews()` 维护 3 分钟 TTL 的内存缓存，避免为每只 ETF 重复请求新浪快讯接口。

---

### 4.4 `services/opinion-analyzer.js` — 情绪分析引擎

**职责**: 对采集到的舆情数据进行基于关键词的情绪分析，生成结构化分析报告。

**分析方法**: 关键词匹配法

| 情绪类型 | 关键词示例 | 词数 |
|----------|-----------|------|
| 看多 (bullish) | 看好、买入、抄底、利好、反弹、金叉、定投、布局... | 34 |
| 看空 (bearish) | 看空、卖出、清仓、利空、破位、崩盘、死叉、止损... | 34 |
| 中性 (neutral) | 震荡、横盘、分化、博弈、观望、波动、调整... | 13 |

**核心函数**:

| 函数 | 描述 |
|------|------|
| `analyzeSentiment(text)` | 分析单条文本的情绪倾向，返回 `{sentiment, score}` |
| `extractKeyTopics(opinions)` | 提取观点中出现频率最高的前 8 个关键话题 |
| `countBySource(opinions)` | 按来源平台统计观点数 |
| `generateSummary(sentimentDist, etf, opinions)` | 生成自然语言综合分析摘要 |
| `analyzeOpinions(opinions, etf)` | **导出** — 综合分析入口，返回完整分析报告 |

**分析报告结构**:
```javascript
{
  summary,                  // 自然语言摘要
  overallSentiment,         // 整体情绪: bullish/bearish/neutral
  sentimentDistribution,    // 各情绪数量分布
  keyTopics,                // 热门话题关键词
  sourceCounts,             // 各来源观点数
  representativeOpinions,   // 代表性观点（每个来源取热度最高 1 条）
  analyzedOpinions,         // 全部带情绪标注的观点
  totalCount                // 总观点数
}
```

---

### 4.5 `services/trading-calendar.js` — 交易日历工具

**职责**: 判断当前北京时间是否为交易日/交易时段，为定时刷新提供调度依据。

**时段定义**:

| 时段类型 | 时间范围 | 用途 |
|----------|----------|------|
| 正式交易 | 9:30-11:30, 13:00-15:00 | 交易状态展示 |
| 刷新时段 | 9:15-11:30, 12:55-15:05 | 含集合竞价和收盘缓冲，驱动自动刷新 |

**导出函数**:

| 函数 | 描述 |
|------|------|
| `isTradingDay()` | 当前是否为工作日（周一至周五） |
| `isTradingTime()` | 当前是否在正式交易时段内 |
| `isRefreshTime()` | 当前是否在刷新时段内（含竞价、盘后缓冲） |
| `msUntilNextRefreshSession()` | 距下一个刷新时段开始的毫秒数 |
| `getTradingStatus()` | 返回完整交易状态摘要对象（供 API 使用） |

**注意**: 仅基于工作日判断（周一~周五），未接入节假日 API，法定节假日不会自动识别。

---

### 4.6 `public/index.html` — 前端页面

**职责**: 单页面应用，提供数据展示和用户交互。

**页面布局**:
1. **Header**: 标题、交易状态标签、连接状态指示灯、更新时间、倒计时、手动刷新按钮
2. **排名区域**: 左右两栏 Grid，分别展示涨幅前 5 / 跌幅前 5 的 ETF 表格
3. **舆情分析区**: 按 ETF 展示分析卡片，包含情绪分布条、摘要文字、关键话题标签、数据源状态、代表性观点列表

**前端特性**:
- **深色主题**: 采用 CSS 变量定义的深色配色方案（暗蓝底色 + 对比色）
- **自动刷新**: 交易时段内每 3 分钟自动刷新 ETF 数据，非交易时段切换为 1 分钟轮询检测
- **倒计时显示**: 在自动刷新期间展示下次刷新倒计时
- **响应式**: 768px 断点适配移动端（单栏布局）
- **交互**: 点击 ETF 行高亮选中；手动刷新；一键获取全部舆情

**颜色约定**（遵循 A 股惯例）:
- 红色 (`--red`): 上涨 / 看多
- 绿色 (`--green`): 下跌 / 看空
- 黄色 (`--yellow`): 中性 / 竞价状态

---

## 5. 数据流

```
┌─────────────────────────────────────────────────────────┐
│                    浏览器（前端）                          │
│  index.html                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ ETF排名表格  │  │ 舆情分析卡片  │  │ 交易状态/倒计时 │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘  │
│         │                │                   │           │
└─────────┼────────────────┼───────────────────┼───────────┘
          │ /api/etf-ranking│ /api/opinions-all │ /api/trading-status
          ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                   Express Server                        │
│  server.js                                              │
│  ┌──────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │ 内存缓存  │  │ 定时刷新调度器  │  │    API 路由     │  │
│  └──────────┘  └────────────────┘  └─────────────────┘  │
│         │                                    │           │
└─────────┼────────────────────────────────────┼───────────┘
          │                                    │
          ▼                                    ▼
┌──────────────────┐               ┌───────────────────────┐
│  etf-data.js     │               │  opencli-opinions.js  │
│  东方财富 API     │               │  OpenCLI CLI 调用      │
│                  │               │  ┌──────┐ ┌────┐      │
│  push2.eastmoney │               │  │新浪   │ │雪球│      │
│  .com/api/qt/    │               │  │财经   │ │    │      │
│  clist/get       │               │  └──────┘ └────┘      │
│                  │               │  ┌──────┐ ┌────┐      │
│                  │               │  │知乎   │ │微博│      │
│                  │               │  └──────┘ └────┘      │
└──────────────────┘               └───────────┬───────────┘
                                               │
                                               ▼
                                   ┌───────────────────────┐
                                   │ opinion-analyzer.js   │
                                   │ 关键词情绪分析引擎     │
                                   └───────────────────────┘
```

---

## 6. 启动与运行

### 前置条件
- Node.js 运行时
- （可选）`opencli` CLI 工具（用于舆情功能）

### 安装依赖
```bash
npm install
```

### 启动服务
```bash
# 生产模式
npm start

# 开发模式（文件变更自动重启）
npm run dev
```

服务启动后访问: `http://localhost:3000`

---

## 7. 配置与常量

| 常量 | 位置 | 值 | 描述 |
|------|------|-----|------|
| `PORT` | server.js | 3000 | HTTP 监听端口 |
| `REFRESH_INTERVAL` | server.js | 3 分钟 | 交易时段自动刷新间隔 |
| `DEFAULT_TIMEOUT` | opencli-opinions.js | 30 秒 | OpenCLI 命令超时时间 |
| `SINA_CACHE_TTL` | opencli-opinions.js | 3 分钟 | 新浪财经新闻缓存有效期 |
| `maxBuffer` | opencli-opinions.js | 5MB | OpenCLI 输出最大缓冲 |

---

## 8. 依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| express | ^4.21.0 | HTTP 服务器框架 |

项目依赖极简，仅使用 Express 作为唯一生产依赖。ETF 数据获取使用 Node.js 内置 `fetch`，舆情获取使用内置 `child_process.exec`。

---

## 9. 已知限制

1. **交易日历**: 仅按周一~周五判断工作日，未对接节假日 API，法定节假日（春节、国庆等）会误判为交易日。
2. **舆情数据源**: 雪球、知乎、微博数据源依赖 OpenCLI 浏览器扩展提供的 Cookie，未安装扩展时这些数据源不可用，仅新浪财经（public API）可用。
3. **情绪分析精度**: 使用简单关键词匹配法，无法理解反讽、否定句式（如"不看好"不会被识别为看空），分析结果供参考。
4. **缓存策略**: 使用进程内存缓存，服务重启后缓存清空。
5. **并发控制**: 批量获取舆情时并发度为 3（`batchSize = 3`），在网络条件差时可能较慢。
