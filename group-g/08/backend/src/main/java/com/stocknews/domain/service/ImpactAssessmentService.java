package com.stocknews.domain.service;

import com.stocknews.domain.model.decision.ImpactFactor;
import com.stocknews.domain.model.decision.ImpactLevel;
import com.stocknews.domain.model.decision.NewsCategory;
import com.stocknews.domain.model.decision.UserPreference;
import com.stocknews.domain.model.news.News;
import com.stocknews.gateway.NewsProviderGateway;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 影响评估服务 - 领域服务
 * 核心功能：评估资讯影响因子和影响程度
 */
public class ImpactAssessmentService {
    
    private final NewsProviderGateway newsProviderGateway;

    public ImpactAssessmentService(NewsProviderGateway newsProviderGateway) {
        this.newsProviderGateway = newsProviderGateway;
    }

    /**
     * 评估单条资讯的影响因子
     */
    public ImpactFactor assessImpactFactor(News news) {
        if (news == null || news.getCategory() == null) {
            return new ImpactFactor("未知影响", 0.3, NewsCategory.MACRO);
        }

        // 如果已有影响因子，直接返回
        if (news.getImpactFactor() != null) {
            return news.getImpactFactor();
        }

        // 根据资讯分类和内容评估影响因子
        double weight = calculateWeight(news);
        String factorName = determineFactorName(news);
        
        return new ImpactFactor(factorName, weight, news.getCategory());
    }

    /**
     * 根据用户偏好评估资讯的影响程度
     */
    public ImpactLevel assessImpactLevel(News news, UserPreference preference) {
        if (news == null) {
            return ImpactLevel.MINIMAL;
        }
        
        if (preference == null) {
            // 使用默认偏好评估
            return news.assessImpact(createDefaultPreference());
        }
        
        return news.assessImpact(preference);
    }

    /**
     * 筛选高影响资讯
     */
    public List<News> filterHighImpactNews(List<News> newsList, UserPreference preference) {
        if (newsList == null || newsList.isEmpty()) {
            return new ArrayList<>();
        }

        UserPreference effectivePreference = preference != null ? 
            preference : createDefaultPreference();

        return newsList.stream()
            .filter(news -> effectivePreference.shouldPush(news))
            .collect(Collectors.toList());
    }

    /**
     * 获取当天需要推送的高影响资讯
     */
    public List<News> getTodaysHighImpactNews(UserPreference preference) {
        // 获取当天资讯并筛选高影响资讯
        if (newsProviderGateway == null) {
            return new ArrayList<>();
        }
        
        List<News> todaysNews = newsProviderGateway.fetchNewsFromAllSources(
            LocalDateTime.now().withHour(0).withMinute(0).withSecond(0)
        );
        
        return filterHighImpactNews(todaysNews, preference);
    }

    /**
     * 计算资讯权重
     */
    private double calculateWeight(News news) {
        double baseWeight = 0.5;
        
        // 根据分类调整权重
        if (news.getCategory() != null) {
            switch (news.getCategory()) {
                case POLICY:
                    baseWeight = 0.85;
                    break;
                case COMPANY:
                    baseWeight = 0.75;
                    break;
                case INDUSTRY:
                    baseWeight = 0.65;
                    break;
                case MACRO:
                    baseWeight = 0.70;
                    break;
            }
        }
        
        // 根据相关股票/板块数量调整
        int relatedCount = (news.getRelatedStocks() != null ? news.getRelatedStocks().size() : 0)
                         + (news.getRelatedSectors() != null ? news.getRelatedSectors().size() : 0);
        if (relatedCount > 3) {
            baseWeight *= 1.1;
        }
        
        return Math.min(1.0, baseWeight);
    }

    /**
     * 确定影响因子名称
     */
    private String determineFactorName(News news) {
        if (news.getCategory() == null) {
            return "一般影响";
        }

        switch (news.getCategory()) {
            case POLICY:
                return "政策影响";
            case COMPANY:
                return "公司事件";
            case INDUSTRY:
                return "行业动态";
            case MACRO:
                return "宏观因素";
            default:
                return "一般影响";
        }
    }

    /**
     * 创建默认偏好
     */
    private UserPreference createDefaultPreference() {
        return new UserPreference("default", null, null, null, ImpactLevel.HIGH);
    }
}
