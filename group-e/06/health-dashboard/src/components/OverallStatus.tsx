import { JourneyHealth, HealthStatus } from '../types';
import { TrafficLight } from './TrafficLight';

interface OverallStatusProps {
  journeyHealth: JourneyHealth;
}

export function OverallStatus({ journeyHealth }: OverallStatusProps) {
  const { overallStatus, brokenStepId, lastUpdated } = journeyHealth;

  const getStatusText = () => {
    switch (overallStatus) {
      case HealthStatus.HEALTHY:
        return '系统运行正常';
      case HealthStatus.WARNING:
        return '系统存在警告';
      case HealthStatus.CRITICAL:
        return '系统严重异常';
    }
  };

  const getStatusDescription = () => {
    if (brokenStepId) {
      const brokenStep = journeyHealth.steps.find(s => s.step.id === brokenStepId);
      return `链路在「${brokenStep?.step.name}」处断裂，请立即检查！`;
    }
    if (overallStatus === HealthStatus.WARNING) {
      const warningSteps = journeyHealth.steps.filter(s => s.status === HealthStatus.WARNING);
      return `${warningSteps.length} 个步骤存在性能警告，建议关注。`;
    }
    return '所有业务步骤运行正常，用户体验良好。';
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-6">
        <TrafficLight status={overallStatus} size="large" />
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">
            {getStatusText()}
          </h2>
          <p className={`text-lg ${
            overallStatus === HealthStatus.HEALTHY ? 'text-green-400' :
            overallStatus === HealthStatus.WARNING ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {getStatusDescription()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            最后更新: {formatTime(lastUpdated)}
          </p>
        </div>

        {/* 统计摘要 */}
        <div className="flex gap-4">
          <div className="text-center px-4 py-2 bg-green-500/10 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {journeyHealth.steps.filter(s => s.status === HealthStatus.HEALTHY).length}
            </div>
            <div className="text-xs text-gray-400">健康</div>
          </div>
          <div className="text-center px-4 py-2 bg-yellow-500/10 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {journeyHealth.steps.filter(s => s.status === HealthStatus.WARNING).length}
            </div>
            <div className="text-xs text-gray-400">警告</div>
          </div>
          <div className="text-center px-4 py-2 bg-red-500/10 rounded-lg">
            <div className="text-2xl font-bold text-red-400">
              {journeyHealth.steps.filter(s => s.status === HealthStatus.CRITICAL).length}
            </div>
            <div className="text-xs text-gray-400">严重</div>
          </div>
        </div>
      </div>
    </div>
  );
}
