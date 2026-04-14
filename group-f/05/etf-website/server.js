import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { fetchETFRanking } from './services/etf-data.js';
import { fetchOpinions } from './services/opencli-opinions.js';
import { analyzeOpinions } from './services/opinion-analyzer.js';
import {
  isRefreshTime,
  msUntilNextRefreshSession,
  getTradingStatus,
} from './services/trading-calendar.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

// ── 缓存 ──────────────────────────────────────────────
let cache = {
  etfData: null,
  lastUpdated: null,
};

const REFRESH_INTERVAL = 3 * 60 * 1000; // 3分钟

// ── 服务端定时刷新 ──────────────────────────────────────
let refreshTimer = null;

async function refreshETFData() {
  try {
    const data = await fetchETFRanking();
    cache.etfData = data;
    cache.lastUpdated = Date.now();
    console.log(`[自动刷新] ETF数据已更新 ${new Date().toLocaleTimeString('zh-CN')}`);
  } catch (err) {
    console.error('[自动刷新] 获取ETF数据失败:', err.message);
  }
}

function scheduleNextRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  if (isRefreshTime()) {
    // 在交易时段内，立即拉取一次，然后每3分钟循环
    refreshETFData().then(() => {
      refreshTimer = setTimeout(function loop() {
        if (isRefreshTime()) {
          refreshETFData().then(() => {
            refreshTimer = setTimeout(loop, REFRESH_INTERVAL);
          });
        } else {
          console.log('[调度] 交易时段结束，暂停自动刷新');
          waitForNextSession();
        }
      }, REFRESH_INTERVAL);
    });
  } else {
    waitForNextSession();
  }
}

function waitForNextSession() {
  const waitMs = msUntilNextRefreshSession();
  if (waitMs <= 0) {
    // 理论上不应该到这里，但做个兜底
    refreshTimer = setTimeout(scheduleNextRefresh, 60000);
    return;
  }

  const waitMin = (waitMs / 60000).toFixed(1);
  const status = getTradingStatus();
  console.log(`[调度] ${status.label}，${waitMin}分钟后进入下一刷新时段`);

  // 如果等待超过30分钟，分段等待（避免 setTimeout 精度问题）
  const maxWait = 30 * 60 * 1000;
  refreshTimer = setTimeout(scheduleNextRefresh, Math.min(waitMs, maxWait));
}

// ── API 路由 ──────────────────────────────────────────

// 交易状态
app.get('/api/trading-status', (_req, res) => {
  const status = getTradingStatus();
  res.json({
    ...status,
    autoRefresh: isRefreshTime(),
    refreshInterval: REFRESH_INTERVAL,
    lastUpdated: cache.lastUpdated,
  });
});

// ETF涨跌幅排名
app.get('/api/etf-ranking', async (req, res) => {
  try {
    // 如果缓存有数据直接返回（定时任务负责更新）
    if (cache.etfData && cache.lastUpdated) {
      return res.json({
        success: true,
        data: cache.etfData,
        cached: true,
        lastUpdated: cache.lastUpdated,
        trading: getTradingStatus(),
      });
    }

    // 首次请求，主动拉取
    const data = await fetchETFRanking();
    cache.etfData = data;
    cache.lastUpdated = Date.now();
    res.json({
      success: true,
      data,
      cached: false,
      lastUpdated: cache.lastUpdated,
      trading: getTradingStatus(),
    });
  } catch (err) {
    console.error('获取ETF数据失败:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 单只ETF舆情
app.get('/api/opinions/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const name = req.query.name || symbol;
    const opinions = await fetchOpinions(symbol, name);
    res.json({ success: true, data: opinions });
  } catch (err) {
    console.error(`获取${req.params.symbol}舆情失败:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 全部ETF舆情分析
app.get('/api/opinions-all', async (req, res) => {
  try {
    const etfData = cache.etfData || await fetchETFRanking();
    if (!cache.etfData) {
      cache.etfData = etfData;
      cache.lastUpdated = Date.now();
    }

    const allETFs = [...etfData.gainers, ...etfData.losers];
    const results = {};

    const batchSize = 3;
    for (let i = 0; i < allETFs.length; i += batchSize) {
      const batch = allETFs.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(async (etf) => {
          const opinions = await fetchOpinions(etf.code, etf.name);
          const analysis = analyzeOpinions(opinions, etf);
          return { etf, opinions, analysis };
        })
      );

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          const { etf, opinions, analysis } = result.value;
          results[etf.code] = { opinions, analysis };
        }
      }
    }

    res.json({ success: true, data: results });
  } catch (err) {
    console.error('批量获取舆情失败:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 启动 ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`ETF涨跌幅排名网站已启动: http://localhost:${PORT}`);
  const status = getTradingStatus();
  console.log(`当前北京时间: ${status.beijingTime} | ${status.label}`);

  // 启动时直接进入定时调度（scheduleNextRefresh 在交易时段会立即拉一次）
  scheduleNextRefresh();
});
