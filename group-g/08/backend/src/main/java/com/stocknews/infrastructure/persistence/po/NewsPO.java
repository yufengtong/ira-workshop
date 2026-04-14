package com.stocknews.infrastructure.persistence.po;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 资讯持久化对象
 */
@Entity
@Table(name = "news")
public class NewsPO {
    
    @Id
    @Column(length = 100)
    private String id;
    
    @Column(length = 500, nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(length = 500)
    private String summary;
    
    @Column(length = 100)
    private String providerName;
    
    @Column(length = 500)
    private String sourceUrl;
    
    @Column(length = 20)
    private String sourceType;
    
    @Column(length = 20)
    private String category;
    
    @Column(length = 20)
    private String status;
    
    @Column(length = 100)
    private String impactFactorName;
    
    private Double impactFactorWeight;
    
    @Column(length = 500)
    private String relatedStocks;  // JSON array string
    
    @Column(length = 500)
    private String relatedSectors; // JSON array string
    
    private LocalDateTime publishedAt;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    // Default constructor
    public NewsPO() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getImpactFactorName() { return impactFactorName; }
    public void setImpactFactorName(String impactFactorName) { this.impactFactorName = impactFactorName; }
    
    public Double getImpactFactorWeight() { return impactFactorWeight; }
    public void setImpactFactorWeight(Double impactFactorWeight) { this.impactFactorWeight = impactFactorWeight; }
    
    public String getRelatedStocks() { return relatedStocks; }
    public void setRelatedStocks(String relatedStocks) { this.relatedStocks = relatedStocks; }
    
    public String getRelatedSectors() { return relatedSectors; }
    public void setRelatedSectors(String relatedSectors) { this.relatedSectors = relatedSectors; }
    
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
