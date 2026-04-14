import express from 'express'
import cors from 'cors'
import cron from 'node-cron'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// 模拟股票数据
let stockData = [
  { code: '600000', name: '浦发银行', exchange: 'sh', price: 7.85, change: 0.12, changePercent: 1.55, volume: 1250000, high: 7.92, low: 7.78, open: 7.80, marketCap: '2300亿', pe: 4.5, pb: 0.45 },
  { code: '600519', name: '贵州茅台', exchange: 'sh', price: 1680.50, change: -12.30, changePercent: -0.73, volume: 85000, high: 1695.00, low: 1675.20, open: 1690.00, marketCap: '2.1万亿', pe: 28.5, pb: 8.2 },
  { code: '601318', name: '中国平安', exchange: 'sh', price: 45.68, change: 0.85, changePercent: 1.90, volume: 2100000, high: 46.20, low: 45.30, open: 45.40, marketCap: '8300亿', pe: 8.5, pb: 0.92 },
  { code: '600036', name: '招商银行', exchange: 'sh', price: 32.15, change: 0.45, changePercent: 1.42, volume: 1800000, high: 32.50, low: 31.90, open: 31.95, marketCap: '8100亿', pe: 5.8, pb: 0.88 },
  { code: '601012', name: '隆基绿能', exchange: 'sh', price: 22.38, change: -0.62, changePercent: -2.70, volume: 3500000, high: 23.10, low: 22.20, open: 23.00, marketCap: '1700亿', pe: 12.5, pb: 2.1 },
  { code: '600276', name: '恒瑞医药', exchange: 'sh', price: 48.50, change: 1.20, changePercent: 2.54, volume: 1200000, high: 49.20, low: 48.10, open: 48.30, marketCap: '3100亿', pe: 65.2, pb: 8.5 },
  { code: '601888', name: '中国中免', exchange: 'sh', price: 85.60, change: -1.50, changePercent: -1.72, volume: 450000, high: 87.50, low: 85.20, open: 87.00, marketCap: '1700亿', pe: 32.5, pb: 3.8 },
  { code: '603288', name: '海天味业', exchange: 'sh', price: 38.90, change: 0.65, changePercent: 1.70, volume: 680000, high: 39.50, low: 38.60, open: 38.80, marketCap: '2200亿', pe: 35.8, pb: 6.2 },
  { code: '600900', name: '长江电力', exchange: 'sh', price: 23.45, change: 0.15, changePercent: 0.64, volume: 2100000, high: 23.60, low: 23.30, open: 23.35, marketCap: '5700亿', pe: 18.5, pb: 2.8 },
  { code: '601398', name: '工商银行', exchange: 'sh', price: 4.85, change: 0.03, changePercent: 0.62, volume: 5200000, high: 4.88, low: 4.82, open: 4.83, marketCap: '1.7万亿', pe: 4.2, pb: 0.52 },
  
  { code: '000001', name: '平安银行', exchange: 'sz', price: 11.25, change: 0.18, changePercent: 1.63, volume: 2800000, high: 11.38, low: 11.15, open: 11.18, marketCap: '2100亿', pe: 4.8, pb: 0.55 },
  { code: '000858', name: '五粮液', exchange: 'sz', price: 145.80, change: 2.30, changePercent: 1.60, volume: 420000, high: 147.50, low: 144.20, open: 144.50, marketCap: '5600亿', pe: 18.5, pb: 4.2 },
  { code: '002415', name: '海康威视', exchange: 'sz', price: 32.68, change: -0.45, changePercent: -1.36, volume: 1500000, high: 33.20, low: 32.50, open: 33.10, marketCap: '3000亿', pe: 22.5, pb: 4.5 },
  { code: '300750', name: '宁德时代', exchange: 'sz', price: 198.50, change: 5.20, changePercent: 2.69, volume: 980000, high: 201.00, low: 195.30, open: 196.00, marketCap: '8700亿', pe: 25.8, pb: 5.2 },
  { code: '002594', name: '比亚迪', exchange: 'sz', price: 245.60, change: 8.40, changePercent: 3.54, volume: 750000, high: 248.00, low: 240.20, open: 241.00, marketCap: '7100亿', pe: 28.5, pb: 4.8 },
  { code: '000333', name: '美的集团', exchange: 'sz', price: 62.50, change: 1.20, changePercent: 1.96, volume: 850000, high: 63.20, low: 62.10, open: 62.30, marketCap: '4300亿', pe: 12.5, pb: 2.8 },
  { code: '002714', name: '牧原股份', exchange: 'sz', price: 42.80, change: -0.85, changePercent: -1.95, volume: 1100000, high: 43.80, low: 42.60, open: 43.50, marketCap: '2300亿', pe: 15.2, pb: 3.2 },
  { code: '300059', name: '东方财富', exchange: 'sz', price: 15.80, change: 0.35, changePercent: 2.27, volume: 3200000, high: 16.10, low: 15.65, open: 15.70, marketCap: '2500亿', pe: 28.5, pb: 3.5 },
  { code: '000568', name: '泸州老窖', exchange: 'sz', price: 178.50, change: 3.20, changePercent: 1.83, volume: 280000, high: 180.00, low: 176.80, open: 177.00, marketCap: '2600亿', pe: 22.5, pb: 5.8 },
  { code: '002230', name: '科大讯飞', exchange: 'sz', price: 52.30, change: 1.80, changePercent: 3.56, volume: 1800000, high: 53.50, low: 51.80, open: 52.00, marketCap: '1200亿', pe: 185.5, pb: 8.2 },
]

