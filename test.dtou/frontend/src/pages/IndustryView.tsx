import { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Tag, Tooltip, Spin, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ReactECharts from 'echarts-for-react';
import { industryApi } from '../services/api';
import type { IndustryDistributionDTO, FundIndustry } from '../types';
import StatCard from '../components/StatCard';

const IndustryView = () => {
  const [industries, setIndustries] = useState<FundIndustry[]>([]);
  const [distribution, setDistribution] = useState<IndustryDistributionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [industriesRes, distributionRes] = await Promise.all([
        industryApi.getAll(1),
        industryApi.getDistribution(),
      ]);
      setIndustries(industriesRes.data);
      setDistribution(distributionRes.data);
      setError(null);
    } catch (err) {
      setError('数据加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = distribution.reduce((sum, d) => sum + d.productCount, 0);
  const totalAsset = distribution.reduce((sum, d) => sum + d.totalAsset, 0);
  const totalCompanies = distribution.reduce((sum, d) => sum + d.companyCount, 0);

  const chartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['产品数量', '参与公司数'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: distribution.map(d => d.industryName),
      axisLabel: {
        rotate: 30,
        interval: 0,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '产品数量',
        position: 'left',
      },
      {
        type: 'value',
        name: '公司数',
        position: 'right',
      },
    ],
    series: [
      {
        name: '产品数量',
        type: 'bar',
        data: distribution.map(d => d.productCount),
        itemStyle: { color: '#1890ff' },
      },
      {
        name: '参与公司数',
        type: 'line',
        yAxisIndex: 1,
        data: distribution.map(d => d.companyCount),
        itemStyle: { color: '#52c41a' },
      },
    ],
  };

  const pieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}亿元 ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: distribution.map(d => ({
          name: d.industryName,
          value: d.totalAsset,
        })),
      },
    ],
  };

  const columns: ColumnsType<IndustryDistributionDTO> = [
    {
      title: '行业名称',
      dataIndex: 'industryName',
      key: 'industryName',
      render: (text, record) => (
        <Tooltip title={record.industryCode}>
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: '产品数量',
      dataIndex: 'productCount',
      key: 'productCount',
      sorter: (a, b) => a.productCount - b.productCount,
      render: (value) => (
        <Tag color="blue">{value} 只</Tag>
      ),
    },
    {
      title: '资产规模',
      dataIndex: 'totalAsset',
      key: 'totalAsset',
      sorter: (a, b) => a.totalAsset - b.totalAsset,
      render: (value) => `${value.toFixed(2)} 亿元`,
    },
    {
      title: '参与公司',
      dataIndex: 'companyCount',
      key: 'companyCount',
      sorter: (a, b) => a.companyCount - b.companyCount,
      render: (value) => `${value} 家`,
    },
    {
      title: '市场份额',
      dataIndex: 'marketShare',
      key: 'marketShare',
      sorter: (a, b) => a.marketShare - b.marketShare,
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 100,
              height: 8,
              background: '#f0f0f0',
              borderRadius: 4,
              marginRight: 8,
            }}
          >
            <div
              style={{
                width: `${Math.min(value, 100)}%`,
                height: '100%',
                background: value > 50 ? '#52c41a' : value > 20 ? '#1890ff' : '#faad14',
                borderRadius: 4,
              }}
            />
          </div>
          <span>{value.toFixed(2)}%</span>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 style={{ marginBottom: 24 }}>行业布局分析</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="行业总数"
            value={industries.length}
            suffix="个"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="产品总数"
            value={totalProducts}
            suffix="只"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="总资产规模"
            value={totalAsset.toFixed(2)}
            suffix="亿元"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="参与公司"
            value={totalCompanies}
            suffix="家"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="行业产品分布" bordered={false}>
            <ReactECharts option={chartOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="行业资产占比" bordered={false}>
            <ReactECharts option={pieOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Card title="行业详细数据" bordered={false}>
        <Table
          columns={columns}
          dataSource={distribution}
          rowKey="industryCode"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default IndustryView;
