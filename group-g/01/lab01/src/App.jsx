import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'

const API_BASE_URL = '/api'

// 模拟股票数据（实际项目中应从交易所API获取）
const MOCK_STOCKS = [
  { code: '600000', name: '浦发银行', exchange: 'sh', price: 7.85, change: 0.12, changePercent: 1.55, volume: 1250000, high: 7.92, low: 7.78, open: 7.80 },
  { code: '600519', name: '贵州茅台', exchange: 'sh', price: 1680.50, change: -12.30, changePercent: -0.73, volume: 85000, high: 1695.00, low: 1675.20, open: 1690.00 },
  { code: '601318', name: '中国平安', exchange: 'sh', price: 45.68, change: 0.85, changePercent: 1.90, volume: 2100000, high: 46.20, low: 45.30, open: 45.40 },
  { code: '600036', name: '招商银行', exchange: 'sh', price: 32.15, change: 0.45, changePercent: 1.42, volume: 1800000, high: 32.50, low: 31.90, open: 31.95 },
  { code: '601012', name: '隆基绿能', exchange: 'sh', price: 22.38, change: -0.62, changePercent: -2.70, volume: 3500000, high: 23.10, low: 22.20, open: 23.00 },
  { code: '000001', name: '平安银行', exchange: 'sz', price: 11.25, change: 0.18, changePercent: 1.63, volume: 2800000, high: 11.38, low: 11.15, open: 11.18 },
  { code: '000858', name: '五粮液', exchange: 'sz', price: 145.80, change: 2.30, changePercent: 1.60, volume: 420000, high: 147.50, low: 144.20, open: 144.50 },
  { code: '002415', name: '海康威视', exchange: 'sz', price: 32.68, change: -0.45, changePercent: -1.36, volume: 1500000, high: 33.20, low: 32.50, open: 33.10 },
  { code: '300750', name: '宁德时代', exchange: 'sz', price: 198.50, change: 5.20, changePercent: 2.69, volume: 980000, high: 201.00, low: 195.30, open: 196.00 },
  { code: '002594', name: '比亚迪', exchange: 'sz', price: 245.60, change: 8.40, changePercent: 3.54, volume: 750000, high: 248.00, low: 240.20, open: 241.00 },
]

// 生成K线数据
const generateKLineData = (basePrice, days = 30) => {
  const data = []
  let currentPrice = basePrice * 0.9
  const now = new Date()
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    const volatility = 0.03
    const change = (Math.random() - 0.5) * 2 * volatility
    const open = currentPrice
    const close = currentPrice * (1 + change)
    const high = Math.max(open, close) * (1 + Math.random() * 0.02)
    const low = Math.min(open, close) * (1 - Math.random() * 0.02)
    const volume = Math.floor(1000000 + Math.random() * 2000000)
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      volume,
      ma5: 0,
      ma10: 0,
      ma20: 0
    })
    
    currentPrice = close
  }
  
  // 计算均线
  for (let i = 0; i < data.length; i++) {
    if (i >= 4) {
      let sum5 = 0
      for (let j = i - 4; j <= i; j++) sum5 += data[j].close
      data[i].ma5 = parseFloat((sum5 / 5).toFixed(2))
    }
    if (i >= 9) {
      let sum10 = 0
      for (let j = i - 9; j <= i; j++) sum10 += data[j].close
      data[i].ma10 = parseFloat((sum10 / 10).toFixed(2))
    }
    if (i >= 19) {
      let sum20 = 0
      for (let j = i - 19; j <= i; j++) sum20 += data[j].close
      data[i].ma20 = parseFloat((sum20 / 20).toFixed(2))
    }
  }
  
  return data
}

