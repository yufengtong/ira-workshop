import { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Select, 
  Tabs, 
  Tag, 
  Spin, 
  Alert,
  Descriptions,
  Progress,
  Space,
  Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ReactECharts from 'echarts-for-react';
import { companyApi } from '../services/api';
import type { FundCompany, CompanyProductDTO, ProductDetailDTO } from '../types';
import StatCard from '../components/StatCard';
import StrategyTag from '../components/StrategyTag';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const CompanyView = () => {
  const [companies, setCompanies] = useState<FundCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [companyData, setCompanyData] = useState<CompanyProductDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyData(selectedCompany);
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const res = await companyApi.getAll();
      setCompanies(res.data);
      if (res.data.length > 0) {
        setSelectedCompany(res.data[0].companyCode);
      }
      setError(null);
    } catch (err) {
      setError('加载公司列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyData = async (code: string) => {
    try {
      setLoading(true);
      const res = await companyApi.getProducts(code);
      setCompanyData(res.data);
      setError(null);
    } catch (err) {
      setError('加载公司数据失败');
    } finally {
      setLoading(false);
    }
  };

  const productColumns: ColumnsType<ProductDetailDTO> = [
    {
      title: '基金代码',
      dataIndex: 'tsCode',
      key: 'tsCode',
      width: 120,
    },
    {
      title: '基金名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '基金类型',
      dataIndex: 'fundType',
      key: 'fundType',
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: '行业分类',
      dataIndex: 'industryName',
      key: 'industryName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap: Record<string, string> = {
          '运作中': 'green',
          '待发售': 'orange',
          '上报中': 'blue',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: '资产规模',
      dataIndex: 'asset',
      key: 'asset',
      render: (value) => `${value?.toFixed(2) || 0} 亿元`,
    },
    {
      title: '成立日期',
      dataIndex: 'establishDate',
      key: 'establishDate',
    },
  ];

  const getIndustryChartOption = () => {
    if (!companyData?.industryDistribution) return {};
    
    const data = Object.entries(companyData.industryDistribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}只 ({d}%)',
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
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          data,
        },
      ],
    };
  };

  const getStatusChartOption = () => {
    if (!companyData) return {};
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}只 ({d}%)',
      },
      series: [
        {
          type: 'pie',
          radius: '60%',
          data: [
            { value: companyData.operatingCount, name: '运作中', itemStyle: { color: '#52c41a' } },
            { value: companyData.pendingCount, name: '待发售', itemStyle: { color: '#faad14' } },
            { value: companyData.reportingCount, name: '上报中', itemStyle: { color: '#1890ff' } },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  };

  if (loading && !companyData) {
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
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h2 style={{ margin: 0 }}>公司产品布局</h2>
        </Col>
        <Col>
          <Select
            style={{ width: 280 }}
            placeholder="选择基金公司"
            value={selectedCompany}
            onChange={setSelectedCompany}
            loading={loading}
          >
            {companies.map((company) => (
              <Option key={company.companyCode} value={company.companyCode}>
                {company.shortName || company.companyName}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      {companyData && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="产品总数"
                value={companyData.totalProducts}
                suffix="只"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="运作中"
                value={companyData.operatingCount}
                suffix="只"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="待发售/上报"
                value={companyData.pendingCount + companyData.reportingCount}
                suffix="只"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="管理规模"
                value={companyData.totalAsset?.toFixed(2) || 0}
                suffix="亿元"
              />
            </Col>
          </Row>

          <Card bordered={false} style={{ marginBottom: 24 }}>
            <Descriptions title="公司战略分析" bordered>
              <Descriptions.Item label="公司名称" span={2}>
                {companyData.companyName}
              </Descriptions.Item>
              <Descriptions.Item label="战略类型">
                <StrategyTag type={companyData.strategyType} />
              </Descriptions.Item>
              <Descriptions.Item label="战略描述" span={3}>
                {companyData.strategyDesc || '暂无描述'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Tabs defaultActiveKey="products" style={{ marginBottom: 24 }}>
            <TabPane tab="产品列表" key="products">
              <Card bordered={false}>
                <Table
                  columns={productColumns}
                  dataSource={companyData.products}
                  rowKey="tsCode"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              </Card>
            </TabPane>
            
            <TabPane tab="行业分布" key="industry">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="行业分布占比" bordered={false}>
                    <ReactECharts 
                      option={getIndustryChartOption()} 
                      style={{ height: 350 }} 
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="行业布局详情" bordered={false}>
                    {Object.entries(companyData.industryDistribution || {})
                      .sort((a, b) => b[1] - a[1])
                      .map(([industry, count]) => (
                        <div key={industry} style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text strong>{industry}</Text>
                            <Text>{count} 只</Text>
                          </div>
                          <Progress
                            percent={Math.round((count / companyData.totalProducts) * 100)}
                            strokeColor={count > companyData.totalProducts * 0.3 ? '#52c41a' : '#1890ff'}
                            showInfo={false}
                          />
                        </div>
                      ))}
                  </Card>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane tab="产品状态" key="status">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="产品状态分布" bordered={false}>
                    <ReactECharts 
                      option={getStatusChartOption()} 
                      style={{ height: 350 }} 
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="状态详情" bordered={false}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Space>
                            <div style={{ width: 12, height: 12, background: '#52c41a', borderRadius: '50%' }} />
                            <Text>运作中</Text>
                          </Space>
                          <Text strong>{companyData.operatingCount} 只</Text>
                        </div>
                        <Progress percent={Math.round((companyData.operatingCount / companyData.totalProducts) * 100)} strokeColor="#52c41a" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Space>
                            <div style={{ width: 12, height: 12, background: '#faad14', borderRadius: '50%' }} />
                            <Text>待发售</Text>
                          </Space>
                          <Text strong>{companyData.pendingCount} 只</Text>
                        </div>
                        <Progress percent={Math.round((companyData.pendingCount / companyData.totalProducts) * 100)} strokeColor="#faad14" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Space>
                            <div style={{ width: 12, height: 12, background: '#1890ff', borderRadius: '50%' }} />
                            <Text>上报中</Text>
                          </Space>
                          <Text strong>{companyData.reportingCount} 只</Text>
                        </div>
                        <Progress percent={Math.round((companyData.reportingCount / companyData.totalProducts) * 100)} strokeColor="#1890ff" />
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default CompanyView;
