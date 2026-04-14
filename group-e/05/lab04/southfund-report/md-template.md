# {{PROJECT_NAME}}技术方案报告

<style>
/* 南方基金主题样式 */
:root {
  --primary-blue: #004098;
  --dark-blue: #00295F;
  --light-blue: #1A6FD5;
  --bg-blue: #E8EFF8;
  --border-blue: #99B8D9;
  --accent-red: #E72521;
  --accent-gold: #C9A96E;
}
body { background-color: var(--bg-blue); }
h1, h2, h3, h4, h5, h6 { color: var(--primary-blue); border-color: var(--light-blue); }
a { color: var(--light-blue); }
strong { color: var(--dark-blue); }
table { border-color: var(--border-blue); }
th { background-color: var(--primary-blue); color: white; }
code, pre { background-color: #0D1B2A; border-color: var(--light-blue); }
blockquote { border-left-color: var(--accent-red); background-color: var(--bg-blue); }
hr { background: linear-gradient(to right, transparent, var(--primary-blue), transparent); }
</style>

---

## 文档封面

<div align="center" style="background: linear-gradient(135deg, #00295F 0%, #004098 60%, #1A6FD5 100%); color: white; padding: 60px 40px; border-radius: 12px; margin: 20px 0;">

# {{PROJECT_NAME}}
## 技术方案报告
### {{PROJECT_NAME_EN}}

---

| 项目名称 | {{PROJECT_NAME}} |
|:------:|:-------------------:|
| 文档编号 | {{DOC_ID}} |
| 版　　本 | {{VERSION}} |
| 密　　级 | {{CLASSIFICATION}} |
| 编制单位 | {{DEPARTMENT}} |
| 编制日期 | {{DATE}} |

</div>

> ⚠️ **免责声明**：{{DISCLAIMER_TEXT}}

---

## 版本记录

| 版本号 | 修订日期 | 修订人 | 修订内容说明 |
|-------|---------|-------|-------------|
| {{VERSION}} | {{DATE}} | {{DEPARTMENT}} | 初版发布，完成整体技术方案设计 |
| - | - | - | - |

---

## 审批记录

| 角色 | 姓名 | 签字 | 日期 |
|-----|------|-----|------|
| 编写 | ________ | | ________ |
| 审核 | ________ | | ________ |
| 批准 | ________ | | ________ |

---

## 文档分发

| 序号 | 接收部门 | 接收人 | 份数 |
|-----|---------|-------|------|
| 1 | {{DEPT_1}} | ________ | 1 |
| 2 | {{DEPT_2}} | ________ | 1 |
| 3 | {{DEPT_3}} | ________ | 1 |
| 4 | {{DEPT_4}} | ________ | 1 |

---

## 目录

<div style="background: linear-gradient(to right, #E8EFF8, #99B8D9, #E8EFF8); padding: 20px; border-radius: 8px; border-left: 4px solid #004098;">

1. [{{CHAPTER_1_TITLE}}](#1-{{CHAPTER_1_ANCHOR}})
2. [{{CHAPTER_2_TITLE}}](#2-{{CHAPTER_2_ANCHOR}})
3. [{{CHAPTER_3_TITLE}}](#3-{{CHAPTER_3_ANCHOR}})
4. [{{CHAPTER_4_TITLE}}](#4-{{CHAPTER_4_ANCHOR}})
5. [{{CHAPTER_5_TITLE}}](#5-{{CHAPTER_5_ANCHOR}})
6. [{{CHAPTER_6_TITLE}}](#6-{{CHAPTER_6_ANCHOR}})
7. [{{CHAPTER_7_TITLE}}](#7-{{CHAPTER_7_ANCHOR}})
8. [{{CHAPTER_8_TITLE}}](#8-{{CHAPTER_8_ANCHOR}})
9. [{{CHAPTER_9_TITLE}}](#9-{{CHAPTER_9_ANCHOR}})
10. [{{CHAPTER_10_TITLE}}](#10-{{CHAPTER_10_ANCHOR}})

</div>

---

## 1. {{CHAPTER_1_TITLE}}

<div style="border-left: 4px solid #004098; padding-left: 15px; background: linear-gradient(to right, #E8EFF8, transparent); margin: 10px 0;">

### 1.1 {{SUB_SECTION}}

{{CONTENT}}

- **{{POINT_1}}**：{{DESCRIPTION_1}}
- **{{POINT_2}}**：{{DESCRIPTION_2}}

### 1.2 需求分析

{{CONTENT}}

| 需求类别 | 具体需求 |
|---------|---------|
| {{CATEGORY}} | {{REQUIREMENT}} |

---

## 2. {{CHAPTER_2_TITLE}}

<div style="border-left: 4px solid #004098; padding-left: 15px; background: linear-gradient(to right, #E8EFF8, transparent); margin: 10px 0;">

### 2.1 总体目标

{{OVERALL_GOAL}}

### 2.2 具体目标

```
{{GOAL_ASCII_BOX}}
```

### 2.3 系统功能树

```
{{FUNCTION_TREE}}
```

---

## 3. {{CHAPTER_3_TITLE}}

<div style="border-left: 4px solid #004098; padding-left: 15px; background: linear-gradient(to right, #E8EFF8, transparent); margin: 10px 0;">

### 3.1 技术选型

#### 3.1.1 后端技术栈

| 技术项 | 选型方案 | 选型理由 |
|-------|---------|---------|
| {{TECH_ITEM}} | {{TECH_CHOICE}} | {{TECH_REASON}} |

#### 3.1.2 前端技术栈

| 技术项 | 选型方案 | 选型理由 |
|-------|---------|---------|
| {{TECH_ITEM}} | {{TECH_CHOICE}} | {{TECH_REASON}} |

### 3.2 系统架构

#### 3.2.1 整体架构图

```
{{ARCHITECTURE_DIAGRAM}}
```

#### 3.2.2 分层架构说明

| 层级 | 组件 | 职责说明 |
|-----|------|---------|
| {{LAYER}} | {{COMPONENT}} | {{RESPONSIBILITY}} |

### 3.3 数据流设计

```
{{DATA_FLOW}}
```

---

## 4. {{CHAPTER_4_TITLE}}

<div style="border-left: 4px solid #004098; padding-left: 15px; background: linear-gradient(to right, #E8EFF8, transparent); margin: 10px 0;">

### 4.1 {{MODULE_1}}

{{MODULE_1_DESC}}

| 功能模块 | 功能描述 |
|---------|---------|
| {{FUNC}} | {{FUNC_DESC}} |

### 4.2 {{MODULE_2}}

```
{{SYSTEM_DIAGRAM}}
```

---

## 5. {{CHAPTER_5_TITLE}}

<div style="border-left: 4px solid #E72521; padding-left: 15px; background: linear-gradient(to right, #FDE8E8, transparent); margin: 10px 0;">

### 5.1 设计原则

- **{{PRINCIPLE_1}}**：{{PRINCIPLE_1_DESC}}
- **{{PRINCIPLE_2}}**：{{PRINCIPLE_2_DESC}}

### 5.2 {{SUB_TITLE}}

| {{COL1}} | {{COL2}} | {{COL3}} |
|----------|--------|---------|
| {{VAL1}} | {{VAL2}} | {{VAL3}} |

### 5.3 流程编排

```
{{FLOW_DIAGRAM}}
```

---

## 6. {{CHAPTER_6_TITLE}}

<div style="border-left: 4px solid #004098; padding-left: 15px; background: linear-gradient(to right, #E8EFF8, transparent); margin: 10px 0;">

### 6.1 安全架构

```
{{SECURITY_DIAGRAM}}
```

### 6.2 安全机制说明

| 安全层级 | 机制 | 说明 |
|---------|------|------|
| {{LEVEL}} | {{MECHANISM}} | {{DESC}} |

---

## 7. {{CHAPTER_7_TITLE}}

<div style="border-left: 4px solid #004098; padding-left: 15px; background: linear-gradient(to right, #E8EFF8, transparent); margin: 10px 0;">

### 7.1 部署架构

| 组件 | 端口 | 说明 |
|------|------|------|
| {{COMP}} | {{PORT}} | {{COMP_DESC}} |

### 7.2 CI/CD 自动化

| 工作流 | 触发条件 | 用途 |
|--------|---------|------|
| {{WORKFLOW}} | {{TRIGGER}} | {{PURPOSE}} |

### 7.3 部署流程

```
{{DEPLOY_FLOW}}
```

---

## 8. {{CHAPTER_8_TITLE}}

<div style="border-left: 4px solid #004098; padding-left: 15px; background: linear-gradient(to right, #E8EFF8, transparent); margin: 10px 0;">

### 8.1 技术风险

| 风险项 | 风险等级 | 应对措施 |
|-------|---------|---------|
| {{RISK}} | {{RISK_LEVEL}} | {{MITIGATION}} |

### 8.2 合规风险

| 风险项 | 风险等级 | 应对措施 |
|-------|---------|---------|
| {{RISK}} | {{RISK_LEVEL}} | {{MITIGATION}} |

### 8.3 运维风险

| 风险项 | 风险等级 | 应对措施 |
|-------|---------|---------|
| {{RISK}} | {{RISK_LEVEL}} | {{MITIGATION}} |

---

## 9. {{CHAPTER_9_TITLE}}

<div style="border-left: 4px solid #004098; padding-left: 15px; background: linear-gradient(to right, #E8EFF8, transparent); margin: 10px 0;">

### 9.1 实施路线

```
{{ROADMAP}}
```

### 9.2 关键里程碑

| 里程碑 | 目标 | 验收标准 |
|-------|------|---------|
| {{MILESTONE}} | {{MS_GOAL}} | {{MS_CRITERIA}} |

---

## 10. {{CHAPTER_10_TITLE}}

<div style="border-left: 4px solid #004098; padding-left: 15px; background: linear-gradient(to right, #E8EFF8, transparent); margin: 10px 0;">

### 10.1 方案总结

{{SUMMARY}}

1. **{{HIGHLIGHT_1}}**：{{HIGHLIGHT_1_DESC}}
2. **{{HIGHLIGHT_2}}**：{{HIGHLIGHT_2_DESC}}

### 10.2 后续展望

- **{{OUTLOOK_1}}**：{{OUTLOOK_1_DESC}}
- **{{OUTLOOK_2}}**：{{OUTLOOK_2_DESC}}

---

> ⚠️ **再次声明**：{{FINAL_DISCLAIMER}}

---

**文档结束**
