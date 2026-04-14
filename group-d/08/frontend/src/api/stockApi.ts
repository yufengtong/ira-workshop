import axios from 'axios';
import type { StockData, KLineData } from '../types/stock';

const API_BASE_URL = '/api/stocks';

/**
 * 获取实时股票数据
 */
export const getRealTimeData = async (codes: string = 'sz002603,sz002604'): Promise<StockData[]> => {
  try {
    const response = await axios.get<StockData[]>(`${API_BASE_URL}/realtime`, {
      params: { codes }
    });
    console.log('API返回数据:', response.data);
    // 确保返回的是数组
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('获取实时数据失败:', error);
    return [];
  }
};

/**
 * 刷新并保存股票数据
 */
export const refreshData = async (codes: string = 'sz002603,sz002604'): Promise<StockData[]> => {
  try {
    const response = await axios.post<StockData[]>(`${API_BASE_URL}/refresh`, null, {
      params: { codes }
    });
    return response.data;
  } catch (error) {
    console.error('刷新数据失败:', error);
    return [];
  }
};

/**
 * 获取历史数据
 */
export const getHistoryData = async (code: string, hours: number = 24): Promise<StockData[]> => {
  try {
    const response = await axios.get<StockData[]>(`${API_BASE_URL}/history/${code}`, {
      params: { hours }
    });
    return response.data;
  } catch (error) {
    console.error('获取历史数据失败:', error);
    return [];
  }
};

/**
 * 获取K线图片URL
 */
export const getKLineImageUrl = (code: string, type: string): string => {
  return `/api/kline/image/${code}?type=${type}`;
};

/**
 * 获取K线JSON数据
 */
export const getKLineData = async (
  code: string, 
  scale: number = 240, 
  datalen: number = 100
): Promise<KLineData[]> => {
  try {
    const response = await axios.get<KLineData[]>(`/api/kline/data/${code}`, {
      params: { scale, datalen }
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('获取K线数据失败:', error);
    return [];
  }
};

/**
 * AI分析股票
 */
export const analyzeStock = async (code: string): Promise<any> => {
  try {
    const response = await axios.post(`/api/stocks/analyze/${code}`);
    return response.data;
  } catch (error) {
    console.error('AI分析失败:', error);
    throw error;
  }
};
