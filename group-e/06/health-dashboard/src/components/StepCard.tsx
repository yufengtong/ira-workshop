import { StepHealth, HealthStatus } from '../types';
import { TrafficLight } from './TrafficLight';

interface StepCardProps {
  stepHealth: StepHealth;
  isLast: boolean;
}

export function StepCard({ stepHealth, isLast }: StepCardProps) {
  const { step, metrics, status, isBroken } = stepHealth;

  const getStatusStyles = () => {
    switch (status) {
      case HealthStatus.HEALTHY:
        return 'border-green-500/30 bg-green-500/5';
      case HealthStatus.WARNING:
        return 'border-yellow-500/30 bg-yellow-500/5';
      case HealthStatus.CRITICAL:
        return 'border-red-500/30 bg-red-500/5';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case HealthStatus.HEALTHY:
        return '健康';
      case HealthStatus.WARNING:
        return '警告';
      case HealthStatus.CRITICAL:
        return '严重';
    }
  };

  const getResponseTimeColor = () => {
    if (metrics.avgResponseTime > 1000) return 'text-red-400';
    if (metrics.avgResponseTime > 500) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="flex items-center">
      <div
        className={`relative p-5 rounded-xl border-2 transition-all duration-500 ${getStatusStyles()} ${
          isBroken ? 'animate-pulse ring-2 ring-red-500 ring-opacity-50' : ''
        } min-w-[200px]`}
      >
        {/* 断裂标记 */}
        {isBroken && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-bounce">
            ⚠️ 链路断裂
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* 红绿灯 */}
          <TrafficLight status={status} size="small" />

          {/* 内容 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{step.icon}</span>
              <h3 className="font-bold text-white">{step.name}</h3>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">状态:</span>
                <span className={`font-medium ${
                  status === HealthStatus.HEALTHY ? 'text-green-400' :
                  status === HealthStatus.WARNING ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {getStatusText()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">通过率:</span>
                <span className={`font-mono font-medium ${
                  metrics.passRate >= 90 ? 'text-green-400' :
                  metrics.passRate >= 70 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {metrics.passRate}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">响应时间:</span>
                <span className={`font-mono font-medium ${getResponseTimeColor()}`}>
                  {metrics.avgResponseTime}ms
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">测试数:</span>
                <span className="font-mono text-gray-300">
                  {metrics.passedTests}/{metrics.totalTests}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 连接箭头 */}
      {!isLast && (
        <div className="flex items-center px-2">
          <div className={`w-8 h-0.5 ${
            isBroken ? 'bg-red-500' : 'bg-gray-600'
          }`} />
          <div className={`w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent ${
            isBroken ? 'border-l-red-500' : 'border-l-gray-600'
          }`} style={{
            borderLeftWidth: '6px',
            borderLeftStyle: 'solid',
          }} />
        </div>
      )}
    </div>
  );
}
