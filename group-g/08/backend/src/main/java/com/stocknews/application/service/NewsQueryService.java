package com.stocknews.application.service;

import com.stocknews.domain.model.decision.UserPreference;
import com.stocknews.domain.model.news.News;
import com.stocknews.domain.service.DeduplicationService;
import com.stocknews.domain.service.ImpactAssessmentService;
import com.stocknews.domain.service.NewsAggregationService;
import com.stocknews.gateway.NewsProviderGateway;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 资讯查询应用服务
 */
@Service
public class NewsQueryService {
    
    private final NewsProviderGateway newsProviderGateway;
    private final DeduplicationService deduplicationService;
    private final ImpactAssessmentService impactAssessmentService;
    
    public NewsQueryService(NewsProviderGateway newsProviderGateway,
                            DeduplicationService deduplicationService,
                            ImpactAssessmentService impactAssessmentService) {
        this.newsProviderGateway = newsProviderGateway;
        this.deduplicationService = deduplicationService;
        this.impactAssessmentService = impactAssessmentService;
    }
    
    /**
     * 获取最新资讯列表
     */
    public List<News> getLatestNews() {
        List<News> news = newsProviderGateway.fetchNewsFromAllSources(
            LocalDateTime.now().minusDays(1)
        );
        return deduplicationService.deduplicate(news);
    }
    
    /**
     * 获取高影响资讯
     */
    public List<News> getHighImpactNews(UserPreference preference) {
        List<News> allNews = getLatestNews();
        return impactAssessmentService.filterHighImpactNews(allNews, preference);
    }
    
    /**
     * 根据来源筛选资讯
     */
    public List<News> getNewsBySource(String providerName) {
        return newsProviderGateway.fetchNewsFromSource(
            providerName, 
            LocalDateTime.now().minusDays(1)
        );
    }
}
