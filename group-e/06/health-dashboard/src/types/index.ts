// 健康状态枚举
export enum HealthStatus {
  HEALTHY = 'healthy',      // 绿色 - 健康
  WARNING = 'warning',      // 黄色 - 警告
  CRITICAL = 'critical',    // 红色 - 严重
}

// 业务步骤定义
export interface BusinessStep {
  id: string;
  name: string;
  icon: string;
  order: number;
}

// 步骤指标数据
export interface StepMetrics {
  stepId: string;
  passRate: number;          // 测试通过率 (%)
  avgResponseTime: number;   // 平均响应时间 (ms)
  totalTests: number;        // 总测试数
  passedTests: number;       // 通过测试数
  lastUpdated: Date;
}

// 步骤健康状态（包含计算后的状态）
export interface StepHealth {
  step: BusinessStep;
  metrics: StepMetrics;
  status: HealthStatus;
  isBroken: boolean;
}

// 整个链路的健康状态
export interface JourneyHealth {
  steps: StepHealth[];
  overallStatus: HealthStatus;
  brokenStepId: string | null;
  lastUpdated: Date;
}

// 健康度阈值配置
export interface HealthThresholds {
  passRateWarning: number;   // 通过率警告阈值 (%)
  passRateCritical: number;  // 通过率严重阈值 (%)
  responseTimeWarning: number;  // 响应时间警告阈值 (ms)
  responseTimeCritical: number; // 响应时间严重阈值 (ms)
}
