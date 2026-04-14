import React from 'react';
import { Table, Tag, Button, Popconfirm } from 'antd';
import { DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { StockData } from '../types/stock';
import type { ColumnsType } from 'antd/es/table';

interface StockTableProps {
  data: StockData[];
  loading: boolean;
  selectedCode: string | null;
  onSelectStock: (code: string) => void;
  onDeleteStock: (code: string) => void;
}

const StockTable: React.FC<StockTableProps> = ({ 
  data, 
  loading, 
  selectedCode, 
  onSelectStock,
  onDeleteStock
}) => {
  
  const columns: ColumnsType<StockData> = [
    {
      title: '股票代码',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      render: (code: string, record: StockData) => (
        <div>
          <div style={{ fontWeight: 700, color: '#1e3c72', fontSize: '13px' }}>
            {code.toUpperCase()}
          </div>
          <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: '2px' }}>
            {record.name}
          </div>
        </div>
      ),
    },
    {
      title: '最新价',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      width: 90,
      render: (price: number | null, record: StockData) => {
        const changePercent = record.changePercent || 0;
        const priceColor = changePercent > 0 ? '#f5222d' : changePercent < 0 ? '#52c41a' : '#1a1a1a';
        
        return (
          <span style={{ fontWeight: 700, fontSize: '15px', color: priceColor }}>
            {price?.toFixed(2) || '-'}
          </span>
        );
      },
    },
    {
      title: '涨跌幅',
      dataIndex: 'changePercent',
      key: 'changePercent',
      width: 100,
      render: (percent: number | null) => {
        if (percent === null) return '-';
        const isPositive = percent > 0;
        const isNegative = percent < 0;
        
        return (
          <span style={{
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: '6px',
            background: isPositive ? 'rgba(245, 34, 45, 0.1)' : isNegative ? 'rgba(82, 196, 26, 0.1)' : '#f5f5f5',
            fontWeight: 700,
            fontSize: '13px',
            color: isPositive ? '#f5222d' : isNegative ? '#52c41a' : '#8c8c8c'
          }}>
            {isPositive ? '↑' : isNegative ? '↓' : ''}{isPositive ? '+' : ''}{percent.toFixed(2)}%
          </span>
        );
      },
    },
    {
      title: '开盘',
      dataIndex: 'openPrice',
      key: 'openPrice',
      width: 80,
      render: (price: number | null) => (
        <span style={{ fontWeight: 600, color: '#595959' }}>
          {price?.toFixed(2) || '-'}
        </span>
      ),
    },
    {
      title: '最高',
      dataIndex: 'highPrice',
      key: 'highPrice',
      width: 80,
      render: (price: number | null) => (
        <span style={{ fontWeight: 600, color: '#f5222d' }}>
          {price?.toFixed(2) || '-'}
        </span>
      ),
    },
    {
      title: '最低',
      dataIndex: 'lowPrice',
      key: 'lowPrice',
      width: 80,
      render: (price: number | null) => (
        <span style={{ fontWeight: 600, color: '#52c41a' }}>
          {price?.toFixed(2) || '-'}
        </span>
      ),
    },
    {
      title: '成交量',
      dataIndex: 'volume',
      key: 'volume',
      width: 90,
      render: (volume: number | null) => {
        if (volume === null) return '-';
        return (
          <span style={{ fontWeight: 600, color: '#595959' }}>
            {volume > 10000 ? `${(volume / 10000).toFixed(1)}万` : `${volume}`}
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      fixed: 'right' as const,
      render: (_: any, record: StockData) => (
        <Popconfirm
          title="确认删除"
          description={`确定要删除 ${record.name}(${record.code}) 吗?`}
          onConfirm={(e) => {
            e?.stopPropagation();
            onDeleteStock(record.code);
          }}
          onCancel={(e) => e?.stopPropagation()}
          okText="确定"
          cancelText="取消"
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden'
    }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="code"
        loading={loading}
        pagination={false}
        size="middle"
        scroll={{ x: 800 }}
        className="modern-stock-table"
        onRow={(record) => ({
          onClick: () => onSelectStock(record.code),
          className: selectedCode === record.code ? 'row-selected' : '',
          style: {
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          },
        })}
      />
    </div>
  );
};

export default StockTable;
