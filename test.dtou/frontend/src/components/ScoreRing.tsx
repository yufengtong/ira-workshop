import { Progress, Tooltip } from 'antd';

interface ScoreRingProps {
  score: number;
  title: string;
  size?: 'small' | 'default' | 'large';
}

const ScoreRing = ({ score, title, size = 'default' }: ScoreRingProps) => {
  const getStrokeColor = (value: number) => {
    if (value >= 80) return '#52c41a';
    if (value >= 60) return '#1890ff';
    if (value >= 40) return '#faad14';
    return '#ff4d4f';
  };
  
  const sizeMap = {
    small: 60,
    default: 100,
    large: 140,
  };
  
  const strokeWidthMap = {
    small: 6,
    default: 8,
    large: 10,
  };

  return (
    <Tooltip title={`${title}: ${score.toFixed(1)}分`}>
      <div style={{ textAlign: 'center' }}>
        <Progress
          type="circle"
          percent={score}
          strokeColor={getStrokeColor(score)}
          size={sizeMap[size]}
          strokeWidth={strokeWidthMap[size]}
          format={(percent) => (
            <span style={{ fontSize: size === 'small' ? 14 : size === 'large' ? 24 : 18, fontWeight: 600 }}>
              {percent?.toFixed(0)}
            </span>
          )}
        />
        <div style={{ marginTop: 8, fontSize: 14, color: 'rgba(0,0,0,0.65)' }}>
          {title}
        </div>
      </div>
    </Tooltip>
  );
};

export default ScoreRing;
