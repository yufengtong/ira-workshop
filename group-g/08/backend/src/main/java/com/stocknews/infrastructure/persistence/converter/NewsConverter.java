package com.stocknews.infrastructure.persistence.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stocknews.domain.model.decision.ImpactFactor;
import com.stocknews.domain.model.decision.NewsCategory;
import com.stocknews.domain.model.decision.SourceType;
import com.stocknews.domain.model.news.*;
import com.stocknews.infrastructure.persistence.po.NewsPO;

import java.util.HashSet;
import java.util.Set;

/**
 * 资讯转换器 - 领域对象与PO转换
 */
public class NewsConverter {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 领域对象转PO
     */
    public static NewsPO toPO(News news) {
        if (news == null) return null;
        
        NewsPO po = new NewsPO();
        po.setId(news.getId().getId());
        po.setTitle(news.getTitle().getTitle());
        po.setContent(news.getContent().getContent());
        po.setSummary(news.getSummary());
        
        if (news.getSource() != null) {
            po.setProviderName(news.getSource().getProviderName());
            po.setSourceUrl(news.getSource().getSourceUrl());
            po.setSourceType(news.getSource().getType().name());
        }
        
        if (news.getCategory() != null) {
            po.setCategory(news.getCategory().name());
        }
        
        if (news.getStatus() != null) {
            po.setStatus(news.getStatus().name());
        }
        
        if (news.getImpactFactor() != null) {
            po.setImpactFactorName(news.getImpactFactor().getFactorName());
            po.setImpactFactorWeight(news.getImpactFactor().getWeight());
        }
        
        if (news.getRelatedStocks() != null && !news.getRelatedStocks().isEmpty()) {
            po.setRelatedStocks(toJson(news.getRelatedStocks()));
        }
        
        if (news.getRelatedSectors() != null && !news.getRelatedSectors().isEmpty()) {
            po.setRelatedSectors(toJson(news.getRelatedSectors()));
        }
        
        po.setPublishedAt(news.getPublishedAt());
        
        return po;
    }
    
    /**
     * PO转领域对象
     */
    public static News toDomain(NewsPO po) {
        if (po == null) return null;
        
        NewsId id = new NewsId(po.getId());
        NewsTitle title = new NewsTitle(po.getTitle());
        NewsContent content = new NewsContent(po.getContent());
        
        SourceType sourceType = SourceType.CRAWLER;
        if (po.getSourceType() != null) {
            try {
                sourceType = SourceType.valueOf(po.getSourceType());
            } catch (IllegalArgumentException ignored) {}
        }
        
        NewsSource source = new NewsSource(
            po.getProviderName() != null ? po.getProviderName() : "未知来源",
            po.getSourceUrl(),
            sourceType
        );
        
        News news = new News(id, title, content, source);
        
        if (po.getSummary() != null) {
            news.setSummary(po.getSummary());
        }
        
        if (po.getCategory() != null) {
            news.setCategory(NewsCategory.fromString(po.getCategory()));
        }
        
        if (po.getStatus() != null) {
            try {
                news.setStatus(NewsStatus.valueOf(po.getStatus()));
            } catch (IllegalArgumentException ignored) {}
        }
        
        if (po.getImpactFactorName() != null && po.getImpactFactorWeight() != null) {
            ImpactFactor factor = new ImpactFactor(
                po.getImpactFactorName(),
                po.getImpactFactorWeight(),
                news.getCategory()
            );
            news.setImpactFactor(factor);
        }
        
        if (po.getRelatedStocks() != null) {
            Set<String> stocks = fromJson(po.getRelatedStocks());
            news.setRelatedStocks(stocks);
        }
        
        if (po.getRelatedSectors() != null) {
            Set<String> sectors = fromJson(po.getRelatedSectors());
            news.setRelatedSectors(sectors);
        }
        
        if (po.getPublishedAt() != null) {
            news.setPublishedAt(po.getPublishedAt());
        }
        
        return news;
    }
    
    private static String toJson(Set<String> set) {
        try {
            return objectMapper.writeValueAsString(set);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }
    
    private static Set<String> fromJson(String json) {
        try {
            return new HashSet<>(objectMapper.readValue(json, new TypeReference<Set<String>>() {}));
        } catch (JsonProcessingException e) {
            return new HashSet<>();
        }
    }
}
