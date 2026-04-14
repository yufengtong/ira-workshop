import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Button, Space, message, Typography, Row, Col } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import StockTable from './components/StockTable';
import StockChart from './components/StockChart';
import StockCard from './components/StockCard';
import StockManager from './components/StockManager';
import AIAnalysis from './components/AIAnalysis';
import { getRealTimeData, refreshData } from './api/stockApi';
import type { StockData } from './types/stock';

const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  // 从localStorage加载股票代码
  const [stockCodes, setStockCodes] = useState<string[]>(() => {
    const saved = localStorage.getItem('stockCodes');
    return saved ? JSON.parse(saved) : ['sz002603', 'sz002604'];
  });
  
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false); // 默认关闭自动刷新

  // 获取实时数据
  const fetchRealTimeData = useCallback(async () => {
    if (stockCodes.length === 0) return;
    
    setLoading(true);
    try {
      const codes = stockCodes.join(',');
      const data = await getRealTimeData(codes);
      setStockData(data);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [stockCodes]);

  // 刷新数据
  const handleRefresh = async () => {
    if (stockCodes.length === 0) {
      message.warning('请先添加股票代码');
      return;
    }
    
    setLoading(true);
    try {
      const codes = stockCodes.join(',');
      const data = await refreshData(codes);
      setStockData(data);
      message.success('数据已刷新');
    } catch (error) {
      message.error('刷新数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 选择股票
  const handleSelectStock = (code: string) => {
    setSelectedCode(code);
    const stock = stockData.find(s => s.code === code);
    if (stock) {
      setSelectedName(stock.name);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchRealTimeData();
  }, [fetchRealTimeData]);

  // 当股票数据加载后,默认选中第一个股票
  useEffect(() => {
    if (stockData.length > 0 && !selectedCode) {
      const firstStock = stockData[0];
      setSelectedCode(firstStock.code);
      setSelectedName(firstStock.name);
    }
  }, [stockData, selectedCode]);

  // 自动刷新(30秒)
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchRealTimeData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchRealTimeData]);

  // 获取选中股票的当前数据
  const selectedStockData = Array.isArray(stockData) 
    ? stockData.find(s => s.code === selectedCode) || null
    : null;

  // 删除股票
  const handleDeleteStock = (code: string) => {
    const newCodes = stockCodes.filter(c => c !== code);
    setStockCodes(newCodes);
    localStorage.setItem('stockCodes', JSON.stringify(newCodes));
    
    // 如果删除的是当前选中的股票,取消选中
    if (selectedCode === code) {
      setSelectedCode(null);
      setSelectedName('');
    }
    
    message.success('已删除');
  };

  return (
    <Layout style={{ 
      minHeight: '100vh', 
      width: '100vw',
      maxWidth: '100vw',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
    }}>
      {/* 顶部 Header */}
      <Header style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        height: '70px',
        lineHeight: '70px',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0
          }}>
            📈
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <Title level={4} style={{ margin: 0, color: '#1a1a1a', fontSize: '22px', fontWeight: 700 }}>
              股票分析平台
            </Title>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: 400 }}>
              实时行情 · 智能分析
            </span>
          </div>
        </div>
        <Space size="middle">
          <Button 
            type={autoRefresh ? 'primary' : 'default'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              borderRadius: '8px',
              border: autoRefresh ? 'none' : '1px solid #d9d9d9',
              background: autoRefresh ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' : '#fff',
              boxShadow: autoRefresh ? '0 2px 8px rgba(30, 60, 114, 0.3)' : 'none'
            }}
          >
            自动刷新: {autoRefresh ? '开' : '关'}
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
            type="primary"
            style={{
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(30, 60, 114, 0.3)'
            }}
          >
            刷新数据
          </Button>
        </Space>
      </Header>
      
      {/* 主内容区 */}
      <Content style={{ 
        padding: '20px 24px', 
        background: 'transparent',
        width: '100%',
        maxWidth: '100%',
        overflow: 'auto',
        boxSizing: 'border-box'
      }}>
        {/* 顶部: 股票管理 + 列表 (横向占满) */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <StockManager 
              stockCodes={stockCodes}
              onChange={setStockCodes}
            />
          </div>
          <StockTable 
            data={stockData}
            loading={loading}
            selectedCode={selectedCode}
            onSelectStock={handleSelectStock}
            onDeleteStock={handleDeleteStock}
          />
        </div>
        
        {/* 下方: 详细信息 + K线图 + AI分析 (三栏布局) */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <StockCard data={selectedStockData} />
          </Col>
          <Col xs={24} lg={8}>
            <StockChart 
              stockCode={selectedCode}
              stockName={selectedName}
            />
          </Col>
          <Col xs={24} lg={8}>
            <AIAnalysis 
              stockCode={selectedCode}
              stockName={selectedName}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default App;
