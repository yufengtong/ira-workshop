import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading?: boolean;
}

const StatCard = ({ 
  title, 
  value, 
  suffix, 
  prefix,
  trend,
  trendValue,
  loading = false 
}: StatCardProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
      case 'down':
        return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#52c41a';
      case 'down':
        return '#ff4d4f';
      default:
        return 'rgba(0, 0, 0, 0.45)';
    }
  };

  return (
    <Card loading={loading} bordered={false}>
      <Statistic
        title={title}
        value={value}
        suffix={suffix}
        prefix={prefix}
        valueStyle={{ fontSize: 28, fontWeight: 600 }}
      />
      {trend && trendValue && (
        <div style={{ marginTop: 8, fontSize: 14, color: getTrendColor() }}>
          {getTrendIcon()} {trendValue}
        </div>
      )}
    </Card>
  );
};

export default StatCard;
