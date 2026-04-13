# Skills 管理平台开发计划

## 技术栈
- **框架**: Next.js 14 (App Router)
- **包管理**: pnpm
- **数据库**: SQLite (better-sqlite3)
- **样式**: Tailwind CSS
- **UI 组件**: Ant Design
- **ORM**: Prisma (可选，也可直接用 SQL)

## 项目结构

```
d:\projects\ai-coding\demo\01/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── skills/        # 技能相关 API
│   │   └── git/           # Git 导入 API
│   ├── page.tsx           # 首页/技能列表
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # 组件目录
│   ├── SkillList.tsx      # 技能列表组件
│   ├── SkillForm.tsx      # 技能表单组件
│   ├── GitImportForm.tsx  # Git 导入表单
│   └── SkillDetail.tsx    # 技能详情组件
├── lib/                   # 工具库
│   ├── db.ts              # 数据库连接
│   ├── git.ts             # Git 操作工具
│   └── utils.ts           # 通用工具
├── prisma/                # Prisma 配置 (如使用)
│   └── schema.prisma      # 数据模型定义
├── public/                # 静态资源
├── package.json           # 依赖配置
├── tailwind.config.ts     # Tailwind 配置
└── next.config.js         # Next.js 配置
```

## 数据库设计

### Skill 表
```sql
CREATE TABLE Skill (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,        -- 技能代码/内容
  author TEXT,                  -- 作者
  version TEXT DEFAULT '1.0.0', -- 版本号
  tags TEXT,                    -- 标签 (JSON 数组)
  category TEXT,                -- 分类
  usageCount INTEGER DEFAULT 0, -- 使用次数
  sourceType TEXT,              -- 来源: manual | git
  gitUrl TEXT,                  -- Git 仓库地址
  gitPath TEXT,                 -- 文件路径
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 功能模块

### Task 1: 项目初始化
- 使用 `create-next-app` 初始化项目
- 配置 pnpm 作为包管理器
- 安装依赖: Ant Design, Tailwind CSS, better-sqlite3, simple-git
- 配置 Tailwind CSS 和 Ant Design

### Task 2: 数据库层
- 创建 SQLite 数据库连接
- 创建 Skill 表
- 实现基础 CRUD 操作函数

### Task 3: API 层
- `/api/skills` - GET(列表), POST(创建)
- `/api/skills/[id]` - GET(详情), PUT(更新), DELETE(删除)
- `/api/skills/search` - GET(搜索)
- `/api/git/import` - POST(从 Git 导入技能)
- `/api/git/parse` - POST(解析 Git 仓库结构)

### Task 4: 前端页面
- 技能列表页 (首页) - 表格展示 + 搜索 + 分页
- 技能详情页 - 展示详情 + 编辑/删除按钮
- 添加技能弹窗/页面 - 表单提交
- Git 导入弹窗 - 输入 Git 地址 + 选择文件

### Task 5: Git 导入功能
- 使用 simple-git 克隆仓库
- 解析仓库中的技能文件
- 支持选择特定文件或目录导入
- 自动提取文件内容创建技能

### Task 6: 样式优化
- 使用 Tailwind CSS 定制样式
- 整合 Ant Design 组件
- 响应式布局适配

## 开发顺序

1. 项目初始化 (Task 1)
2. 数据库层 (Task 2)
3. API 层 - 基础 CRUD (Task 3)
4. 前端页面 - 基础功能 (Task 4)
5. Git 导入功能 (Task 5)
6. 样式优化 (Task 6)

## 依赖列表

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "antd": "^5",
    "@ant-design/nextjs-registry": "^1",
    "better-sqlite3": "^9",
    "simple-git": "^3",
    "tailwindcss": "^3"
  }
}
```

## 注意事项

1. Git 导入需要处理仓库克隆和临时文件清理
2. 数据库使用 SQLite 文件存储，无需额外服务
3. 技能内容字段支持大文本存储
4. 标签使用 JSON 字符串存储，便于扩展