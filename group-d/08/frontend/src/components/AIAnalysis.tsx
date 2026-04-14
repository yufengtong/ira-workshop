import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, Alert, Typography } from 'antd';
import { RobotOutlined, ReloadOutlined } from '@ant-design/icons';
import { analyzeStock } from '../api/stockApi';

const { Text, Paragraph } = Typography;

interface AIAnalysisProps {
  stockCode: string | null;
  stockName: string;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ stockCode, stockName }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 当切换股票时,重置分析内容
  useEffect(() => {
    setAnalysis('');
    setLoading(false);
    setError('');
  }, [stockCode]);

  const handleAnalyze = async () => {
    if (!stockCode) {
      setError('请先选择股票');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis('');

    try {
      const result = await analyzeStock(stockCode);
      if (result.success) {
        setAnalysis(result.analysis);
      } else {
        setError(result.message || '分析失败');
      }
    } catch (err) {
      setError('AI分析请求失败,请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (!stockCode) {
    return (
      <Card
        title={
          <span>
            <RobotOutlined style={{ marginRight: 8, color: '#1e3c72' }} />
            AI 智能分析
          </span>
        }
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontSize: '14px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
          <div>请选择股票后进行AI分析</div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <span>
          <RobotOutlined style={{ marginRight: 8, color: '#1e3c72' }} />
          AI 智能分析 - {stockName || stockCode}
        </span>
      }
      extra={
        <Button
          size="small"
          icon={<ReloadOutlined />}
          onClick={handleAnalyze}
          loading={loading}
          style={{
            borderRadius: '6px',
            border: '1px solid #1e3c72',
            color: '#1e3c72'
          }}
        >
          重新分析
        </Button>
      }
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}
    >
      {error && (
        <Alert
          message="分析失败"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666' }}>
            AI正在分析股票数据,请稍候...
          </div>
        </div>
      )}

      {!loading && !error && analysis && (
        <div style={{ padding: '8px 0' }}>
          <Alert
            message={
              <Text type="secondary" style={{ fontSize: '12px' }}>
                ⚠️ 本分析由AI生成,仅供参考,不构成投资建议
              </Text>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Paragraph
            style={{
              fontSize: '14px',
              lineHeight: '1.8',
              color: '#2c3e50',
              whiteSpace: 'pre-wrap'
            }}
          >
            {analysis}
          </Paragraph>
        </div>
      )}

      {!loading && !error && !analysis && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Button
            type="primary"
            size="large"
            onClick={handleAnalyze}
            style={{
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(30, 60, 114, 0.3)'
            }}
          >
            <RobotOutlined style={{ marginRight: 8 }} />
            开始AI分析
          </Button>
          <div style={{ marginTop: 12, color: '#999', fontSize: '12px' }}>
            点击按钮,让AI为您分析股票走势
          </div>
        </div>
      )}
    </Card>
  );
};

export default AIAnalysis;