// 生成K线历史数据
const generateKLineHistory = (stock, days = 60) => {
  const data = []
  let currentPrice = stock.price * 0.85
  const now = new Date()
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // 跳过周末
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    const volatility = 0.025
    const trend = (stock.price - currentPrice) / days / currentPrice
    const change = (Math.random() - 0.5) * 2 * volatility + trend
    const open = currentPrice
    const close = currentPrice * (1 + change)
    const high = Math.max(open, close) * (1 + Math.random() * 0.015)
    const low = Math.min(open, close) * (1 - Math.random() * 0.015)
    const volume = Math.floor(stock.volume * (0.5 + Math.random()))
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      volume
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
    if (i >= 59) {
      let sum60 = 0
      for (let j = i - 59; j <= i; j++) sum60 += data[j].close
      data[i].ma60 = parseFloat((sum60 / 60).toFixed(2))
    }
  }
  
  return data
}

// 计算技术指标
const calculateIndicators = (data) => {
  const closes = data.map(d => d.close)
  const volumes = data.map(d => d.volume)
  const n = closes.length
  
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
  
  // EMA
  const calculateEMA = (data, period) => {
    const k = 2 / (period + 1)
    const ema = [data[0]]
    for (let i = 1; i < data.length; i++) {
      ema.push(data[i] * k + ema[i - 1] * (1 - k))
    }
    return ema
  }
  
  // MACD
  const calculateMACD = () => {
    const ema12 = calculateEMA(closes, 12)
    const ema26 = calculateEMA(closes, 26)
    const dif = ema12[ema12.length - 1] - ema26[ema26.length - 1]
    const dea = dif * 0.9
    const macd = (dif - dea) * 2
    return { 
      dif: parseFloat(dif.toFixed(3)), 
      dea: parseFloat(dea.toFixed(3)),
      macd: parseFloat(macd.toFixed(3))
    }
  }
  
  // 布林带
  const calculateBollinger = (period = 20) => {
    if (n < period) return { upper: closes[n-1] * 1.02, middle: closes[n-1], lower: closes[n-1] * 0.98 }
    let sum = 0
    for (let i = n - period; i < n; i++) sum += closes[i]
    const middle = sum / period
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
  
  // KDJ
  const calculateKDJ = (period = 9) => {
    if (n < period) return { k: 50, d: 50, j: 50 }
    const recentData = data.slice(-period)
    const lowestLow = Math.min(...recentData.map(d => d.low))
    const highestHigh = Math.max(...recentData.map(d => d.high))
    const currentClose = closes[n - 1]
    const rsv = highestHigh === lowestLow ? 50 : ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100
    
    let k = 50, d = 50
    for (let i = Math.max(0, n - 20); i < n; i++) {
      const periodData = data.slice(Math.max(0, i - period + 1), i + 1)
      const ll = Math.min(...periodData.map(d => d.low))
      const hh = Math.max(...periodData.map(d => d.high))
      const rsv_i = hh === ll ? 50 : ((closes[i] - ll) / (hh - ll)) * 100
      k = (2 / 3) * k + (1 / 3) * rsv_i
      d = (2 / 3) * d + (1 / 3) * k
    }
    const j = 3 * k - 2 * d
    
    return {
      k: parseFloat(k.toFixed(2)),
      d: parseFloat(d.toFixed(2)),
      j: parseFloat(j.toFixed(2))
    }
  }
  
  // 成交量分析
  const volumeMA5 = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5
  const volumeMA10 = volumes.slice(-10).reduce((a, b) => a + b, 0) / 10
  
  const rsi = calculateRSI()
  const macd = calculateMACD()
  const bollinger = calculateBollinger()
  const kdj = calculateKDJ()
  
  // 趋势判断
  const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, closes.length)
  const sma60 = closes.slice(-60).reduce((a, b) => a + b, 0) / Math.min(60, closes.length)
  const trend = closes[closes.length - 1] > sma20 && sma20 > sma60 ? 'strong_up' : 
                closes[closes.length - 1] > sma20 ? 'up' :
                closes[closes.length - 1] < sma20 && sma20 < sma60 ? 'strong_down' : 'down'
  
  // 综合评分
  let score = 50
  if (rsi < 30) score += 10
  if (rsi > 70) score -= 10
  if (macd.dif > macd.dea) score += 10
  if (macd.dif < macd.dea) score -= 10
  if (closes[closes.length - 1] > bollinger.middle) score += 5
  if (kdj.k > kdj.d) score += 10
  if (trend === 'strong_up') score += 15
  if (trend === 'up') score += 5
  if (trend === 'strong_down') score -= 15
  if (trend === 'down') score -= 5
  
  score = Math.max(0, Math.min(100, score))
  
  // 生成建议
  let recommendation, recommendationText, riskLevel
  if (score >= 70) {
    recommendation = 'buy'
    recommendationText = '强烈买入'
    riskLevel = 'low'
  } else if (score >= 55) {
    recommendation = 'buy'
    recommendationText = '买入'
    riskLevel = 'medium'
  } else if (score >= 45) {
    recommendation = 'hold'
    recommendationText = '观望'
    riskLevel = 'medium'
  } else if (score >= 30) {
    recommendation = 'sell'
    recommendationText = '卖出'
    riskLevel = 'medium'
  } else {
    recommendation = 'sell'
    recommendationText = '强烈卖出'
    riskLevel = 'high'
  }
  
  return {
    rsi: parseFloat(rsi.toFixed(2)),
    macd,
    bollinger,
    kdj,
    trend,
    score,
    recommendation,
    recommendationText,
    riskLevel,
    support: parseFloat((Math.min(...closes.slice(-20)) * 0.98).toFixed(2)),
    resistance: parseFloat((Math.max(...closes.slice(-20)) * 1.02).toFixed(2)),
    volumeMA5: Math.floor(volumeMA5),
    volumeMA10: Math.floor(volumeMA10),
    volatility: parseFloat((Math.sqrt(closes.slice(-20).reduce((sum, price, i, arr) => {
      if (i === 0) return 0
      return sum + Math.pow((price - arr[i-1]) / arr[i-1], 2)
    }, 0) / 19) * Math.sqrt(252) * 100).toFixed(2))
  }
}

