import { Layout as AntLayout, Menu, Typography, Space, Badge } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChartOutlined, 
  BankOutlined, 
  RadarChartOutlined,
  FundOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = AntLayout;
const { Title, Text } = Typography;

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    {
      key: '/industry',
      icon: <BarChartOutlined />,
      label: '行业视图',
    },
    {
      key: '/company',
      icon: <BankOutlined />,
      label: '公司视图',
    },
    {
      key: '/strategy',
      icon: <RadarChartOutlined />,
      label: '战略分析',
    },
  ];
  
  const selectedKey = location.pathname === '/' ? '/industry' : location.pathname;
  
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#001529', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        <Space>
          <FundOutlined style={{ fontSize: 28, color: '#1890ff' }} />
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            南方基金 · 产品布局战略系统
          </Title>
        </Space>
        <Space>
          <Badge status="success" text="系统运行中" />
          <Text style={{ color: 'rgba(255,255,255,0.65)' }}>
            产品开发部战略分析平台
          </Text>
        </Space>
      </Header>
      
      <AntLayout>
        <Sider 
          width={200} 
          style={{ background: '#fff' }}
          breakpoint="lg"
          collapsedWidth="0"
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        
        <Content style={{ 
          margin: 0, 
          padding: 0, 
          background: '#f0f2f5',
          minHeight: 280 
        }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
