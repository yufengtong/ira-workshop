/**
 * ETF数据获取服务
 * 使用东方财富公开API获取场内ETF实时行情排名
 */

// 东方财富 ETF 列表 API
const EASTMONEY_ETF_API = 'https://push2.eastmoney.com/api/qt/clist/get';

/**
 * 从东方财富获取场内ETF行情数据
 * @param {string} order - 排序方式: 'desc' 降序(涨幅前), 'asc' 升序(跌幅前)
 * @param {number} limit - 返回数量
 */
async function fetchETFList(order = 'desc', limit = 30) {
  const params = new URLSearchParams({
    // 场内ETF基金
    fs: 'b:MK0021,b:MK0022,b:MK0023,b:MK0024',
    // 返回字段: 代码,名称,最新价,涨跌幅,涨跌额,成交量,成交额,振幅,最高,最低,今开,昨收
    fields: 'f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f14,f15,f16,f17,f18',
    // 按涨跌幅排序
    fid: 'f3',
    pn: '1',
    pz: String(limit),
    po: order === 'desc' ? '1' : '0',
    np: '1',
    fltt: '2',
    invt: '2',
    ut: 'b2884a393a59ad64002292a3e90d46a5',
    cb: '',
  });

  const url = `${EASTMONEY_ETF_API}?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://quote.eastmoney.com/',
    },
  });

  if (!response.ok) {
    throw new Error(`东方财富API请求失败: ${response.status}`);
  }

  const text = await response.text();
  // 东方财富API可能返回JSONP格式，需要处理
  const jsonStr = text.replace(/^[^(]*\(/, '').replace(/\);?\s*$/, '') || text;
  const data = JSON.parse(jsonStr);

  if (!data.data || !data.data.diff) {
    throw new Error('东方财富API返回数据格式异常');
  }

  return data.data.diff.map((item) => ({
    code: item.f12,           // 代码
    name: item.f14,           // 名称
    price: item.f2,           // 最新价
    changePercent: item.f3,   // 涨跌幅(%)
    changeAmount: item.f4,    // 涨跌额
    volume: item.f5,          // 成交量(手)
    turnover: item.f6,        // 成交额
    amplitude: item.f7,       // 振幅(%)
    turnoverRate: item.f8,    // 换手率(%)
    pe: item.f9,              // 市盈率
    volumeRatio: item.f10,    // 量比
    high: item.f15,           // 最高
    low: item.f16,            // 最低
    open: item.f17,           // 今开
    prevClose: item.f18,      // 昨收
  }));
}

/**
 * 获取ETF涨跌幅排名：涨幅前5 + 跌幅前5
 */
export async function fetchETFRanking() {
  // 并发获取涨幅和跌幅排名
  const [gainersRaw, losersRaw] = await Promise.all([
    fetchETFList('desc', 30),
    fetchETFList('asc', 30),
  ]);

  // 过滤掉异常数据（价格为 '-' 或涨跌幅为 '-'）
  const validGainers = gainersRaw.filter(
    (e) => e.price !== '-' && e.changePercent !== '-' && e.changePercent > 0
  );
  const validLosers = losersRaw.filter(
    (e) => e.price !== '-' && e.changePercent !== '-' && e.changePercent < 0
  );

  const gainers = validGainers.slice(0, 5);
  const losers = validLosers.slice(0, 5);

  return {
    gainers,
    losers,
    fetchTime: new Date().toISOString(),
    market: 'A股场内ETF',
  };
}
