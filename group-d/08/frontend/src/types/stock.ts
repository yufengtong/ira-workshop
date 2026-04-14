export interface StockData {
  id?: number;
  code: string;
  name: string;
  currentPrice: number | null;
  openPrice: number | null;
  preClose: number | null;
  highPrice: number | null;
  lowPrice: number | null;
  volume: number | null;
  changePercent: number | null;
  timestamp: string;
}

export interface KLineData {
  day: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
