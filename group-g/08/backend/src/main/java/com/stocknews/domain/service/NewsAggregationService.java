package com.stocknews.domain.service;

import com.stocknews.domain.model.news.News;
import com.stocknews.gateway.NewsProviderGateway;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 资讯聚合服务 - 领域服务
 * 核心：多数据源聚合、去重、提炼
 */
public class NewsAggregationService {
    
    private final NewsProviderGateway newsProviderGateway;
    private final DeduplicationService deduplicationService;
    private final SummaryExtractionService summaryExtractionService;

    public NewsAggregationService(NewsProviderGateway newsProviderGateway,
                                   DeduplicationService deduplicationService,
                                   SummaryExtractionService summaryExtractionService) {
        this.newsProviderGateway = newsProviderGateway;
        this.deduplicationService = deduplicationService;
        this.summaryExtractionService = summaryExtractionService;
    }

    /**
     * 聚合当天最新资讯
     * 从所有数据源获取资讯，去重后返回
     */
    public List<News> aggregateTodaysNews() {
        return aggregateNews(LocalDateTime.now().withHour(0).withMinute(0).withSecond(0));
    }

    /**
     * 聚合指定时间后的资讯
     */
    public List<News> aggregateNews(LocalDateTime since) {
        if (newsProviderGateway == null) {
            return new ArrayList<>();
        }

        // 1. 从所有数据源获取资讯
        List<News> allNews = newsProviderGateway.fetchNewsFromAllSources(since);

        // 2. 去重
        List<News> deduplicatedNews = deduplicate(allNews);

        // 3. 提取摘要
        extractSummary(deduplicatedNews);

        // 4. 标记为已聚合
        for (News news : deduplicatedNews) {
            news.markAsAggregated();
        }

        return deduplicatedNews;
    }

    /**
     * 对资讯列表进行去重
     */
    public List<News> deduplicate(List<News> newsList) {
        if (deduplicationService == null) {
            return newsList;
        }
        return deduplicationService.deduplicate(newsList);
    }

    /**
     * 提取资讯摘要
     */
    public void extractSummary(List<News> newsList) {
        if (summaryExtractionService == null || newsList == null) {
            return;
        }
        summaryExtractionService.extractSummaries(newsList);
    }
}
