import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import './App.css'

function App() {
  // 表单状态
  const [principal, setPrincipal] = useState(100000)
  const [annualRate, setAnnualRate] = useState(3.5)
  const [years, setYears] = useState(5)
  const [calcType, setCalcType] = useState('compound') // compound 或 simple
  
  // 对比产品
  const [compareProducts, setCompareProducts] = useState([
    { name: '银行定期', rate: 2.5, color: '#8884d8' },
    { name: '货币基金', rate: 2.0, color: '#82ca9d' },
    { name: '债券基金', rate: 4.0, color: '#ffc658' },
  ])
  const [newProductName, setNewProductName] = useState('')
  const [newProductRate, setNewProductRate] = useState('')

  // 计算收益
  const calculateReturns = (p, r, y, type) => {
    const rate = r / 100
    if (type === 'simple') {
      // 单利计算
      const interest = p * rate * y
      return {
        total: p + interest,
        interest: interest,
        data: Array.from({ length: y + 1 }, (_, i) => ({
          year: i,
          amount: p + p * rate * i,
          principal: p,
          interest: p * rate * i
        }))
      }
    } else {
      // 复利计算
      const total = p * Math.pow(1 + rate, y)
      return {
        total: total,
        interest: total - p,
        data: Array.from({ length: y + 1 }, (_, i) => {
          const amount = p * Math.pow(1 + rate, i)
          return {
            year: i,
            amount: amount,
            principal: p,
            interest: amount - p
          }
        })
      }
    }
  }

  // 当前产品计算结果
  const currentResult = useMemo(() => {
    return calculateReturns(principal, annualRate, years, calcType)
  }, [principal, annualRate, years, calcType])

  // 对比数据
  const comparisonData = useMemo(() => {
    const allProducts = [
      { name: '当前产品', rate: annualRate },
      ...compareProducts
    ]
    
    return Array.from({ length: years + 1 }, (_, year) => {
      const dataPoint = { year }
      allProducts.forEach(product => {
        const result = calculateReturns(principal, product.rate, year, calcType)
        dataPoint[product.name] = Math.round(result.total)
      })
      return dataPoint
    })
  }, [principal, annualRate, years, calcType, compareProducts])

  // 添加对比产品
  const addProduct = () => {
    if (newProductName && newProductRate) {
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28']
      setCompareProducts([...compareProducts, {
        name: newProductName,
        rate: parseFloat(newProductRate),
        color: colors[compareProducts.length % colors.length]
      }])
      setNewProductName('')
      setNewProductRate('')
    }
  }

  // 删除对比产品
  const removeProduct = (index) => {
    setCompareProducts(compareProducts.filter((_, i) => i !== index))
  }

  // 格式化金额
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="calculator-container">
      <header className="header">
        <h1>💰 理财产品收益计算器</h1>
        <p>智能计算单利/复利收益，多产品对比分析</p>
      </header>

      <div className="main-content">
        {/* 左侧输入区域 */}
        <div className="input-section">
          <div className="card">
            <h2>📊 投资参数</h2>
            
            <div className="form-group">
              <label>投资本金 (元)</label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                min="0"
                step="1000"
              />
              <input
                type="range"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                min="10000"
                max="10000000"
                step="10000"
              />
            </div>

            <div className="form-group">
              <label>年化收益率 (%)</label>
              <input
                type="number"
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                min="0"
                max="50"
                step="0.1"
              />
              <input
                type="range"
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                min="0"
                max="20"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>投资期限 (年)</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                min="1"
                max="50"
              />
              <input
                type="range"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                min="1"
                max="30"
              />
            </div>

            <div className="form-group">
              <label>计算方式</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="compound"
                    checked={calcType === 'compound'}
                    onChange={(e) => setCalcType(e.target.value)}
                  />
                  复利 (利滚利)
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="simple"
                    checked={calcType === 'simple'}
                    onChange={(e) => setCalcType(e.target.value)}
                  />
                  单利
                </label>
              </div>
            </div>
          </div>

          {/* 添加对比产品 */}
          <div className="card">
            <h2>📈 添加对比产品</h2>
            <div className="add-product-form">
              <input
                type="text"
                placeholder="产品名称"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
              <input
                type="number"
                placeholder="年化收益率(%)"
                value={newProductRate}
                onChange={(e) => setNewProductRate(e.target.value)}
                min="0"
                max="100"
                step="0.1"
              />
              <button onClick={addProduct} className="btn-primary">添加</button>
            </div>
            
            <div className="product-list">
              {compareProducts.map((product, index) => (
                <div key={index} className="product-tag" style={{ borderColor: product.color }}>
                  <span>{product.name} ({product.rate}%)</span>
                  <button onClick={() => removeProduct(index)} className="btn-remove">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧结果区域 */}
        <div className="result-section">
          {/* 关键指标卡片 */}
          <div className="summary-cards">
            <div className="summary-card principal">
              <h3>投资本金</h3>
              <p className="amount">{formatMoney(principal)}</p>
            </div>
            <div className="summary-card interest">
              <h3>预计收益</h3>
              <p className="amount">{formatMoney(currentResult.interest)}</p>
            </div>
            <div className="summary-card total">
              <h3>到期总额</h3>
              <p className="amount">{formatMoney(currentResult.total)}</p>
            </div>
            <div className="summary-card rate">
              <h3>收益倍数</h3>
              <p className="amount">{(currentResult.total / principal).toFixed(2)}x</p>
            </div>
          </div>

          {/* 收益趋势图 */}
          <div className="card chart-card">
            <h2>📈 收益增长趋势</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentResult.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: '年份', position: 'insideBottom', offset: -5 }} />
                <YAxis tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`} />
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Legend />
                <Line type="monotone" dataKey="principal" name="本金" stroke="#82ca9d" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="amount" name="本息合计" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="interest" name="累计收益" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 产品对比图 */}
          <div className="card chart-card">
            <h2>📊 多产品收益对比</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: '年份', position: 'insideBottom', offset: -5 }} />
                <YAxis tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`} />
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Legend />
                <Line type="monotone" dataKey="当前产品" stroke="#ff7300" strokeWidth={3} />
                {compareProducts.map((product, index) => (
                  <Line
                    key={index}
                    type="monotone"
                    dataKey={product.name}
                    stroke={product.color}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 详细数据表 */}
          <div className="card">
            <h2>📋 年度收益明细</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>年份</th>
                    <th>本金</th>
                    <th>累计收益</th>
                    <th>本息合计</th>
                    <th>当年收益</th>
                  </tr>
                </thead>
                <tbody>
                  {currentResult.data.map((row, index) => (
                    <tr key={index}>
                      <td>第{row.year}年</td>
                      <td>{formatMoney(row.principal)}</td>
                      <td className="highlight">{formatMoney(row.interest)}</td>
                      <td className="highlight-total">{formatMoney(row.amount)}</td>
                      <td>
                        {index > 0 
                          ? formatMoney(row.interest - currentResult.data[index - 1].interest)
                          : '¥0.00'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
