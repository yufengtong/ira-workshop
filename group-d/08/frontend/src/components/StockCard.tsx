import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import type { StockData } from '../types/stock';

interface StockCardProps {
  data: StockData | null;
}

const StockCard: React.FC<StockCardProps> = ({ data }) => {
  
  if (!data) {
    return (
      <Card 
        title="股票详细信息"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999', fontSize: '14px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👈</div>
          <div>请点击股票列表查看详情</div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="股票详细信息"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Statistic 
            title="股票名称" 
            value={data.name}
            valueStyle={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title="股票代码" 
            value={data.code}
            valueStyle={{ fontSize: '16px', fontWeight: 600, color: '#1e3c72' }}
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="当前价" 
            value={data.currentPrice || 0} 
            precision={2}
            suffix="元"
            valueStyle={{ 
              fontSize: '20px',
              fontWeight: 700,
              color: (data.changePercent || 0) > 0 ? '#cf1322' : (data.changePercent || 0) < 0 ? '#3f8600' : '#2c3e50'
            }}
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="涨跌幅" 
            value={data.changePercent || 0} 
            precision={2}
            suffix="%"
            valueStyle={{ 
              fontSize: '20px',
              fontWeight: 700,
              color: (data.changePercent || 0) > 0 ? '#cf1322' : (data.changePercent || 0) < 0 ? '#3f8600' : '#2c3e50'
            }}
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="成交量" 
            value={data.volume || 0} 
            suffix="手"
            valueStyle={{ fontSize: '16px', fontWeight: 600 }}
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="开盘价" 
            value={data.openPrice || 0} 
            precision={2}
            suffix="元"
            valueStyle={{ fontSize: '15px', fontWeight: 500 }}
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="昨收价" 
            value={data.preClose || 0} 
            precision={2}
            suffix="元"
            valueStyle={{ fontSize: '15px', fontWeight: 500 }}
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="最高价" 
            value={data.highPrice || 0} 
            precision={2}
            suffix="元"
            valueStyle={{ fontSize: '15px', fontWeight: 500 }}
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="最低价" 
            value={data.lowPrice || 0} 
            precision={2}
            suffix="元"
            valueStyle={{ fontSize: '15px', fontWeight: 500 }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default StockCard;
