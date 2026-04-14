package com.stocknews.domain.service;

import com.stocknews.domain.model.decision.SectorAnalysis;
import com.stocknews.domain.model.decision.StockTrend;
import com.stocknews.domain.model.news.News;
import com.stocknews.gateway.MarketDataGateway;

import java.util.ArrayList;
import java.util.List;

/**
 * 走势分析服务 - 领域服务
 * 核心功能：基于高影响资讯分析股票板块走势
 */
public class TrendAnalysisService {
    
    private final MarketDataGateway marketDataGateway;

    public TrendAnalysisService(MarketDataGateway marketDataGateway) {
        this.marketDataGateway = marketDataGateway;
    }

    /**
     * 基于高影响资讯分析股票走势
     */
    public StockTrend analyzeStockTrend(String stockCode, List<News> newsList) {
        if (stockCode == null || stockCode.isEmpty() || 
            newsList == null || newsList.isEmpty()) {
            return null;
        }

        // 筛选与该股票相关的资讯
        List<News> relatedNews = filterRelatedNews(stockCode, newsList);
        
        if (relatedNews.isEmpty()) {
            return null;
        }

        // 简单分析：根据影响因子综合判断
        double positiveImpact = 0;
        double negativeImpact = 0;
        
        for (News news : relatedNews) {
            if (news.getImpactFactor() != null) {
                double weight = news.getImpactFactor().getWeight();
                if (weight >= 0.7) {
                    positiveImpact += weight;
                } else if (weight < 0.5) {
                    negativeImpact += (1 - weight);
                }
            }
        }

        return createStockTrend(stockCode, positiveImpact, negativeImpact, relatedNews.size());
    }

    /**
     * 分析板块走势
     */
    public SectorAnalysis analyzeSector(String sector, List<News> newsList) {
        if (sector == null || sector.isEmpty()) {
            return null;
        }

        SectorAnalysis analysis = new SectorAnalysis(sector);

        // 筛选与该板块相关的高影响资讯
        if (newsList != null) {
            for (News news : newsList) {
                if (isRelatedToSector(news, sector)) {
                    analysis.addNews(news);
                }
            }
        }

        // 预测走势
        analysis.predictTrend();

        return analysis;
    }

    /**
     * 批量分析多个板块
     */
    public List<SectorAnalysis> analyzeMultipleSectors(List<String> sectors) {
        if (sectors == null || sectors.isEmpty()) {
            return new ArrayList<>();
        }

        List<SectorAnalysis> results = new ArrayList<>();
        
        // 获取当日资讯用于分析
        List<News> allNews = marketDataGateway != null ? 
            marketDataGateway.getRecentNews() : new ArrayList<>();

        for (String sector : sectors) {
            SectorAnalysis analysis = analyzeSector(sector, allNews);
            if (analysis != null) {
                results.add(analysis);
            }
        }

        return results;
    }

    /**
     * 生成走势分析报告
     */
    public String generateTrendReport(SectorAnalysis analysis) {
        if (analysis == null) {
            return "无分析结果";
        }
        return analysis.generateAnalysisReport();
    }

    /**
     * 筛选与股票相关的资讯
     */
    private List<News> filterRelatedNews(String stockCode, List<News> newsList) {
        List<News> related = new ArrayList<>();
        
        for (News news : newsList) {
            if (news.getRelatedStocks() != null && 
                news.getRelatedStocks().contains(stockCode)) {
                related.add(news);
            }
        }
        
        return related;
    }

    /**
     * 判断资讯是否与板块相关
     */
    private boolean isRelatedToSector(News news, String sector) {
        if (news.getRelatedSectors() != null) {
            return news.getRelatedSectors().contains(sector);
        }
        return false;
    }

    /**
     * 创建股票走势对象
     */
    private StockTrend createStockTrend(String stockCode, 
                                         double positiveImpact, 
                                         double negativeImpact,
                                         int newsCount) {
        com.stocknews.domain.model.decision.TrendDirection direction;
        double changePercent;
        String reason;

        if (positiveImpact > negativeImpact * 1.5) {
            direction = com.stocknews.domain.model.decision.TrendDirection.UP;
            changePercent = (positiveImpact - negativeImpact) * 2;
            reason = String.format("基于%d条正面资讯预测上涨", newsCount);
        } else if (negativeImpact > positiveImpact * 1.5) {
            direction = com.stocknews.domain.model.decision.TrendDirection.DOWN;
            changePercent = -(negativeImpact - positiveImpact) * 2;
            reason = String.format("基于%d条负面影响资讯预测下跌", newsCount);
        } else {
            direction = com.stocknews.domain.model.decision.TrendDirection.FLAT;
            changePercent = 0;
            reason = "正负面影响均衡，预计横盘";
        }

        return new StockTrend(stockCode, stockCode, direction, changePercent, 
                              java.time.LocalDateTime.now(), reason);
    }
}