// 计算技术指标
const calculateIndicators = (data) => {
  const closes = data.map(d => d.close)
  const n = closes.length
  
  // 简单移动平均线 SMA
  const sma = (period) => {
    const result = []
    for (let i = period - 1; i < n; i++) {
      let sum = 0
      for (let j = i - period + 1; j <= i; j++) sum += closes[j]
      result.push(sum / period)
    }
    return result
  }
  
  // RSI
  const calculateRSI = (period = 14) => {
    if (n < period + 1) return 50
    let gains = 0, losses = 0
    for (let i = 1; i <= period; i++) {
      const change = closes[n - i] - closes[n - i - 1]
      if (change > 0) gains += change
      else losses -= change
    }
    const avgGain = gains / period
    const avgLoss = losses / period
    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }
  
  // MACD
  const calculateMACD = () => {
    const ema12 = calculateEMA(closes, 12)
    const ema26 = calculateEMA(closes, 26)
    const dif = ema12[ema12.length - 1] - ema26[ema26.length - 1]
    return { dif: parseFloat(dif.toFixed(2)), signal: parseFloat((dif * 0.9).toFixed(2)) }
  }
  
  // 布林带
  const calculateBollinger = (period = 20) => {
    if (n < period) return { upper: closes[n-1] * 1.02, middle: closes[n-1], lower: closes[n-1] * 0.98 }
    const sma20 = sma(period)
    const middle = sma20[sma20.length - 1]
    let sumSquared = 0
    for (let i = n - period; i < n; i++) {
      sumSquared += Math.pow(closes[i] - middle, 2)
    }
    const stdDev = Math.sqrt(sumSquared / period)
    return {
      upper: parseFloat((middle + 2 * stdDev).toFixed(2)),
      middle: parseFloat(middle.toFixed(2)),
      lower: parseFloat((middle - 2 * stdDev).toFixed(2))
    }
  }
  
  const rsi = calculateRSI()
  const macd = calculateMACD()
  const bollinger = calculateBollinger()
  
  // 趋势判断
  const recentPrices = closes.slice(-10)
  const trend = recentPrices[recentPrices.length - 1] > recentPrices[0] ? 'up' : 'down'
  
  // 生成建议
  let recommendation = 'hold'
  let recommendationText = '观望'
  
  if (rsi < 30 && macd.dif > macd.signal) {
    recommendation = 'buy'
    recommendationText = '买入信号'
  } else if (rsi > 70 && macd.dif < macd.signal) {
    recommendation = 'sell'
    recommendationText = '卖出信号'
  }
  
  return {
    rsi: parseFloat(rsi.toFixed(2)),
    macd,
    bollinger,
    trend,
    recommendation,
    recommendationText,
    support: parseFloat((Math.min(...closes.slice(-20)) * 0.98).toFixed(2)),
    resistance: parseFloat((Math.max(...closes.slice(-20)) * 1.02).toFixed(2))
  }
}

const calculateEMA = (data, period) => {
  const k = 2 / (period + 1)
  const ema = [data[0]]
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k))
  }
  return ema
}

