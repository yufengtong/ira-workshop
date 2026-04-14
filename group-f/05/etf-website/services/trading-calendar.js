/**
 * A股交易日历工具
 * 判断当前是否为交易日、是否在交易时段内
 */

// A股交易时段（北京时间）
const TRADING_SESSIONS = [
  { open: [9, 30], close: [11, 30] },   // 上午盘
  { open: [13, 0], close: [15, 0] },    // 下午盘
];

// 集合竞价时段也纳入刷新范围
const REFRESH_SESSIONS = [
  { open: [9, 15], close: [11, 30] },   // 9:15开始集合竞价 ~ 上午收盘
  { open: [12, 55], close: [15, 5] },   // 下午盘前 ~ 收盘后缓冲5分钟
];

/**
 * 获取当前北京时间 Date 对象
 */
function getBeijingNow() {
  const now = new Date();
  // 转为 UTC 毫秒，再加上 +8 时区偏移
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + 8 * 3600000);
}

/**
 * 判断是否为工作日（周一至周五）
 * 注：不包含节假日判断，如需精确可接入假日API
 */
function isWeekday(date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

/**
 * 判断给定北京时间是否在指定时段列表内
 */
function isInSessions(bjDate, sessions) {
  const h = bjDate.getHours();
  const m = bjDate.getMinutes();
  const timeVal = h * 60 + m;

  return sessions.some(({ open, close }) => {
    const openVal = open[0] * 60 + open[1];
    const closeVal = close[0] * 60 + close[1];
    return timeVal >= openVal && timeVal <= closeVal;
  });
}

/**
 * 当前是否为交易日（仅工作日判断）
 */
export function isTradingDay() {
  return isWeekday(getBeijingNow());
}

/**
 * 当前是否处于正式交易时段（9:30-11:30, 13:00-15:00）
 */
export function isTradingTime() {
  const bj = getBeijingNow();
  return isWeekday(bj) && isInSessions(bj, TRADING_SESSIONS);
}

/**
 * 当前是否处于应刷新行情的时段（含集合竞价和收盘缓冲）
 */
export function isRefreshTime() {
  const bj = getBeijingNow();
  return isWeekday(bj) && isInSessions(bj, REFRESH_SESSIONS);
}

/**
 * 距离下一个刷新时段开始还有多少毫秒
 * 用于在非交易时间安排 setTimeout 等待
 * 如果当前已在刷新时段内则返回 0
 */
export function msUntilNextRefreshSession() {
  const bj = getBeijingNow();
  if (isWeekday(bj) && isInSessions(bj, REFRESH_SESSIONS)) return 0;

  const h = bj.getHours();
  const m = bj.getMinutes();
  const s = bj.getSeconds();
  const nowMs = ((h * 60 + m) * 60 + s) * 1000;

  // 如果是工作日，查看今天后续时段
  if (isWeekday(bj)) {
    for (const { open } of REFRESH_SESSIONS) {
      const openMs = (open[0] * 60 + open[1]) * 60 * 1000;
      if (openMs > nowMs) return openMs - nowMs;
    }
  }

  // 需要等到下一个工作日 9:15
  let daysToAdd = 1;
  const nextDate = new Date(bj);
  while (true) {
    nextDate.setDate(nextDate.getDate() + 1);
    if (isWeekday(nextDate)) break;
    daysToAdd++;
    if (daysToAdd > 7) break; // 安全上限
  }

  const nextOpenMs = (9 * 60 + 15) * 60 * 1000;
  const msLeftToday = 24 * 3600000 - nowMs;
  return msLeftToday + (daysToAdd - 1) * 24 * 3600000 + nextOpenMs;
}

/**
 * 获取当前交易状态摘要（用于 API 返回给前端）
 */
export function getTradingStatus() {
  const bj = getBeijingNow();
  const weekday = isWeekday(bj);
  const trading = weekday && isInSessions(bj, TRADING_SESSIONS);
  const refreshing = weekday && isInSessions(bj, REFRESH_SESSIONS);

  let label;
  if (!weekday) {
    label = '休市（非交易日）';
  } else if (trading) {
    label = '交易中';
  } else if (refreshing) {
    label = '竞价/盘后';
  } else {
    const h = bj.getHours();
    if (h < 9) label = '盘前';
    else if (h >= 15) label = '已收盘';
    else label = '午间休市';
  }

  return {
    isTradingDay: weekday,
    isTradingTime: trading,
    isRefreshTime: refreshing,
    label,
    beijingTime: `${bj.getFullYear()}-${String(bj.getMonth() + 1).padStart(2, '0')}-${String(bj.getDate()).padStart(2, '0')} ${String(bj.getHours()).padStart(2, '0')}:${String(bj.getMinutes()).padStart(2, '0')}:${String(bj.getSeconds()).padStart(2, '0')}`,
  };
}
