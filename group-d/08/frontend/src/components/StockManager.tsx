import React, { useState } from 'react';
import { Input, Button, Space, message, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';

interface StockManagerProps {
  stockCodes: string[];
  onChange: (codes: string[]) => void;
  onDeleteStock?: (code: string) => void;
}

const StockManager: React.FC<StockManagerProps> = ({ stockCodes, onChange, onDeleteStock }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // 添加股票代码
  const handleAddStock = () => {
    const code = inputValue.trim().toLowerCase();
    
    if (!code) {
      message.warning('请输入股票代码');
      return;
    }

    // 验证格式(支持sh和sz开头)
    if (!/^(sh|sz)\d{6}$/.test(code)) {
      message.error('股票代码格式错误,例如: sh600000 或 sz002603');
      return;
    }

    if (stockCodes.includes(code)) {
      message.warning('该股票已存在');
      return;
    }

    const newCodes = [...stockCodes, code];
    onChange(newCodes);
    localStorage.setItem('stockCodes', JSON.stringify(newCodes));
    setInputValue('');
    message.success('添加成功');
  };

  // 删除股票代码
  const handleDeleteStock = (code: string) => {
    if (onDeleteStock) {
      onDeleteStock(code);
    } else {
      const newCodes = stockCodes.filter(c => c !== code);
      onChange(newCodes);
      localStorage.setItem('stockCodes', JSON.stringify(newCodes));
      message.success('已删除');
    }
  };

  // 回车添加
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddStock();
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '12px 20px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      marginBottom: '16px'
    }}>
      {/* 输入框 */}
      <div style={{ 
        position: 'relative'
      }}>
        <Input
          placeholder="输入股票代码，如 sh600000"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          prefix={<SearchOutlined style={{ color: isFocused ? '#1e3c72' : '#bfbfbf', transition: 'all 0.3s' }} />}
          size="large"
          style={{
            borderRadius: '12px',
            border: isFocused ? '2px solid #1e3c72' : '2px solid #e8e8e8',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isFocused ? '0 0 0 4px rgba(30, 60, 114, 0.1)' : 'none',
            fontSize: '14px',
            padding: '8px 12px'
          }}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddStock}
          size="large"
          style={{
            position: 'absolute',
            right: '6px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            border: 'none',
            boxShadow: '0 2px 8px rgba(30, 60, 114, 0.3)',
            height: '36px',
            padding: '0 16px',
            fontWeight: 600
          }}
        >
          添加
        </Button>
      </div>

      {/* 已添加的股票标签 */}
      {stockCodes.length > 0 && (
        <div style={{ display: 'none' }}>
          <div style={{ 
            fontSize: '13px', 
            color: '#8c8c8c', 
            marginBottom: '8px',
            fontWeight: 500
          }}>
            我的自选:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {stockCodes.map((code) => (
              <Tag
                key={code}
                closable
                onClose={() => handleDeleteStock(code)}
                style={{
                  margin: 0,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, rgba(30, 60, 114, 0.08) 0%, rgba(42, 82, 152, 0.08) 100%)',
                  border: '1px solid rgba(30, 60, 114, 0.2)',
                  color: '#1e3c72',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                closeIcon={<DeleteOutlined style={{ fontSize: '12px' }} />}
              >
                {code.toUpperCase()}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* 提示文字 */}
      <div style={{ 
        marginTop: '12px',
        fontSize: '12px', 
        color: '#bfbfbf',
        textAlign: 'center',
        display: 'none'
      }}>
        支持沪深A股 • 按回车快速添加
      </div>
    </div>
  );
};

export default StockManager;
