package com.stocknews.interfaces.dto;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * 资讯数据传输对象
 */
public class NewsDTO {
    private String id;
    private String title;
    private String summary;
    private String content;
    private String providerName;
    private String sourceUrl;
    private String category;
    private String impactLevel;
    private Set<String> relatedStocks;
    private Set<String> relatedSectors;
    private LocalDateTime publishedAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getImpactLevel() { return impactLevel; }
    public void setImpactLevel(String impactLevel) { this.impactLevel = impactLevel; }
    
    public Set<String> getRelatedStocks() { return relatedStocks; }
    public void setRelatedStocks(Set<String> relatedStocks) { this.relatedStocks = relatedStocks; }
    
    public Set<String> getRelatedSectors() { return relatedSectors; }
    public void setRelatedSectors(Set<String> relatedSectors) { this.relatedSectors = relatedSectors; }
    
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
}
