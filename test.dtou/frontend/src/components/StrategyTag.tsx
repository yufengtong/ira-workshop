import { Tag } from 'antd';

interface StrategyTagProps {
  type: string;
  name?: string;
}

const strategyConfig: Record<string, { color: string; label: string }> = {
  balanced: { color: 'blue', label: '均衡型' },
  focused: { color: 'green', label: '聚焦型' },
  aggressive: { color: 'orange', label: '激进型' },
  conservative: { color: 'purple', label: '保守型' },
};

const StrategyTag = ({ type, name }: StrategyTagProps) => {
  const config = strategyConfig[type] || { color: 'default', label: type };
  
  return (
    <Tag color={config.color} style={{ fontSize: 13, padding: '2px 10px' }}>
      {name || config.label}
    </Tag>
  );
};

export default StrategyTag;
