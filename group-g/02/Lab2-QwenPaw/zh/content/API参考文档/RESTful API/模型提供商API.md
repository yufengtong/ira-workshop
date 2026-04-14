# 模型提供商API

<cite>
**本文档引用的文件**
- [src/qwenpaw/app/routers/providers.py](file://src/qwenpaw/app/routers/providers.py)
- [src/qwenpaw/providers/provider.py](file://src/qwenpaw/providers/provider.py)
- [src/qwenpaw/providers/provider_manager.py](file://src/qwenpaw/providers/provider_manager.py)
- [src/qwenpaw/providers/models.py](file://src/qwenpaw/providers/models.py)
- [src/qwenpaw/providers/openai_provider.py](file://src/qwenpaw/providers/openai_provider.py)
- [src/qwenpaw/providers/anthropic_provider.py](file://src/qwenpaw/providers/anthropic_provider.py)
- [src/qwenpaw/providers/gemini_provider.py](file://src/qwenpaw/providers/gemini_provider.py)
- [src/qwenpaw/providers/ollama_provider.py](file://src/qwenpaw/providers/ollama_provider.py)
- [src/qwenpaw/providers/multimodal_prober.py](file://src/qwenpaw/providers/multimodal_prober.py)
- [src/qwenpaw/providers/capability_baseline.py](file://src/qwenpaw/providers/capability_baseline.py)
- [src/qwenpaw/providers/retry_chat_model.py](file://src/qwenpaw/providers/retry_chat_model.py)
- [src/qwenpaw/providers/rate_limiter.py](file://src/qwenpaw/providers/rate_limiter.py)
- [src/qwenpaw/cli/providers_cmd.py](file://src/qwenpaw/cli/providers_cmd.py)
- [console/src/api/modules/provider.ts](file://console/src/api/modules/provider.ts)
</cite>

## 目录
1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构总览](#架构总览)
5. [详细组件分析](#详细组件分析)
6. [依赖关系分析](#依赖关系分析)
7. [性能考虑](#性能考虑)
8. [故障排除指南](#故障排除指南)
9. [结论](#结论)
10. [附录](#附录)

## 简介
本文件为 QwenPaw 模型提供商管理API的完整RESTful API文档，覆盖以下主题：
- 提供商注册与配置（OpenAI、Anthropic、Gemini、Ollama等）
- 连接测试与可用性检测
- 能力探测（图像/视频多模态支持）
- 模型列表获取与动态发现
- 活动模型槽位管理（全局/代理特定）
- 错误诊断与连接优化
- 配置验证与最佳实践

该API通过FastAPI路由暴露，配合ProviderManager统一管理内置与自定义提供商，并提供细粒度的重试与限流机制以提升稳定性。

## 项目结构
后端采用分层设计：
- 路由层：FastAPI路由定义与请求响应模型
- 管理层：ProviderManager负责提供商生命周期、持久化与活动模型槽位
- 提供商实现层：针对不同平台的Provider子类（OpenAI、Anthropic、Gemini、Ollama）
- 工具层：能力基线、多模态探测器、重试与限流

```mermaid
graph TB
subgraph "路由层"
Routers["/models 路由<br/>providers.py"]
Types["请求/响应模型<br/>provider.ts"]
end
subgraph "管理层"
PM["ProviderManager<br/>provider_manager.py"]
Models["数据模型<br/>models.py"]
end
subgraph "提供商实现"
OP["OpenAIProvider<br/>openai_provider.py"]
AP["AnthropicProvider<br/>anthropic_provider.py"]
GP["GeminiProvider<br/>gemini_provider.py"]
OP2["OllamaProvider<br/>ollama_provider.py"]
end
subgraph "工具层"
Probe["多模态探测器<br/>multimodal_prober.py"]
Baseline["能力基线<br/>capability_baseline.py"]
Retry["重试包装<br/>retry_chat_model.py"]
Limiter["限流器<br/>rate_limiter.py"]
end
Routers --> PM
PM --> OP
PM --> AP
PM --> GP
PM --> OP2
PM --> Probe
PM --> Baseline
PM --> Retry
PM --> Limiter
Types --> Routers
```

**图表来源**
- [src/qwenpaw/app/routers/providers.py:1-634](file://src/qwenpaw/app/routers/providers.py#L1-L634)
- [src/qwenpaw/providers/provider_manager.py:670-1599](file://src/qwenpaw/providers/provider_manager.py#L670-L1599)
- [src/qwenpaw/providers/openai_provider.py:25-550](file://src/qwenpaw/providers/openai_provider.py#L25-L550)
- [src/qwenpaw/providers/anthropic_provider.py:27-256](file://src/qwenpaw/providers/anthropic_provider.py#L27-L256)
- [src/qwenpaw/providers/gemini_provider.py:27-332](file://src/qwenpaw/providers/gemini_provider.py#L27-L332)
- [src/qwenpaw/providers/ollama_provider.py:16-86](file://src/qwenpaw/providers/ollama_provider.py#L16-L86)
- [src/qwenpaw/providers/multimodal_prober.py:1-102](file://src/qwenpaw/providers/multimodal_prober.py#L1-L102)
- [src/qwenpaw/providers/capability_baseline.py:55-679](file://src/qwenpaw/providers/capability_baseline.py#L55-L679)
- [src/qwenpaw/providers/retry_chat_model.py:204-477](file://src/qwenpaw/providers/retry_chat_model.py#L204-L477)
- [src/qwenpaw/providers/rate_limiter.py:30-279](file://src/qwenpaw/providers/rate_limiter.py#L30-L279)

**章节来源**
- [src/qwenpaw/app/routers/providers.py:1-634](file://src/qwenpaw/app/routers/providers.py#L1-L634)
- [src/qwenpaw/providers/provider_manager.py:670-1599](file://src/qwenpaw/providers/provider_manager.py#L670-L1599)

## 核心组件
- Provider/ProviderInfo：抽象提供商定义与配置信息载体
- ProviderManager：提供商注册、持久化、活动模型槽位管理
- 具体提供商实现：OpenAI、Anthropic、Gemini、Ollama
- 多模态探测器：统一的图像/视频探测流程与结果
- 能力基线：官方文档标注与实际探测对比
- 重试与限流：透明重试与并发/速率控制

**章节来源**
- [src/qwenpaw/providers/provider.py:17-314](file://src/qwenpaw/providers/provider.py#L17-L314)
- [src/qwenpaw/providers/provider_manager.py:670-1599](file://src/qwenpaw/providers/provider_manager.py#L670-L1599)
- [src/qwenpaw/providers/multimodal_prober.py:75-102](file://src/qwenpaw/providers/multimodal_prober.py#L75-L102)
- [src/qwenpaw/providers/capability_baseline.py:20-90](file://src/qwenpaw/providers/capability_baseline.py#L20-L90)

## 架构总览
下图展示从HTTP请求到提供商调用的完整链路，包括能力探测与重试限流：

```mermaid
sequenceDiagram
participant Client as "客户端"
participant API as "FastAPI 路由<br/>providers.py"
participant PM as "ProviderManager"
participant Prov as "具体Provider"
participant Probe as "多模态探测器"
participant Retry as "重试包装"
participant Limiter as "限流器"
Client->>API : "GET /models"
API->>PM : "list_provider_info()"
PM-->>API : "ProviderInfo 列表"
API-->>Client : "200 OK"
Client->>API : "POST /models/{id}/test"
API->>PM : "get_provider(id)"
PM-->>API : "Provider 实例"
API->>Prov : "check_connection()"
Prov-->>API : "成功/失败"
API-->>Client : "TestConnectionResponse"
Client->>API : "POST /models/{id}/discover?save=true"
API->>PM : "fetch_provider_models(id, save)"
PM->>Prov : "fetch_models()"
Prov-->>PM : "ModelInfo 列表"
PM-->>API : "DiscoverModelsResponse"
API-->>Client : "200 OK"
Client->>API : "POST /models/{id}/models/{model}/probe-multimodal"
API->>PM : "probe_model_multimodal(id, model)"
PM->>Prov : "probe_model_multimodal()"
Prov->>Probe : "探测图像/视频"
Probe-->>Prov : "结果"
Prov-->>PM : "更新模型能力标记"
PM-->>API : "ProbeMultimodalResponse"
API-->>Client : "200 OK"
Client->>API : "PUT /models/active"
API->>PM : "activate_model(provider_id, model)"
PM-->>API : "ActiveModelsInfo"
API-->>Client : "200 OK"
```

**图表来源**
- [src/qwenpaw/app/routers/providers.py:147-634](file://src/qwenpaw/app/routers/providers.py#L147-L634)
- [src/qwenpaw/providers/provider_manager.py:847-1098](file://src/qwenpaw/providers/provider_manager.py#L847-L1098)
- [src/qwenpaw/providers/openai_provider.py:57-125](file://src/qwenpaw/providers/openai_provider.py#L57-L125)
- [src/qwenpaw/providers/multimodal_prober.py:75-102](file://src/qwenpaw/providers/multimodal_prober.py#L75-L102)
- [src/qwenpaw/providers/retry_chat_model.py:204-477](file://src/qwenpaw/providers/retry_chat_model.py#L204-L477)
- [src/qwenpaw/providers/rate_limiter.py:70-151](file://src/qwenpaw/providers/rate_limiter.py#L70-L151)

## 详细组件分析

### 路由与端点定义
- 列出所有提供商：GET /models
- 配置提供商：PUT /models/{provider_id}/config
- 测试提供商连接：POST /models/{provider_id}/test
- 发现可用模型：POST /models/{provider_id}/discover?save=true
- 测试指定模型：POST /models/{provider_id}/models/test
- 添加/删除模型：POST /models/{provider_id}/models, DELETE /models/{provider_id}/models/{model_id}
- 配置模型参数：PUT /models/{provider_id}/models/{model_id}/config
- 多模态探测：POST /models/{provider_id}/models/{model_id}/probe-multimodal
- 获取/设置活动模型：GET/PUT /models/active

```mermaid
flowchart TD
Start(["请求进入"]) --> Route["匹配路由与方法"]
Route --> Action{"动作类型？"}
Action --> |列出提供商| List["list_provider_info()"]
Action --> |配置提供商| Configure["update_provider()"]
Action --> |测试连接| TestConn["check_connection()"]
Action --> |发现模型| Discover["fetch_models()"]
Action --> |测试模型| TestModel["check_model_connection()"]
Action --> |增删模型| CRUD["add/delete model"]
Action --> |配置模型参数| ModelCfg["update_model_config()"]
Action --> |多模态探测| Probe["probe_model_multimodal()"]
Action --> |活动模型| Active["activate_model()/get_active_model()"]
List --> Resp["返回 ProviderInfo 列表"]
Configure --> Info["返回 ProviderInfo"]
TestConn --> ConnResp["返回 TestConnectionResponse"]
Discover --> DiscResp["返回 DiscoverModelsResponse"]
TestModel --> TmResp["返回 TestConnectionResponse"]
CRUD --> CRInfo["返回 ProviderInfo"]
ModelCfg --> MCInfo["返回 ProviderInfo"]
Probe --> PMResp["返回 ProbeMultimodalResponse"]
Active --> AMInfo["返回 ActiveModelsInfo"]
Resp --> End(["结束"])
Info --> End
ConnResp --> End
DiscResp --> End
TmResp --> End
CRInfo --> End
MCInfo --> End
PMResp --> End
AMInfo --> End
```

**图表来源**
- [src/qwenpaw/app/routers/providers.py:147-634](file://src/qwenpaw/app/routers/providers.py#L147-L634)

**章节来源**
- [src/qwenpaw/app/routers/providers.py:147-634](file://src/qwenpaw/app/routers/providers.py#L147-L634)

### Provider 抽象与数据模型
- ModelInfo：模型标识、名称、多模态支持标记、探测来源、生成参数覆盖
- ProviderInfo/Provider：提供商标识、名称、基础URL、API密钥、聊天模型类名、模型列表、附加模型、前缀、本地/冻结URL/需要密钥、模型发现/连接检查支持、生成参数、元数据
- Provider 抽象方法：check_connection、fetch_models、check_model_connection、add_model/delete_model、update_config、get_chat_model_instance、probe_model_multimodal、get_info

```mermaid
classDiagram
class ProviderInfo {
+string id
+string name
+string base_url
+string api_key
+string chat_model
+ModelInfo[] models
+ModelInfo[] extra_models
+string api_key_prefix
+bool is_local
+bool freeze_url
+bool require_api_key
+bool is_custom
+bool support_model_discovery
+bool support_connection_check
+Dict generate_kwargs
+Dict meta
}
class Provider {
<<abstract>>
+check_connection(timeout) tuple
+fetch_models(timeout) ModelInfo[]
+check_model_connection(model_id, timeout) tuple
+add_model(model_info, target, timeout) tuple
+delete_model(model_id, timeout) tuple
+update_config(config) void
+get_chat_model_instance(model_id) ChatModelBase
+probe_model_multimodal(model_id, timeout) ProbeResult
+get_info(mock_secret) ProviderInfo
}
class OpenAIProvider {
}
class AnthropicProvider {
}
class GeminiProvider {
}
class OllamaProvider {
}
Provider <|-- OpenAIProvider
Provider <|-- AnthropicProvider
Provider <|-- GeminiProvider
Provider <|-- OllamaProvider
ProviderInfo <|-- Provider
```

**图表来源**
- [src/qwenpaw/providers/provider.py:17-314](file://src/qwenpaw/providers/provider.py#L17-L314)
- [src/qwenpaw/providers/openai_provider.py:25-550](file://src/qwenpaw/providers/openai_provider.py#L25-L550)
- [src/qwenpaw/providers/anthropic_provider.py:27-256](file://src/qwenpaw/providers/anthropic_provider.py#L27-L256)
- [src/qwenpaw/providers/gemini_provider.py:27-332](file://src/qwenpaw/providers/gemini_provider.py#L27-L332)
- [src/qwenpaw/providers/ollama_provider.py:16-86](file://src/qwenpaw/providers/ollama_provider.py#L16-L86)

**章节来源**
- [src/qwenpaw/providers/provider.py:17-314](file://src/qwenpaw/providers/provider.py#L17-L314)

### ProviderManager 管理逻辑
- 初始化：准备目录、加载内置提供商、迁移旧配置、从磁盘恢复配置与活动模型
- 更新提供商：update_provider（持久化）、激活模型 activate_model、保存/清除活动模型
- 模型发现：fetch_provider_models（可选保存）
- 自定义提供商：add_custom_provider/remove_custom_provider
- 多模态探测：probe_model_multimodal（持久化更新），自动探测 maybe_probe_multimodal
- 插件提供商注册：register_plugin_provider
- 安全存储：敏感字段加密/解密、权限设置

```mermaid
flowchart TD
Init["初始化"] --> Prepare["准备目录结构"]
Prepare --> LoadBuiltIn["加载内置提供商"]
LoadBuiltIn --> Migrate["迁移旧配置"]
Migrate --> LoadDisk["从磁盘加载配置与活动模型"]
LoadDisk --> ApplyDefault["应用默认标注"]
Update["update_provider"] --> Save["保存到磁盘"]
Activate["activate_model"] --> SaveActive["保存活动模型"]
Discover["fetch_provider_models"] --> SaveExtra["保存发现的模型"]
CustomAdd["add_custom_provider"] --> SaveCustom["保存自定义提供商"]
Probe["probe_model_multimodal"] --> Persist["持久化能力标记"]
AutoProbe["maybe_probe_multimodal"] --> Probe
```

**图表来源**
- [src/qwenpaw/providers/provider_manager.py:696-1599](file://src/qwenpaw/providers/provider_manager.py#L696-L1599)

**章节来源**
- [src/qwenpaw/providers/provider_manager.py:696-1599](file://src/qwenpaw/providers/provider_manager.py#L696-L1599)

### OpenAI 兼容提供商
- 连接检查：调用 models.list
- 模型发现：解析 models.list 响应
- 模型连接测试：发送最小文本请求并消费流
- 多模态探测：图像/视频探测，带语义校验避免静默接受
- 聊天模型实例：OpenAIChatModelCompat

```mermaid
sequenceDiagram
participant PM as "ProviderManager"
participant OP as "OpenAIProvider"
participant API as "OpenAI API"
PM->>OP : "check_connection()"
OP->>API : "GET /models"
API-->>OP : "200 OK 或异常"
OP-->>PM : "成功/失败"
PM->>OP : "fetch_models()"
OP->>API : "GET /models"
API-->>OP : "模型列表"
OP-->>PM : "ModelInfo 列表"
PM->>OP : "check_model_connection(model)"
OP->>API : "POST /chat.completions (max_tokens=1)"
API-->>OP : "流式响应"
OP-->>PM : "成功/失败"
```

**图表来源**
- [src/qwenpaw/providers/openai_provider.py:57-125](file://src/qwenpaw/providers/openai_provider.py#L57-L125)

**章节来源**
- [src/qwenpaw/providers/openai_provider.py:57-125](file://src/qwenpaw/providers/openai_provider.py#L57-L125)

### Anthropic 提供商
- 连接检查：调用 models.list
- 模型发现：解析响应数据
- 模型连接测试：messages.create 并消费流
- 多模态探测：仅图像探测（不支持视频）

**章节来源**
- [src/qwenpaw/providers/anthropic_provider.py:66-127](file://src/qwenpaw/providers/anthropic_provider.py#L66-L127)

### Gemini 提供商
- 连接检查：异步 models.list
- 模型发现：异步遍历并标准化模型名
- 模型连接测试：generate_content_stream
- 多模态探测：图像/视频探测，使用 inline_data/file_data

**章节来源**
- [src/qwenpaw/providers/gemini_provider.py:68-131](file://src/qwenpaw/providers/gemini_provider.py#L68-L131)

### Ollama 提供商
- 适配OpenAI兼容端点：自动规范化URL（去除末尾/v1）
- 不支持手动增删模型：需通过Ollama CLI管理
- 聊天模型实例：OpenAIChatModelCompat

**章节来源**
- [src/qwenpaw/providers/ollama_provider.py:16-86](file://src/qwenpaw/providers/ollama_provider.py#L16-L86)

### 多模态探测与能力基线
- 探测器：统一的图像/视频探测常量与结果结构
- 基线：按提供商与模型记录期望能力（文档标注）
- 对比：将探测结果与基线对比，输出差异日志

```mermaid
flowchart TD
ProbeStart["开始探测"] --> Img["图像探测"]
Img --> ImgOK{"支持图像？"}
ImgOK --> |否| RecordImgFail["记录图像不支持"]
ImgOK --> |是| Vid["视频探测"]
Vid --> VidOK{"支持视频？"}
VidOK --> |是| RecordBoth["记录双模态支持"]
VidOK --> |否| RecordOnlyImg["记录仅图像支持"]
RecordImgFail --> Compare["与基线对比"]
RecordBoth --> Compare
RecordOnlyImg --> Compare
Compare --> Log["输出差异日志"]
```

**图表来源**
- [src/qwenpaw/providers/multimodal_prober.py:75-102](file://src/qwenpaw/providers/multimodal_prober.py#L75-L102)
- [src/qwenpaw/providers/capability_baseline.py:604-679](file://src/qwenpaw/providers/capability_baseline.py#L604-L679)

**章节来源**
- [src/qwenpaw/providers/multimodal_prober.py:75-102](file://src/qwenpaw/providers/multimodal_prober.py#L75-L102)
- [src/qwenpaw/providers/capability_baseline.py:604-679](file://src/qwenpaw/providers/capability_baseline.py#L604-L679)

### 重试与限流
- 重试策略：指数退避、最大重试次数、可重试状态码与异常类型
- 限流策略：并发信号量、QPM滑动窗口、全局429暂停与抖动
- 包装器：RetryChatModel在每次调用前后管理信号量与重试

```mermaid
flowchart TD
Call["调用入口"] --> Acquire["获取执行许可"]
Acquire --> QPM["检查QPM窗口"]
QPM --> Sem["获取并发信号量"]
Sem --> Exec["执行内部调用"]
Exec --> Stream{"是否流式？"}
Stream --> |否| Done["完成"]
Stream --> |是| Consume["消费流并释放信号量"]
Consume --> Done
Exec --> Error{"异常？"}
Error --> |否| Done
Error --> |是| Retryable{"可重试？"}
Retryable --> |否| Raise["抛出异常"]
Retryable --> |是| Backoff["指数退避等待"]
Backoff --> Acquire
```

**图表来源**
- [src/qwenpaw/providers/retry_chat_model.py:269-477](file://src/qwenpaw/providers/retry_chat_model.py#L269-L477)
- [src/qwenpaw/providers/rate_limiter.py:70-151](file://src/qwenpaw/providers/rate_limiter.py#L70-L151)

**章节来源**
- [src/qwenpaw/providers/retry_chat_model.py:269-477](file://src/qwenpaw/providers/retry_chat_model.py#L269-L477)
- [src/qwenpaw/providers/rate_limiter.py:70-151](file://src/qwenpaw/providers/rate_limiter.py#L70-L151)

## 依赖关系分析
- 路由依赖 ProviderManager 提供统一管理
- 具体Provider实现依赖对应SDK（OpenAI、Anthropic、Google GenAI）
- 多模态探测器与能力基线被ProviderManager用于能力标注与对比
- 重试与限流作为通用中间件应用于聊天模型实例

```mermaid
graph LR
Routes["路由层<br/>providers.py"] --> PM["ProviderManager"]
PM --> Providers["Provider 实现们"]
Providers --> SDKs["第三方SDK"]
PM --> Probe["多模态探测器"]
PM --> Baseline["能力基线"]
Providers --> Retry["重试包装"]
Retry --> Limiter["限流器"]
```

**图表来源**
- [src/qwenpaw/app/routers/providers.py:1-634](file://src/qwenpaw/app/routers/providers.py#L1-L634)
- [src/qwenpaw/providers/provider_manager.py:670-1599](file://src/qwenpaw/providers/provider_manager.py#L670-L1599)
- [src/qwenpaw/providers/retry_chat_model.py:204-477](file://src/qwenpaw/providers/retry_chat_model.py#L204-L477)
- [src/qwenpaw/providers/rate_limiter.py:30-279](file://src/qwenpaw/providers/rate_limiter.py#L30-L279)

**章节来源**
- [src/qwenpaw/app/routers/providers.py:1-634](file://src/qwenpaw/app/routers/providers.py#L1-L634)
- [src/qwenpaw/providers/provider_manager.py:670-1599](file://src/qwenpaw/providers/provider_manager.py#L670-L1599)

## 性能考虑
- 并发控制：通过信号量限制同时进行的请求，避免上游限流或过载
- QPM滑动窗口：在分钟级维度控制请求速率，减少突发流量
- 429协调：当收到429时设置全局暂停时间，配合抖动分散唤醒时间
- 指数退避：对瞬时错误进行指数退避重试，降低雪崩风险
- 流式响应：在流式场景中尽早释放信号量，避免长时间占用

[本节为通用指导，无需特定文件引用]

## 故障排除指南
- 连接失败
  - 检查 base_url 与网络连通性
  - 确认 API 密钥格式与前缀（如 sk-）
  - 使用 /models/{id}/test 进行快速验证
- 模型不可用
  - 使用 /models/{id}/models/test 验证具体模型
  - 若为自定义提供商，可能不支持连接检查
- 多模态探测异常
  - 某些提供商对媒体关键字有严格限制，会直接拒绝
  - 探测器包含语义校验，避免“静默接受”导致的误判
- 限流与重试
  - 观察限流器统计信息，调整并发与QPM配置
  - 对于429，优先遵循Retry-After头或默认暂停时间

**章节来源**
- [src/qwenpaw/providers/openai_provider.py:269-294](file://src/qwenpaw/providers/openai_provider.py#L269-L294)
- [src/qwenpaw/providers/anthropic_provider.py:233-255](file://src/qwenpaw/providers/anthropic_provider.py#L233-L255)
- [src/qwenpaw/providers/gemini_provider.py:309-331](file://src/qwenpaw/providers/gemini_provider.py#L309-L331)
- [src/qwenpaw/providers/retry_chat_model.py:124-140](file://src/qwenpaw/providers/retry_chat_model.py#L124-L140)
- [src/qwenpaw/providers/rate_limiter.py:152-174](file://src/qwenpaw/providers/rate_limiter.py#L152-L174)

## 结论
本API提供了统一、可扩展的模型提供商管理能力，覆盖从配置、连接测试、模型发现到多模态探测与活动模型管理的完整闭环。通过ProviderManager与具体Provider实现的分离，系统既支持内置提供商（OpenAI、Anthropic、Gemini、Ollama等），也允许用户添加自定义提供商。结合重试与限流机制，可在复杂网络环境下保持稳定与高效。

[本节为总结性内容，无需特定文件引用]

## 附录

### API 端点一览（摘要）
- GET /models：列出所有提供商
- PUT /models/{provider_id}/config：配置提供商（base_url、api_key、chat_model、generate_kwargs）
- POST /models/{provider_id}/test：测试提供商连接
- POST /models/{provider_id}/discover?save=true：发现可用模型
- POST /models/{provider_id}/models/test：测试指定模型
- POST /models/{provider_id}/models：添加模型
- DELETE /models/{provider_id}/models/{model_id}：删除模型
- PUT /models/{provider_id}/models/{model_id}/config：配置模型参数
- POST /models/{provider_id}/models/{model_id}/probe-multimodal：探测多模态能力
- GET /models/active：获取当前有效模型（支持作用域：effective/global/agent）
- PUT /models/active：设置活动模型（支持作用域：global/agent）

**章节来源**
- [src/qwenpaw/app/routers/providers.py:147-634](file://src/qwenpaw/app/routers/providers.py#L147-L634)

### 配置参数与认证方式
- OpenAI/兼容：支持 api_key 前缀（如 sk-），可配置 base_url；部分提供商冻结URL
- Anthropic：支持 api_key 前缀（如 sk-ant-），使用 AnthropicChatModel
- Gemini：使用 GeminiChatModel，支持模型发现
- Ollama：本地托管，通常不需要API密钥；自动规范化URL至 /v1

**章节来源**
- [src/qwenpaw/providers/openai_provider.py:25-550](file://src/qwenpaw/providers/openai_provider.py#L25-L550)
- [src/qwenpaw/providers/anthropic_provider.py:27-256](file://src/qwenpaw/providers/anthropic_provider.py#L27-L256)
- [src/qwenpaw/providers/gemini_provider.py:27-332](file://src/qwenpaw/providers/gemini_provider.py#L27-L332)
- [src/qwenpaw/providers/ollama_provider.py:16-86](file://src/qwenpaw/providers/ollama_provider.py#L16-L86)

### 最佳实践
- 在生产环境启用重试与限流，合理设置并发与QPM
- 使用 /models/{id}/discover 动态获取最新模型列表
- 对多模态需求明确的场景，先执行 /probe-multimodal 再选择模型
- 自定义提供商建议禁用连接检查（避免UI误判），但保留模型发现能力
- 定期清理未使用的模型与提供商，减少配置复杂度

[本节为通用指导，无需特定文件引用]