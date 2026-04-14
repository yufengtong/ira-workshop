import { BusinessStep, StepMetrics, HealthThresholds, HealthStatus } from '../types';

// 业务步骤定义：登录 → 搜索 → 加购 → 下单 → 支付
export const businessSteps: BusinessStep[] = [
  { id: 'login', name: '用户登录', icon: '🔐', order: 1 },
  { id: 'search', name: '商品搜索', icon: '🔍', order: 2 },
  { id: 'addToCart', name: '加入购物车', icon: '🛒', order: 3 },
  { id: 'placeOrder', name: '提交订单', icon: '📋', order: 4 },
  { id: 'payment', name: '支付结算', icon: '💳', order: 5 },
];

// 健康度阈值配置
export const healthThresholds: HealthThresholds = {
  passRateWarning: 90,      // 通过率低于90%警告
  passRateCritical: 70,     // 通过率低于70%严重
  responseTimeWarning: 500,  // 响应时间超过500ms警告
  responseTimeCritical: 1000, // 响应时间超过1000ms严重
};

// 生成随机指标数据
export function generateMockMetrics(stepId: string): StepMetrics {
  // 模拟不同步骤的基础性能特征
  const baseResponseTime: Record<string, number> = {
    login: 200,
    search: 300,
    addToCart: 150,
    placeOrder: 400,
    payment: 500,
  };

  const base = baseResponseTime[stepId] || 200;
  
  // 随机波动 (-30% 到 +50%)
  const fluctuation = 0.7 + Math.random() * 0.8;
  const avgResponseTime = Math.round(base * fluctuation);
  
  // 随机通过率 (60% - 100%)
  const passRate = Math.round(60 + Math.random() * 40);
  
  // 总测试数 (50-200)
  const totalTests = Math.floor(50 + Math.random() * 150);
  const passedTests = Math.floor(totalTests * (passRate / 100));

  return {
    stepId,
    passRate,
    avgResponseTime,
    totalTests,
    passedTests,
    lastUpdated: new Date(),
  };
}

// 计算步骤健康状态
export function calculateStepStatus(
  metrics: StepMetrics,
  thresholds: HealthThresholds
): HealthStatus {
  // 如果通过率低于严重阈值，返回严重
  if (metrics.passRate < thresholds.passRateCritical) {
    return HealthStatus.CRITICAL;
  }
  // 如果响应时间超过严重阈值，返回严重
  if (metrics.avgResponseTime > thresholds.responseTimeCritical) {
    return HealthStatus.CRITICAL;
  }
  // 如果通过率低于警告阈值，返回警告
  if (metrics.passRate < thresholds.passRateWarning) {
    return HealthStatus.WARNING;
  }
  // 如果响应时间超过警告阈值，返回警告
  if (metrics.avgResponseTime > thresholds.responseTimeWarning) {
    return HealthStatus.WARNING;
  }
  // 否则健康
  return HealthStatus.HEALTHY;
}

// 检测链路是否断裂（某个步骤严重失败）
export function detectBrokenStep(
  stepsHealth: { step: BusinessStep; status: HealthStatus }[]
): string | null {
  for (const stepHealth of stepsHealth) {
    if (stepHealth.status === HealthStatus.CRITICAL) {
      return stepHealth.step.id;
    }
  }
  return null;
}

// 计算整体健康状态
export function calculateOverallStatus(stepsStatus: HealthStatus[]): HealthStatus {
  if (stepsStatus.includes(HealthStatus.CRITICAL)) {
    return HealthStatus.CRITICAL;
  }
  if (stepsStatus.includes(HealthStatus.WARNING)) {
    return HealthStatus.WARNING;
  }
  return HealthStatus.HEALTHY;
}
