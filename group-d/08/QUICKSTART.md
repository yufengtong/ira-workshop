# 股票分析平台 - 快速启动指南

## ✅ 项目已成功创建!

### 当前状态

**后端服务**: ✅ 已启动
- 地址: http://localhost:8080
- H2控制台: http://localhost:8080/h2-console
- 状态: 运行中

**前端服务**: ✅ 已启动  
- 地址: http://localhost:5174
- 状态: 运行中

### 访问应用

打开浏览器访问: **http://localhost:5174**

### 功能说明

1. **股票列表**: 默认显示 sz002603 和 sz002604 两只股票
2. **实时数据**: 从新浪财经API获取实时股票数据
3. **自动刷新**: 每30秒自动刷新数据(可开关)
4. **手动刷新**: 点击"刷新数据"按钮立即更新
5. **查看详情**: 点击股票列表中的任一行,查看详细信息和走势图
6. **涨跌幅**: 红色表示上涨,绿色表示下跌

### H2数据库访问

如需查看数据库中的数据:
- URL: http://localhost:8080/h2-console
- JDBC URL: jdbc:h2:mem:stockdb
- 用户名: sa
- 密码: (留空)

### API接口测试

你可以直接使用以下接口:

```bash
# 获取实时数据
curl "http://localhost:8080/api/stocks/realtime?codes=sz002603,sz002604"

# 刷新并保存数据
curl -X POST "http://localhost:8080/api/stocks/refresh?codes=sz002603,sz002604"

# 获取历史数据
curl "http://localhost:8080/api/stocks/history/sz002603?hours=24"
```

### 项目结构

```
qoder-test/
├── backend/                 # Spring Boot后端
│   ├── src/main/java/com/stock/
│   │   ├── StockAnalysisApplication.java
│   │   ├── controller/      # REST API
│   │   ├── service/         # 业务逻辑
│   │   ├── model/           # 数据实体
│   │   ├── repository/      # 数据访问
│   │   └── config/          # 配置
│   └── pom.xml
├── frontend/                # React前端
│   ├── src/
│   │   ├── api/             # API调用
│   │   ├── components/      # React组件
│   │   ├── types/           # TypeScript类型
│   │   └── App.tsx
│   └── package.json
├── start-backend.sh         # 启动后端脚本
├── start-frontend.sh        # 启动前端脚本
├── start-all.sh             # 启动全部服务
└── README.md
```

### 下次启动

如果需要重新启动服务:

```bash
# 方式1: 启动所有服务
./start-all.sh

# 方式2: 分别启动
./start-backend.sh    # 终端1
./start-frontend.sh   # 终端2
```

或者使用IntelliJ IDEA打开backend文件夹,运行StockAnalysisApplication.java

### 注意事项

1. 新浪API在交易时间(工作日9:30-15:00)返回实时数据
2. 非交易时间返回最近一个交易日的数据
3. 确保网络连接正常,可以访问 https://hq.sinajs.cn
4. 前端使用代理转发API请求到后端,无需配置跨域

### 技术栈

**前端**:
- React 18 + TypeScript
- Vite 5
- Ant Design 5
- ECharts 5
- Axios

**后端**:
- Spring Boot 3.2
- Spring Data JPA
- H2 Database
- Maven
- Java 21

### 常见问题

**Q: 前端页面显示空白?**
A: 确保后端已启动在8080端口,检查浏览器控制台是否有错误

**Q: 获取数据失败?**
A: 检查网络连接,确认可以访问新浪财经API

**Q: 端口被占用?**
A: 前端会自动尝试其他端口,后端可在application.properties中修改

**Q: 如何添加更多股票?**
A: 修改前端App.tsx中的DEFAULT_CODES变量,例如:
```typescript
const DEFAULT_CODES = 'sz002603,sz002604,sh600000';
```

---

🎉 享受你的股票分析平台!