// 定时更新数据（模拟实时行情）
cron.schedule('*/5 * * * * *', () => {
  stockData = stockData.map(stock => {
    const change = (Math.random() - 0.5) * 0.004
    const newPrice = Math.max(0.01, stock.price * (1 + change))
    const priceChange = newPrice - stock.price
    return {
      ...stock,
      price: parseFloat(newPrice.toFixed(2)),
      change: parseFloat(priceChange.toFixed(2)),
      changePercent: parseFloat((priceChange / stock.price * 100).toFixed(2)),
      high: Math.max(stock.high, newPrice),
      low: Math.min(stock.low, newPrice),
      volume: stock.volume + Math.floor(Math.random() * 1000)
    }
  })
})

// API 路由

// 获取所有股票列表
app.get('/api/stocks', (req, res) => {
  const { exchange } = req.query
  let result = stockData
  if (exchange && exchange !== 'all') {
    result = result.filter(s => s.exchange === exchange)
  }
  res.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString()
  })
})

// 获取单只股票详情
app.get('/api/stocks/:code', (req, res) => {
  const { code } = req.params
  const stock = stockData.find(s => s.code === code)
  if (!stock) {
    return res.status(404).json({ success: false, message: '股票不存在' })
  }
  res.json({
    success: true,
    data: stock,
    timestamp: new Date().toISOString()
  })
})

