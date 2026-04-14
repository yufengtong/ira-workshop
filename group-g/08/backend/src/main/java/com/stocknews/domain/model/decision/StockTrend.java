package com.stocknews.domain.model.decision;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * 股票走势值对象
 */
public class StockTrend implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final String stockCode;
    private final String stockName;
    private final TrendDirection direction;
    private final double changePercent;      // 预测涨跌幅
    private final LocalDateTime baseTime;
    private final String reason;              // 走势原因

    public StockTrend(String stockCode, String stockName, TrendDirection direction, 
                      double changePercent, LocalDateTime baseTime, String reason) {
        this.stockCode = stockCode;
        this.stockName = stockName;
        this.direction = direction;
        this.changePercent = changePercent;
        this.baseTime = baseTime;
        this.reason = reason;
    }

    public String getStockCode() {
        return stockCode;
    }

    public String getStockName() {
        return stockName;
    }

    public TrendDirection getDirection() {
        return direction;
    }

    public double getChangePercent() {
        return changePercent;
    }

    public LocalDateTime getBaseTime() {
        return baseTime;
    }

    public String getReason() {
        return reason;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StockTrend that = (StockTrend) o;
        return Double.compare(that.changePercent, changePercent) == 0 &&
               Objects.equals(stockCode, that.stockCode) &&
               direction == that.direction;
    }

    @Override
    public int hashCode() {
        return Objects.hash(stockCode, direction, changePercent);
    }

    @Override
    public String toString() {
        return "StockTrend{" +
                "stockCode='" + stockCode + '\'' +
                ", direction=" + direction +
                ", changePercent=" + changePercent + "%" +
                '}';
    }
}