function App() {
  const [stocks, setStocks] = useState(MOCK_STOCKS)
  const [selectedStock, setSelectedStock] = useState(null)
  const [klineData, setKlineData] = useState([])
  const [indicators, setIndicators] = useState(null)
  const [searchCode, setSearchCode] = useState('')
  const [activeExchange, setActiveExchange] = useState('all')
  const [timeRange, setTimeRange] = useState('1M')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 获取行情数据
  const fetchMarketData = useCallback(async () => {
    setLoading(true)
    try {
      // 实际项目中应该调用交易所API
      // const response = await axios.get(`${API_BASE_URL}/market-data`)
      // setStocks(response.data)
      
      // 模拟数据更新
      setStocks(prev => prev.map(stock => {
        const change = (Math.random() - 0.5) * 0.02
        const newPrice = stock.price * (1 + change)
        const priceChange = newPrice - stock.price
        return {
          ...stock,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat(priceChange.toFixed(2)),
          changePercent: parseFloat((priceChange / stock.price * 100).toFixed(2))
        }
      }))
      setError(null)
    } catch (err) {
      setError('获取行情数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 选择股票
  const handleSelectStock = useCallback((stock) => {
    setSelectedStock(stock)
    const days = timeRange === '1W' ? 7 : timeRange === '1M' ? 30 : timeRange === '3M' ? 90 : 180
    const data = generateKLineData(stock.price, days)
    setKlineData(data)
    setIndicators(calculateIndicators(data))
  }, [timeRange])

  // 搜索股票
  const handleSearch = useCallback(() => {
    if (!searchCode) return
    const found = stocks.find(s => s.code.includes(searchCode) || s.name.includes(searchCode))
    if (found) {
      handleSelectStock(found)
    }
  }, [searchCode, stocks, handleSelectStock])

  // 过滤股票
  const filteredStocks = stocks.filter(stock => {
    if (activeExchange === 'all') return true
    return stock.exchange === activeExchange
  })

  // 定时刷新
  useEffect(() => {
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 5000)
    return () => clearInterval(interval)
  }, [fetchMarketData])

  // 时间范围变化时更新图表
  useEffect(() => {
    if (selectedStock) {
      handleSelectStock(selectedStock)
    }
  }, [timeRange, selectedStock, handleSelectStock])

  const getPriceClass = (change) => {
    if (change > 0) return 'price-up'
    if (change < 0) return 'price-down'
    return 'price-neutral'
  }

  const getChangeClass = (change) => {
    if (change > 0) return 'change-up'
    if (change < 0) return 'change-down'
    return 'change-neutral'
  }

  return (
    <div className="app">
      <header className="header">
        <h1>市场行情分析工具</h1>
        <p>实时获取上交所、深交所行情数据</p>
      </header>

      <div className="container">
        {/* 搜索区域 */}
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="输入股票代码或名称..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch} disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : '搜索'}
            </button>
          </div>
          <div className="exchange-tabs">
            <button
              className={`tab-btn ${activeExchange === 'all' ? 'active' : ''}`}
              onClick={() => setActiveExchange('all')}
            >
              全部
            </button>
            <button
              className={`tab-btn ${activeExchange === 'sh' ? 'active' : ''}`}
              onClick={() => setActiveExchange('sh')}
            >
              上交所
            </button>
            <button
              className={`tab-btn ${activeExchange === 'sz' ? 'active' : ''}`}
              onClick={() => setActiveExchange('sz')}
            >
              深交所
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && <div className="error">{error}</div>}

        {/* 行情列表 */}
        <div className="market-grid">
          {filteredStocks.map(stock => (
            <div
              key={stock.code}
              className={`market-card ${selectedStock?.code === stock.code ? 'selected' : ''}`}
              onClick={() => handleSelectStock(stock)}
            >
              <div className="stock-header">
                <span className="stock-name">{stock.name}</span>
                <span className="stock-code">{stock.code}</span>
              </div>
              <div className={`stock-price ${getPriceClass(stock.change)}`}>
                ¥{stock.price.toFixed(2)}
              </div>
              <div className="stock-change">
                <span className={`change-percent ${getChangeClass(stock.change)}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                </span>
                <span className={`change-percent ${getChangeClass(stock.change)}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="stock-info">
                <div className="info-item">
                  <span className="info-label">最高</span>
                  <span className="info-value">{stock.high.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">最低</span>
                  <span className="info-value">{stock.low.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">开盘</span>
                  <span className="info-value">{stock.open.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">成交量</span>
                  <span className="info-value">{(stock.volume / 10000).toFixed(1)}万</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 图表区域 */}
        {selectedStock && klineData.length > 0 && (
          <>
            <div className="chart-section">
              <div className="chart-header">
                <h3 className="chart-title">
                  {selectedStock.name} ({selectedStock.code}) - 价格走势
                </h3>
                <div className="time-range-tabs">
                  {['1W', '1M', '3M', '6M'].map(range => (
                    <button
                      key={range}
                      className={`time-tab ${timeRange === range ? 'active' : ''}`}
                      onClick={() => setTimeRange(range)}
                    >
                      {range === '1W' ? '1周' : range === '1M' ? '1月' : range === '3M' ? '3月' : '6月'}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={klineData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2a5298" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2a5298" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 12}}
                    tickFormatter={(value) => value.slice(5)}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{fontSize: 12}}
                    tickFormatter={(value) => value.toFixed(2)}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}
                    formatter={(value) => value.toFixed(2)}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="close" 
                    name="收盘价" 
                    stroke="#2a5298" 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    strokeWidth={2}
                  />
                  <Line type="monotone" dataKey="ma5" name="MA5" stroke="#ff9800" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="ma10" name="MA10" stroke="#4caf50" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="ma20" name="MA20" stroke="#f44336" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 成交量图表 */}
            <div className="chart-section">
              <h3 className="chart-title">成交量</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={klineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 12}}
                    tickFormatter={(value) => value.slice(5)}
                  />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}
                    formatter={(value) => (value / 10000).toFixed(1) + '万'}
                  />
                  <Bar 
                    dataKey="volume" 
                    name="成交量" 
                    fill="#2a5298"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 分析结果 */}
            {indicators && (
              <div className="analysis-section">
                <h3 className="analysis-title">技术分析</h3>
                <div className="analysis-grid">
                  <div className="analysis-card">
                    <h4>RSI (相对强弱指标)</h4>
                    <div className="value">{indicators.rsi}</div>
                    <div className={`trend ${indicators.rsi > 70 ? 'trend-up' : indicators.rsi < 30 ? 'trend-down' : ''}`}>
                      {indicators.rsi > 70 ? '超买' : indicators.rsi < 30 ? '超卖' : '中性'}
                    </div>
                  </div>
                  <div className="analysis-card">
                    <h4>MACD</h4>
                    <div className="value">{indicators.macd.dif}</div>
                    <div className={`trend ${indicators.macd.dif > indicators.macd.signal ? 'trend-up' : 'trend-down'}`}>
                      信号线: {indicators.macd.signal}
                    </div>
                  </div>
                  <div className="analysis-card">
                    <h4>布林带</h4>
                    <div className="value">{indicators.bollinger.middle}</div>
                    <div className="trend">
                      上轨: {indicators.bollinger.upper} / 下轨: {indicators.bollinger.lower}
                    </div>
                  </div>
                  <div className="analysis-card">
                    <h4>支撑位 / 阻力位</h4>
                    <div className="value">{indicators.support} / {indicators.resistance}</div>
                    <div className={`trend ${indicators.trend === 'up' ? 'trend-up' : 'trend-down'}`}>
                      趋势: {indicators.trend === 'up' ? '上涨' : '下跌'}
                    </div>
                  </div>
                </div>
                <div className={`recommendation ${indicators.recommendation}`}>
                  操作建议: {indicators.recommendationText}
                </div>
              </div>
            )}
          </>
        )}

        {!selectedStock && (
          <div className="no-data">
            <div className="no-data-icon">📊</div>
            <p>请选择一只股票查看详细行情和分析</p>
          </div>
        )}

        {/* 状态栏 */}
        <div className="status-bar">
          <div>
            <span className="status-indicator status-online"></span>
            数据实时更新中
          </div>
          <div>最后更新: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  )
}

export default App
