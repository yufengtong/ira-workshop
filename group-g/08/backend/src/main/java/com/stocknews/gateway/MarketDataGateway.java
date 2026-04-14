package com.stocknews.gateway;

import com.stocknews.domain.model.decision.SectorAnalysis;
import com.stocknews.domain.model.decision.StockTrend;
import com.stocknews.domain.model.news.News;

import java.util.List;

/**
 * 行情数据网关接口 - 防腐层
 * 领域层通过此接口获取行情数据，不依赖具体的实现
 */
public interface MarketDataGateway {
    
    /**
     * 获取股票走势
     * @param stockCode 股票代码
     * @return 股票走势
     */
    StockTrend getStockTrend(String stockCode);
    
    /**
     * 获取板块分析
     * @param sector 板块名称
     * @return 板块分析结果
     */
    SectorAnalysis getSectorAnalysis(String sector);
    
    /**
     * 获取最近的资讯（用于走势分析）
     * @return 最近资讯列表
     */
    List<News> getRecentNews();
    
    /**
     * 获取板块成分股
     * @param sector 板块名称
     * @return 成分股代码列表
     */
    List<String> getSectorStocks(String sector);
}
