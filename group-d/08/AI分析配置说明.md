# AI分析功能配置指南

## 功能说明

股票分析平台新增了AI智能分析功能,使用通义千问(Qwen)大模型对股票数据进行分析,包括:
- 当前走势判断
- 涨跌幅原因分析  
- 短期趋势预判
- 操作建议参考

## 配置步骤

### 1. 获取 DashScope API Key

1. 访问阿里云 DashScope 控制台: https://dashscope.console.aliyun.com/apiKey
2. 登录阿里云账号
3. 创建或获取 API Key

### 2. 配置后端

编辑文件: `backend/src/main/resources/application.properties`

找到以下配置项:
```properties
# DashScope API Configuration (通义千问)
# 请在这里填入你的 DashScope API Key
# 获取地址: https://dashscope.console.aliyun.com/apiKey
dashscope.api.key=
```

在 `dashscope.api.key=` 后面填入你的API Key,例如:
```properties
dashscope.api.key=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. 重启后端服务

```bash
cd backend
mvn spring-boot:run
```

### 4. 使用AI分析功能

1. 打开前端页面: http://localhost:5173
2. 在股票列表中点击任意股票
3. 在右下角的"AI智能分析"卡片中点击"开始AI分析"按钮
4. 等待AI分析完成,查看分析结果

## 费用说明

- 通义千问 API 有一定的免费额度
- 超出免费额度后会按量计费
- 具体价格请参考阿里云官方文档
- 每次分析大约消耗几分钱

## 注意事项

1. **AI分析仅供参考**,不构成任何投资建议
2. 股票投资有风险,决策需谨慎
3. AI分析基于历史数据和技术指标,无法预测突发事件
4. 请合理控制分析频率,避免不必要的API调用

## 故障排查

### 问题: 提示"AI分析功能未配置"
**解决**: 检查 `application.properties` 中是否正确配置了 `dashscope.api.key`

### 问题: 提示"AI分析API调用失败"
**解决**: 
- 检查API Key是否正确
- 检查网络连接是否正常
- 检查阿里云账号是否有可用额度

### 问题: 分析结果加载慢
**解决**: 
- AI分析需要调用云端API,通常需要2-5秒
- 如果网络较慢可能需要更长时间
- 请耐心等待,不要频繁点击

## API说明

**后端接口**: `POST /api/stocks/analyze/{code}`

**请求参数**:
- `code`: 股票代码,例如 `sz002603`

**响应格式**:
```json
{
  "success": true,
  "analysis": "AI分析结果文本...",
  "stockName": "以岭药业",
  "stockCode": "sz002603"
}
```

## 模型说明

- 使用模型: `qwen-turbo` (通义千问-Turbo)
- 分析维度: 走势判断、原因分析、趋势预判、操作建议
- 输出长度: 200字以内
- 语言: 简体中文
