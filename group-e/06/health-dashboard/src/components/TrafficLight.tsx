import { HealthStatus } from '../types';

interface TrafficLightProps {
  status: HealthStatus;
  size?: 'small' | 'medium' | 'large';
}

export function TrafficLight({ status, size = 'medium' }: TrafficLightProps) {
  const sizeClasses = {
    small: { container: 'w-6 h-16', light: 'w-4 h-4' },
    medium: { container: 'w-10 h-24', light: 'w-6 h-6' },
    large: { container: 'w-14 h-32', light: 'w-8 h-8' },
  };

  const getLightOpacity = (lightStatus: HealthStatus) => {
    return status === lightStatus ? 'opacity-100 shadow-lg' : 'opacity-20';
  };

  const getGlowColor = (lightStatus: HealthStatus) => {
    switch (lightStatus) {
      case HealthStatus.HEALTHY:
        return 'shadow-green-500/50';
      case HealthStatus.WARNING:
        return 'shadow-yellow-500/50';
      case HealthStatus.CRITICAL:
        return 'shadow-red-500/50';
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`${classes.container} bg-gray-800 rounded-full flex flex-col items-center justify-around py-2 shadow-inner`}>
      {/* 红灯 - 严重 */}
      <div
        className={`${classes.light} rounded-full bg-red-500 transition-all duration-300 ${getLightOpacity(HealthStatus.CRITICAL)} ${status === HealthStatus.CRITICAL ? getGlowColor(HealthStatus.CRITICAL) : ''}`}
      />
      {/* 黄灯 - 警告 */}
      <div
        className={`${classes.light} rounded-full bg-yellow-500 transition-all duration-300 ${getLightOpacity(HealthStatus.WARNING)} ${status === HealthStatus.WARNING ? getGlowColor(HealthStatus.WARNING) : ''}`}
      />
      {/* 绿灯 - 健康 */}
      <div
        className={`${classes.light} rounded-full bg-green-500 transition-all duration-300 ${getLightOpacity(HealthStatus.HEALTHY)} ${status === HealthStatus.HEALTHY ? getGlowColor(HealthStatus.HEALTHY) : ''}`}
      />
    </div>
  );
}
