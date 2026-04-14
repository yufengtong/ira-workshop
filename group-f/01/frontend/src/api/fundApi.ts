/**
 * 基金 API 服务
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 基金基本信息
export interface FundInfo {
  code: string;
  name: string;
  type: string;
  manager: string;
  company: string;
  establishment_date: string;
  net_value: number;
  total_assets: number;
}

// 基金业绩表现
export interface FundPerformance {
  return_1m: number;
  return_3m: number;
  return_6m: number;
  return_1y: number;
  return_3y: number;
  return_since_inception: number;
  annualized_return: number;
  max_drawdown: number;
  sharpe_ratio: number;
  volatility: number;
}

// 基金风险指标
export interface FundRisk {
  risk_level: string;
  alpha: number;
  beta: number;
  standard_deviation: number;
  var_95: number;
}

// 历史数据点
export interface HistoryPoint {
  date: string;
  nav: number;
  accumulated_nav: number;
}

// 基金详情
export interface FundDetail {
  info: FundInfo;
  performance: FundPerformance;
  risk: FundRisk;
  history: HistoryPoint[];
}

// 对比响应
export interface FundCompareResponse {
  funds: FundDetail[];
  comparison_date: string;
}

// API 方法
export const fundApi = {
  // 搜索基金
  searchFunds: async (keyword?: string): Promise<FundInfo[]> => {
    const response = await api.get('/funds/search', {
      params: { keyword },
    });
    return response.data;
  },

  // 获取基金详情
  getFundDetail: async (fundCode: string): Promise<FundDetail> => {
    const response = await api.get(`/funds/${fundCode}`);
    return response.data;
  },

  // 对比基金
  compareFunds: async (fundCodes: string[]): Promise<FundCompareResponse> => {
    const response = await api.post('/funds/compare', {
      fund_codes: fundCodes,
    });
    return response.data;
  },

  // 获取热门基金
  getPopularFunds: async (): Promise<FundInfo[]> => {
    const response = await api.get('/funds/popular/list');
    return response.data;
  },
};
