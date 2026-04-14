/**
 * OpenCLI 舆情观点获取服务
 * 通过调用 OpenCLI 从多平台获取ETF相关讨论
 *
 * 数据源优先级：
 * 1. 新浪财经快讯 (public, 无需浏览器扩展) - 实时财经新闻
 * 2. 雪球讨论 (cookie, 需浏览器扩展) - 个股讨论
 * 3. 知乎搜索 (cookie, 需浏览器扩展) - 深度观点
 * 4. 微博搜索 (cookie, 需浏览器扩展) - 热点舆情
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const OPENCLI_CMD = 'opencli';
const DEFAULT_TIMEOUT = 30000; // 30秒超时

/**
 * 执行 OpenCLI 命令并返回 JSON 结果
 * 使用 exec + shell:true 以兼容 Windows (.cmd 脚本)
 */
async function runOpenCLI(args, timeout = DEFAULT_TIMEOUT) {
  try {
    // 对参数中的特殊字符进行安全转义
    const safeArgs = args.map((arg) => {
      if (/["\s&|<>^]/.test(arg)) return `"${arg.replace(/"/g, '\\"')}"`;
      return arg;
    });
    const cmd = `${OPENCLI_CMD} ${safeArgs.join(' ')}`;
    const { stdout } = await execAsync(cmd, {
      timeout,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 5, // 5MB
      shell: true,
    });
    try {
      return JSON.parse(stdout);
    } catch {
      return stdout.trim();
    }
  } catch (err) {
    console.warn(`OpenCLI 命令执行失败 [${args.join(' ')}]:`, err.message);
    return null;
  }
}

/**
 * 从新浪财经7x24快讯获取与ETF相关的新闻 (public API, 无需浏览器扩展)
 * @param {string} name - ETF名称或相关关键词
 */
async function fetchSinaFinanceNews(name, limit = 30) {
  const result = await runOpenCLI([
    'sinafinance', 'news',
    '--limit', String(limit),
    '-f', 'json',
  ]);

  if (!result || !Array.isArray(result)) return [];

  // 提取ETF名称中的核心关键词用于匹配
  const keywords = extractKeywords(name);

  // 过滤出与该ETF相关的新闻
  const relevant = result.filter((item) => {
    const content = (item.content || item.title || '').toLowerCase();
    return keywords.some((kw) => content.includes(kw.toLowerCase()));
  });

  return relevant.map((item) => ({
    source: '新浪财经',
    author: '新浪财经快讯',
    content: item.content || item.title || '',
    likes: 0,
    replies: 0,
    time: item.time || '',
    url: item.url || '',
    views: item.views || '',
  }));
}

/**
 * 从新浪财经行情获取ETF关联板块的实时股价信息 (public API)
 * @param {string} code - ETF代码
 */
async function fetchSinaFinanceStock(code) {
  const sinaCode = formatSinaSymbol(code);
  const result = await runOpenCLI([
    'sinafinance', 'stock', sinaCode,
    '-f', 'json',
  ]);

  if (!result) return null;
  return result;
}

/**
 * 从雪球获取ETF讨论动态 (需浏览器扩展)
 * @param {string} symbol - ETF代码
 */
async function fetchXueqiuComments(symbol, limit = 10) {
  const xqSymbol = formatXueqiuSymbol(symbol);
  const result = await runOpenCLI([
    'xueqiu', 'comments', xqSymbol,
    '--limit', String(limit),
    '-f', 'json',
  ]);

  if (!result || !Array.isArray(result)) return [];

  return result.map((item) => ({
    source: '雪球',
    author: item.author || '匿名',
    content: item.text || item.content || '',
    likes: item.likes || 0,
    replies: item.replies || 0,
    time: item.created_at || item.time || '',
    url: item.url || '',
  }));
}

/**
 * 从知乎搜索ETF相关讨论 (需浏览器扩展)
 * @param {string} name - ETF名称
 */
async function fetchZhihuOpinions(name, limit = 5) {
  const query = `${name} ETF 投资`;
  const result = await runOpenCLI([
    'zhihu', 'search', query,
    '--limit', String(limit),
    '-f', 'json',
  ]);

  if (!result || !Array.isArray(result)) return [];

  return result.map((item) => ({
    source: '知乎',
    author: item.author || '匿名',
    content: item.title || item.content || item.excerpt || '',
    likes: item.votes || item.likes || 0,
    replies: item.answers || item.comments || 0,
    time: item.time || item.created || '',
    url: item.url || '',
  }));
}

/**
 * 从微博搜索ETF相关讨论 (需浏览器扩展)
 * @param {string} name - ETF名称
 */
async function fetchWeiboOpinions(name, limit = 5) {
  const result = await runOpenCLI([
    'weibo', 'search', name,
    '--limit', String(limit),
    '-f', 'json',
  ]);

  if (!result || !Array.isArray(result)) return [];

  return result.map((item) => ({
    source: '微博',
    author: item.author || '匿名',
    content: item.title || item.content || item.text || '',
    likes: item.likes || 0,
    replies: item.comments || item.replies || 0,
    time: item.time || '',
    url: item.url || '',
  }));
}

/**
 * 将ETF代码转为雪球格式
 */
function formatXueqiuSymbol(code) {
  if (code.startsWith('SH') || code.startsWith('SZ')) return code;
  const prefix = code.startsWith('1') ? 'SZ' : 'SH';
  return `${prefix}${code}`;
}

/**
 * 将ETF代码转为新浪格式
 */
function formatSinaSymbol(code) {
  if (code.startsWith('sh') || code.startsWith('sz')) return code;
  if (code.startsWith('SH') || code.startsWith('SZ')) return code.toLowerCase();
  const prefix = code.startsWith('1') ? 'sz' : 'sh';
  return `${prefix}${code}`;
}

/**
 * 从ETF名称提取搜索关键词
 * 例: "标普油气ETF富国" -> ["标普油气", "油气", "标普"]
 *     "游戏ETF国泰" -> ["游戏"]
 *     "电池龙头ETF" -> ["电池", "电池龙头"]
 */
function extractKeywords(name) {
  const keywords = [];
  // 移除基金公司后缀和ETF标识
  const cleanName = name
    .replace(/ETF.*$/, '')
    .replace(/(富国|嘉实|易方达|兴银|景顺|国泰|华夏|华泰柏瑞|广发|南方|博时|招商|工银|中银|鹏华|天弘|汇添富)$/, '')
    .trim();

  if (cleanName) keywords.push(cleanName);

  // 提取核心行业词
  const industryMap = {
    '标普油气': ['油气', '石油', '天然气', '原油', '能源'],
    '巴西': ['巴西', '拉美'],
    '电池': ['电池', '锂电', '新能源车', '储能'],
    '电池龙头': ['电池', '锂电', '宁德'],
    '游戏': ['游戏', '网游', '手游', '电竞'],
    '电网设备': ['电网', '电力设备', '特高压', '输配电'],
    '芯片': ['芯片', '半导体', '集成电路'],
    '光伏': ['光伏', '太阳能', '硅片'],
    '医药': ['医药', '生物医药', '创新药'],
    '消费': ['消费', '白酒', '食品饮料'],
    '军工': ['军工', '国防', '航天'],
    '银行': ['银行', '金融'],
    '证券': ['券商', '证券'],
    '房地产': ['房地产', '地产'],
    '科创': ['科创', '科技'],
    '创业板': ['创业板'],
    '中概': ['中概', '中概股'],
    '恒生科技': ['恒生科技', '港股科技'],
    '纳斯达克': ['纳斯达克', '纳指', '美股科技'],
  };

  for (const [key, relatedWords] of Object.entries(industryMap)) {
    if (cleanName.includes(key) || name.includes(key)) {
      keywords.push(...relatedWords);
    }
  }

  // 去重
  return [...new Set(keywords)];
}

// 新浪财经新闻缓存（避免每个ETF都重新请求）
let sinaNewsCache = { data: null, timestamp: 0 };
const SINA_CACHE_TTL = 3 * 60 * 1000; // 3分钟

async function getCachedSinaNews() {
  const now = Date.now();
  if (sinaNewsCache.data && (now - sinaNewsCache.timestamp < SINA_CACHE_TTL)) {
    return sinaNewsCache.data;
  }
  const news = await runOpenCLI(['sinafinance', 'news', '--limit', '50', '-f', 'json']);
  if (news && Array.isArray(news)) {
    sinaNewsCache = { data: news, timestamp: now };
  }
  return sinaNewsCache.data || [];
}

/**
 * 从缓存的新浪快讯中筛选与ETF相关的新闻
 */
async function fetchSinaFinanceNewsFromCache(name) {
  const allNews = await getCachedSinaNews();
  if (!allNews || !Array.isArray(allNews)) return [];

  const keywords = extractKeywords(name);

  const relevant = allNews.filter((item) => {
    const content = (item.content || item.title || '');
    return keywords.some((kw) => content.includes(kw));
  });

  return relevant.slice(0, 8).map((item) => ({
    source: '新浪财经',
    author: '新浪财经快讯',
    content: item.content || item.title || '',
    likes: 0,
    replies: 0,
    time: item.time || '',
    url: item.url || '',
    views: item.views || '',
  }));
}

/**
 * 获取单只ETF的全部舆情观点
 * @param {string} symbol - ETF代码
 * @param {string} name - ETF名称
 */
export async function fetchOpinions(symbol, name) {
  // 并发获取所有数据源，新浪财经为必选（public API），其他为可选
  const results = await Promise.allSettled([
    fetchSinaFinanceNewsFromCache(name),
    fetchXueqiuComments(symbol),
    fetchZhihuOpinions(name),
    fetchWeiboOpinions(name),
  ]);

  const opinions = {
    sinafinance: results[0].status === 'fulfilled' ? results[0].value : [],
    xueqiu: results[1].status === 'fulfilled' ? results[1].value : [],
    zhihu: results[2].status === 'fulfilled' ? results[2].value : [],
    weibo: results[3].status === 'fulfilled' ? results[3].value : [],
  };

  opinions.total = opinions.sinafinance.length + opinions.xueqiu.length +
    opinions.zhihu.length + opinions.weibo.length;
  opinions.all = [
    ...opinions.sinafinance,
    ...opinions.xueqiu,
    ...opinions.zhihu,
    ...opinions.weibo,
  ];

  // 标记哪些数据源可用
  opinions.sources = {
    sinafinance: { available: true, count: opinions.sinafinance.length },
    xueqiu: { available: opinions.xueqiu.length > 0, count: opinions.xueqiu.length },
    zhihu: { available: opinions.zhihu.length > 0, count: opinions.zhihu.length },
    weibo: { available: opinions.weibo.length > 0, count: opinions.weibo.length },
  };

  return opinions;
}
