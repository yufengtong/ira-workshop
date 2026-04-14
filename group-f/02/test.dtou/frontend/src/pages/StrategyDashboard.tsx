import { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Tag, 
  Spin, 
  Alert,
  Typography,
  List,
  Space,
  Badge,
  Tooltip,
  Button,
  message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, TrophyOutlined, AimOutlined, RiseOutlined } from '@ant-design/icons';
import { analysisApi, syncApi } from '../services/api';
import type { MarketGapDTO, BestPracticeDTO } from '../types';
import ScoreRing from '../components/ScoreRing';
import StrategyTag from '../components/StrategyTag';

const { Title, Text, Paragraph } = Typography;

const StrategyDashboard = () => {
  const [marketGaps, setMarketGaps] = useState<MarketGapDTO[]>([]);
  const [bestPractices, setBestPractices] = useState<BestPracticeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gapsRes, practicesRes] = await Promise.all([
        analysisApi.getMarketGaps(),
        analysisApi.getBestPractices(),
      ]);
      setMarketGaps(gapsRes.data);
      setBestPractices(practicesRes.data);
      setError(null);
    } catch (err) {
      setError('数据加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncApi.syncAll();
      message.success('数据同步任务已启动');
      setTimeout(fetchData, 3000);
    } catch (err) {
      message.error('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  const gapColumns: ColumnsType<MarketGapDTO> = [
    {
      title: '行业名称',
      dataIndex: 'industryName',
      key: 'industryName',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '现有产品',
      dataIndex: 'currentProducts',
      key: 'currentProducts',
      render: (value) => <Tag color="default">{value} 只</Tag>,
    },
    {
      title: '潜在需求',
      dataIndex: 'potentialDemand',
      key: 'potentialDemand',
      render: (value) => <Tag color="blue">{value} 只</Tag>,
    },
    {
      title: '机会评分',
      dataIndex: 'opportunityScore',
      key: 'opportunityScore',
      sorter: (a, b) => a.opportunityScore - b.opportunityScore,
      render: (value) => (
        <ScoreRing score={value} title="" size="small" />
      ),
    },
    {
      title: '建议',
      dataIndex: 'recommendation',
      key: 'recommendation',
      render: (text, record) => {
        const color = record.opportunityScore > 80 ? 'green' : 
                      record.opportunityScore > 50 ? 'blue' : 'orange';
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  const practiceColumns: ColumnsType<BestPracticeDTO> = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, index) => (
        <Badge
          count={index + 1}
          style={{
            backgroundColor: index < 3 ? '#ffd700' : '#d9d9d9',
            color: index < 3 ? '#000' : '#666',
          }}
        />
      ),
    },
    {
      title: '公司名称',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '战略类型',
      dataIndex: 'strategyType',
      key: 'strategyType',
      render: (type) => <StrategyTag type={type} />,
    },
    {
      title: '亮点',
      dataIndex: 'highlight',
      key: 'highlight',
      ellipsis: true,
    },
    {
      title: '综合评分',
      dataIndex: 'performanceScore',
      key: 'performanceScore',
      sorter: (a, b) => a.performanceScore - b.performanceScore,
      render: (value) => (
        <ScoreRing score={value} title="" size="small" />
      ),
    },
    {
      title: '核心优势',
      dataIndex: 'keyStrengths',
      key: 'keyStrengths',
      render: (strengths) => (
        <Space size="small" wrap>
          {strengths?.slice(0, 3).map((s: string) => (
            <Tag key={s} color="green">{s}</Tag>
          ))}
        </Space>
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
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h2 style={{ margin: 0 }}>战略分析看板</h2>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<ReloadOutlined spin={syncing} />}
            onClick={handleSync}
            loading={syncing}
          >
            同步数据
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Space>
              <AimOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <div>
                <Text type="secondary">市场空白点</Text>
                <Title level={3} style={{ margin: 0 }}>{marketGaps.length} 个</Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Space>
              <TrophyOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <div>
                <Text type="secondary">优秀案例</Text>
                <Title level={3} style={{ margin: 0 }}>{bestPractices.length} 家</Title>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Space>
              <RiseOutlined style={{ fontSize: 32, color: '#faad14' }} />
              <div>
                <Text type="secondary">平均机会评分</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {marketGaps.length > 0 
                    ? (marketGaps.reduce((sum, g) => sum + g.opportunityScore, 0) / marketGaps.length).toFixed(1)
                    : 0} 分
                </Title>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title={<><AimOutlined /> 市场空白点分析</>} 
            bordered={false}
            style={{ marginBottom: 16 }}
          >
            <Paragraph type="secondary">
              基于当前市场产品分布情况，识别出产品布局相对不足的行业领域，为产品规划提供参考。
            </Paragraph>
            <Table
              columns={gapColumns}
              dataSource={marketGaps}
              rowKey="industryCode"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={<><TrophyOutlined /> 优秀战略案例</>} 
            bordered={false}
            style={{ marginBottom: 16 }}
          >
            <Paragraph type="secondary">
              分析各基金公司战略布局特点，识别出战略布局优秀、差异化明显的公司案例。
            </Paragraph>
            <Table
              columns={practiceColumns}
              dataSource={bestPractices}
              rowKey="companyCode"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Card title="战略洞察与建议" bordered={false}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card type="inner" title="机会领域" bordered={false}>
              <List
                size="small"
                dataSource={marketGaps.slice(0, 5)}
                renderItem={(item, index) => (
                  <List.Item>
                    <Space>
                      <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                      <Text strong>{item.industryName}</Text>
                      <Tag color="green">{item.opportunityScore.toFixed(0)}分</Tag>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card type="inner" title="值得学习的公司" bordered={false}>
              <List
                size="small"
                dataSource={bestPractices.slice(0, 5)}
                renderItem={(item, index) => (
                  <List.Item>
                    <Space>
                      <Badge count={index + 1} style={{ backgroundColor: '#52c41a' }} />
                      <Text strong>{item.companyName}</Text>
                      <StrategyTag type={item.strategyType} />
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card type="inner" title="战略建议" bordered={false}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message="聚焦战略"
                  description="建议关注聚焦型公司的发展路径，在特定领域建立竞争优势。"
                  type="info"
                  showIcon
                />
                <Alert
                  message="均衡布局"
                  description="保持产品线的完整性，覆盖主流投资领域。"
                  type="success"
                  showIcon
                />
                <Alert
                  message="创新突破"
                  description="关注新兴领域机会，如REITs、养老目标基金等。"
                  type="warning"
                  showIcon
                />
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default StrategyDashboard;