// 获取K线数据
app.get('/api/stocks/:code/kline', (req, res) => {
  const { code } = req.params
  const { period = '1M' } = req.query
  const stock = stockData.find(s => s.code === code)
  if (!stock) {
    return res.status(404).json({ success: false, message: '股票不存在' })
  }
  
  const days = period === '1W' ? 7 : period === '1M' ? 30 : period === '3M' ? 60 : 120
  const klineData = generateKLineHistory(stock, days)
  
  res.json({
    success: true,
    data: klineData,
    timestamp: new Date().toISOString()
  })
})

// 获取技术指标
app.get('/api/stocks/:code/indicators', (req, res) => {
  const { code } = req.params
  const stock = stockData.find(s => s.code === code)
  if (!stock) {
    return res.status(404).json({ success: false, message: '股票不存在' })
  }
  
  const klineData = generateKLineHistory(stock, 60)
  const indicators = calculateIndicators(klineData)
  
  res.json({
    success: true,
    data: indicators,
    timestamp: new Date().toISOString()
  })
})

// 搜索股票
app.get('/api/search', (req, res) => {
  const { keyword } = req.query
  if (!keyword) {
    return res.json({ success: true, data: [] })
  }
  
  const result = stockData.filter(s => 
    s.code.includes(keyword) || 
    s.name.includes(keyword)
  )
  
  res.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString()
  })
})

// 获取市场概况
app.get('/api/market/overview', (req, res) => {
  const shStocks = stockData.filter(s => s.exchange === 'sh')
  const szStocks = stockData.filter(s => s.exchange === 'sz')
  
  const calcIndex = (stocks) => {
    const totalChange = stocks.reduce((sum, s) => sum + s.changePercent, 0)
    return {
      changePercent: parseFloat((totalChange / stocks.length).toFixed(2)),
      upCount: stocks.filter(s => s.change > 0).length,
      downCount: stocks.filter(s => s.change < 0).length,
      flatCount: stocks.filter(s => s.change === 0).length,
      totalVolume: stocks.reduce((sum, s) => sum + s.volume, 0)
    }
  }
  
  res.json({
    success: true,
    data: {
      shanghai: calcIndex(shStocks),
      shenzhen: calcIndex(szStocks),
      total: calcIndex(stockData)
    },
    timestamp: new Date().toISOString()
  })
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api`)
})
