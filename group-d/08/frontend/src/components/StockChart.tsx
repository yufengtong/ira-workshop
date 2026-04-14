import React, { useState } from 'react';
import { Card, Tabs, Image, Button, Space } from 'antd';
import { LineChartOutlined, BarChartOutlined } from '@ant-design/icons';
import { getKLineImageUrl } from '../api/stockApi';

interface StockChartProps {
  stockCode: string | null;
  stockName: string;
}

const StockChart: React.FC<StockChartProps> = ({ stockCode, stockName }) => {
  const [chartType, setChartType] = useState<string>('min');

  if (!stockCode) {
    return (
      <Card 
        title="股票走势图"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999', fontSize: '14px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <div>请选择股票查看图表</div>
        </div>
      </Card>
    );
  }

  const items = [
    {
      key: 'min',
      label: '分时图',
      icon: <LineChartOutlined />,
    },
    {
      key: 'daily',
      label: '日K线',
      icon: <BarChartOutlined />,
    },
    {
      key: 'weekly',
      label: '周K线',
      icon: <BarChartOutlined />,
    },
    {
      key: 'monthly',
      label: '月K线',
      icon: <BarChartOutlined />,
    },
  ];

  const imageUrl = getKLineImageUrl(stockCode, chartType);

  return (
    <Card 
      title={`${stockName || '未知'} (${stockCode}) - K线图`}
      extra={
        <Button 
          size="small" 
          onClick={() => window.open(imageUrl, '_blank')}
          style={{
            borderRadius: '6px',
            border: '1px solid #1e3c72',
            color: '#1e3c72'
          }}
        >
          查看原图
        </Button>
      }
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}
    >
      <Tabs
        items={items}
        activeKey={chartType}
        onChange={setChartType}
        size="small"
        style={{ marginBottom: 16 }}
      />
      
      <div style={{ 
        textAlign: 'center', 
        padding: '12px',
        overflow: 'hidden',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <Image
          src={imageUrl}
          alt={`${stockName} ${chartType}图`}
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            display: 'block',
            margin: '0 auto',
            borderRadius: '8px'
          }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
      </div>
    </Card>
  );
};

export default StockChart;
