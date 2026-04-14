package com.stocknews.domain.model.decision;

import com.stocknews.domain.model.news.News;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * 板块分析聚合根
 * 用于基于高影响资讯分析板块走势
 */
public class SectorAnalysis implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final String sectorName;
    private LocalDateTime analysisTime;
    private final List<News> highImpactNews;   // 高影响资讯列表
    private StockTrend predictedTrend;          // 预测走势
    private double confidence;                   // 置信度
    private String analysisReason;               // 分析原因

    public SectorAnalysis(String sectorName) {
        if (sectorName == null || sectorName.trim().isEmpty()) {
            throw new IllegalArgumentException("板块名称不能为空");
        }
        this.sectorName = sectorName;
        this.analysisTime = LocalDateTime.now();
        this.highImpactNews = new ArrayList<>();
        this.confidence = 0.0;
    }

    public String getSectorName() {
        return sectorName;
    }

    public LocalDateTime getAnalysisTime() {
        return analysisTime;
    }

    public List<News> getHighImpactNews() {
        return Collections.unmodifiableList(highImpactNews);
    }

    public StockTrend getPredictedTrend() {
        return predictedTrend;
    }

    public double getConfidence() {
        return confidence;
    }

    public String getAnalysisReason() {
        return analysisReason;
    }
    
    /**
     * 添加高影响资讯
     */
    public void addNews(News news) {
        if (news != null && !highImpactNews.contains(news)) {
            highImpactNews.add(news);
            this.analysisTime = LocalDateTime.now();
        }
    }
    
    /**
     * 预测走势
     * 基于高影响资讯综合判断
     */
    public void predictTrend() {
        if (highImpactNews.isEmpty()) {
            this.predictedTrend = new StockTrend(
                sectorName, sectorName, TrendDirection.FLAT, 
                0.0, LocalDateTime.now(), "无高影响资讯"
            );
            this.confidence = 0.0;
            this.analysisReason = "缺乏足够的高影响资讯进行走势预测";
            return;
        }
        
        // 简单的预测逻辑：根据影响因子权重加权判断
        double totalImpact = 0.0;
        int positiveCount = 0;
        int negativeCount = 0;
        
        for (News news : highImpactNews) {
            ImpactFactor factor = news.getImpactFactor();
            if (factor != null) {
                totalImpact += factor.getWeight();
                // 简单判断：权重>=0.7视为正面影响
                if (factor.getWeight() >= 0.7) {
                    positiveCount++;
                } else if (factor.getWeight() < 0.5) {
                    negativeCount++;
                }
            }
        }
        
        TrendDirection direction;
        double changePercent;
        
        if (positiveCount > negativeCount) {
            direction = TrendDirection.UP;
            changePercent = totalImpact * 2; // 简化的涨跌幅计算
            this.analysisReason = String.format("基于%d条正面影响资讯预测上涨", positiveCount);
        } else if (negativeCount > positiveCount) {
            direction = TrendDirection.DOWN;
            changePercent = -totalImpact * 2;
            this.analysisReason = String.format("基于%d条负面影响资讯预测下跌", negativeCount);
        } else {
            direction = TrendDirection.FLAT;
            changePercent = 0.0;
            this.analysisReason = "正负面影响资讯均衡，预测横盘";
        }
        
        this.predictedTrend = new StockTrend(
            sectorName, sectorName, direction, 
            changePercent, LocalDateTime.now(), analysisReason
        );
        
        // 置信度基于资讯数量
        this.confidence = Math.min(1.0, highImpactNews.size() * 0.2);
        this.analysisTime = LocalDateTime.now();
    }
    
    /**
     * 生成分析报告
     */
    public String generateAnalysisReport() {
        StringBuilder report = new StringBuilder();
        report.append("【板块分析报告】\n");
        report.append("板块名称：").append(sectorName).append("\n");
        report.append("分析时间：").append(analysisTime).append("\n");
        report.append("高影响资讯数量：").append(highImpactNews.size()).append("\n");
        report.append("预测走势：").append(predictedTrend != null ? predictedTrend.getDirection().getName() : "未知").append("\n");
        report.append("预测涨跌幅：").append(String.format("%.2f%%", predictedTrend != null ? predictedTrend.getChangePercent() : 0)).append("\n");
        report.append("置信度：").append(String.format("%.0f%%", confidence * 100)).append("\n");
        report.append("分析原因：").append(analysisReason).append("\n");
        
        if (!highImpactNews.isEmpty()) {
            report.append("\n【相关资讯】\n");
            for (int i = 0; i < Math.min(5, highImpactNews.size()); i++) {
                News news = highImpactNews.get(i);
                report.append(i + 1).append(". ")
                      .append(news.getTitle().getTitle())
                      .append(" (影响因子: ")
                      .append(news.getImpactFactor() != null ? news.getImpactFactor().getFactorName() : "未知")
                      .append(")\n");
            }
        }
        
        return report.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SectorAnalysis that = (SectorAnalysis) o;
        return Objects.equals(sectorName, that.sectorName) &&
               Objects.equals(analysisTime, that.analysisTime);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sectorName, analysisTime);
    }
}
