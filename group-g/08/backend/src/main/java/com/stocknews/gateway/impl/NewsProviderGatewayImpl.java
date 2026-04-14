package com.stocknews.gateway.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stocknews.domain.model.decision.ImpactFactor;
import com.stocknews.domain.model.decision.NewsCategory;
import com.stocknews.domain.model.decision.SourceType;
import com.stocknews.domain.model.news.*;
import com.stocknews.gateway.NewsProviderGateway;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 数据源网关实现 - 防腐层
 * 当前使用 Mock 数据，可随时切换为真实爬虫/API实现
 */
@Component
public class NewsProviderGatewayImpl implements NewsProviderGateway {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final List<Map<String, Object>> mockData;
    
    public NewsProviderGatewayImpl() {
        this.mockData = loadMockData();
    }
    
    @Override
    public List<News> fetchNewsFromAllSources(LocalDateTime since) {
        // 当前返回 Mock 数据，可随时替换为真实数据源
        return mockData.stream()
            .filter(data -> {
                String publishedAtStr = (String) data.get("publishedAt");
                if (publishedAtStr != null) {
                    try {
                        LocalDateTime publishedAt = LocalDateTime.parse(publishedAtStr, 
                            DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                        return publishedAt.isAfter(since);
                    } catch (Exception ignored) {}
                }
                return true;
            })
            .map(this::convertToNews)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<News> fetchNewsFromSource(String providerName, LocalDateTime since) {
        return fetchNewsFromAllSources(since).stream()
            .filter(news -> news.getSource() != null && 
                    providerName.equals(news.getSource().getProviderName()))
            .collect(Collectors.toList());
    }
    
    @Override
    public void configureProvider(String providerName, Object config) {
        // 配置数据源（预留接口）
    }
    
    @Override
    public List<String> getEnabledProviderNames() {
        return Arrays.asList("新浪财经", "东方财富", "mock");
    }
    
    private List<Map<String, Object>> loadMockData() {
        try {
            ClassPathResource resource = new ClassPathResource("mock-news.json");
            return objectMapper.readValue(resource.getInputStream(), 
                new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }
    
    @SuppressWarnings("unchecked")
    private News convertToNews(Map<String, Object> data) {
        String id = (String) data.get("id");
        String title = (String) data.get("title");
        String content = (String) data.get("content");
        String summary = (String) data.get("summary");
        String categoryStr = (String) data.get("category");
        
        Map<String, Object> sourceMap = (Map<String, Object>) data.get("source");
        String providerName = sourceMap != null ? (String) sourceMap.get("providerName") : "未知来源";
        String sourceUrl = sourceMap != null ? (String) sourceMap.get("sourceUrl") : null;
        String sourceTypeStr = sourceMap != null ? (String) sourceMap.get("type") : "CRAWLER";
        
        News news = new News(
            new NewsId(id),
            new NewsTitle(title),
            new NewsContent(content),
            new NewsSource(providerName, sourceUrl, SourceType.valueOf(sourceTypeStr))
        );
        
        news.setSummary(summary);
        news.setCategory(NewsCategory.fromString(categoryStr));
        
        // 设置发布时间
        String publishedAtStr = (String) data.get("publishedAt");
        if (publishedAtStr != null) {
            try {
                news.setPublishedAt(LocalDateTime.parse(publishedAtStr, 
                    DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            } catch (Exception ignored) {}
        }
        
        // 设置相关股票
        List<String> stocks = (List<String>) data.get("relatedStocks");
        if (stocks != null) {
            news.setRelatedStocks(new HashSet<>(stocks));
        }
        
        // 设置相关板块
        List<String> sectors = (List<String>) data.get("relatedSectors");
        if (sectors != null) {
            news.setRelatedSectors(new HashSet<>(sectors));
        }
        
        // 设置影响因子
        Map<String, Object> impactMap = (Map<String, Object>) data.get("impactFactor");
        if (impactMap != null) {
            String factorName = (String) impactMap.get("factorName");
            Double weight = impactMap.get("weight") != null ? 
                ((Number) impactMap.get("weight")).doubleValue() : 0.5;
            news.setImpactFactor(new ImpactFactor(factorName, weight, news.getCategory()));
        }
        
        return news;
    }
}
