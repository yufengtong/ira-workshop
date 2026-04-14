/**
 * 观点分析引擎
 * 对从各平台获取的ETF舆情进行结构化分析和总结
 */

// 看多关键词
const BULLISH_KEYWORDS = [
  '看好', '看多', '买入', '加仓', '抄底', '低估', '机会', '上涨', '突破',
  '利好', '反弹', '底部', '优质', '价值', '配置', '增持', '强势', '龙头',
  '新高', '放量', '资金流入', '主力', '拉升', '启动', '趋势向上', '金叉',
  '定投', '布局', '长期看好', '景气', '复苏', '超跌反弹', '估值修复',
];

// 看空关键词
const BEARISH_KEYWORDS = [
  '看空', '看跌', '卖出', '减仓', '清仓', '高估', '风险', '下跌', '破位',
  '利空', '回调', '顶部', '泡沫', '套牢', '亏损', '跑路', '暴跌', '崩盘',
  '新低', '缩量', '资金流出', '出逃', '砸盘', '跳水', '趋势向下', '死叉',
  '止损', '观望', '谨慎', '衰退', '恶化', '见顶', '估值过高',
];

// 中性关键词
const NEUTRAL_KEYWORDS = [
  '震荡', '横盘', '分化', '博弈', '不确定', '观望', '等待', '持有',
  '中性', '平衡', '分歧', '波动', '调整',
];

/**
 * 分析单条观点的情绪倾向
 */
function analyzeSentiment(text) {
  if (!text) return { sentiment: 'neutral', score: 0 };

  const content = text.toLowerCase();
  let bullishScore = 0;
  let bearishScore = 0;
  let neutralScore = 0;

  for (const keyword of BULLISH_KEYWORDS) {
    if (content.includes(keyword)) bullishScore++;
  }
  for (const keyword of BEARISH_KEYWORDS) {
    if (content.includes(keyword)) bearishScore++;
  }
  for (const keyword of NEUTRAL_KEYWORDS) {
    if (content.includes(keyword)) neutralScore++;
  }

  const total = bullishScore + bearishScore + neutralScore;
  if (total === 0) return { sentiment: 'neutral', score: 0 };

  if (bullishScore > bearishScore && bullishScore > neutralScore) {
    return { sentiment: 'bullish', score: bullishScore / total };
  }
  if (bearishScore > bullishScore && bearishScore > neutralScore) {
    return { sentiment: 'bearish', score: bearishScore / total };
  }
  return { sentiment: 'neutral', score: neutralScore / total };
}

/**
 * 提取观点中的关键话题
 */
function extractKeyTopics(opinions) {
  const topicCount = {};
  const allKeywords = [...BULLISH_KEYWORDS, ...BEARISH_KEYWORDS, ...NEUTRAL_KEYWORDS];

  for (const opinion of opinions) {
    const text = opinion.content || '';
    for (const keyword of allKeywords) {
      if (text.includes(keyword)) {
        topicCount[keyword] = (topicCount[keyword] || 0) + 1;
      }
    }
  }

  return Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([keyword, count]) => ({ keyword, count }));
}

/**
 * 按来源统计观点数
 */
function countBySource(opinions) {
  const counts = {};
  for (const op of opinions) {
    counts[op.source] = (counts[op.source] || 0) + 1;
  }
  return counts;
}

/**
 * 生成综合分析摘要
 */
function generateSummary(sentimentDist, etf, opinions) {
  const { bullish, bearish, neutral } = sentimentDist;
  const total = bullish + bearish + neutral;

  if (total === 0) {
    return `暂未获取到 ${etf.name}(${etf.code}) 的有效舆情数据。`;
  }

  const bullishPct = ((bullish / total) * 100).toFixed(0);
  const bearishPct = ((bearish / total) * 100).toFixed(0);
  const neutralPct = ((neutral / total) * 100).toFixed(0);

  const changeDesc = etf.changePercent > 0
    ? `今日上涨 ${etf.changePercent}%`
    : `今日下跌 ${Math.abs(etf.changePercent)}%`;

  let mainSentiment;
  if (bullish > bearish && bullish > neutral) {
    mainSentiment = '看多情绪占主导';
  } else if (bearish > bullish && bearish > neutral) {
    mainSentiment = '看空情绪占主导';
  } else {
    mainSentiment = '市场观点分歧较大';
  }

  // 找出最热门观点（点赞最多）
  const hotOpinion = opinions
    .filter((o) => o.content && o.content.length > 10)
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];

  let summary = `${etf.name}(${etf.code}) ${changeDesc}，`;
  summary += `共采集 ${total} 条舆情，其中看多 ${bullishPct}%、看空 ${bearishPct}%、中性 ${neutralPct}%。`;
  summary += `${mainSentiment}。`;

  if (hotOpinion) {
    const excerpt = hotOpinion.content.length > 80
      ? hotOpinion.content.substring(0, 80) + '...'
      : hotOpinion.content;
    summary += ` 热门观点来自${hotOpinion.source}：「${excerpt}」`;
  }

  return summary;
}

/**
 * 对ETF的舆情进行综合分析
 * @param {Object} opinions - fetchOpinions 返回的结果
 * @param {Object} etf - ETF信息
 */
export function analyzeOpinions(opinions, etf) {
  const allOpinions = opinions.all || [];

  // 对每条观点进行情绪分析
  const analyzedOpinions = allOpinions.map((op) => ({
    ...op,
    ...analyzeSentiment(op.content),
  }));

  // 情绪分布统计
  const sentimentDistribution = {
    bullish: analyzedOpinions.filter((o) => o.sentiment === 'bullish').length,
    bearish: analyzedOpinions.filter((o) => o.sentiment === 'bearish').length,
    neutral: analyzedOpinions.filter((o) => o.sentiment === 'neutral').length,
  };

  // 整体情绪判断
  const { bullish, bearish, neutral } = sentimentDistribution;
  let overallSentiment;
  if (bullish > bearish && bullish > neutral) {
    overallSentiment = 'bullish';
  } else if (bearish > bullish && bearish > neutral) {
    overallSentiment = 'bearish';
  } else {
    overallSentiment = 'neutral';
  }

  // 关键话题
  const keyTopics = extractKeyTopics(allOpinions);

  // 来源统计
  const sourceCounts = countBySource(allOpinions);

  // 综合摘要
  const summary = generateSummary(sentimentDistribution, etf, allOpinions);

  // 选出代表性观点（每个来源取热度最高的1条）
  const representativeOpinions = [];
  for (const source of ['新浪财经', '雪球', '知乎', '微博']) {
    const sourceOpinions = analyzedOpinions
      .filter((o) => o.source === source && o.content && o.content.length > 10)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0));
    if (sourceOpinions.length > 0) {
      representativeOpinions.push(sourceOpinions[0]);
    }
  }

  return {
    summary,
    overallSentiment,
    sentimentDistribution,
    keyTopics,
    sourceCounts,
    representativeOpinions,
    analyzedOpinions,
    totalCount: allOpinions.length,
  };
}
