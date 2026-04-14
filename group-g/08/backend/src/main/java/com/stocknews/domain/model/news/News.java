package com.stocknews.domain.model.news;

import com.stocknews.domain.model.decision.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * 资讯聚合根
 * 核心领域模型，包含资讯的所有信息和业务行为
 */
public class News implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final NewsId id;
    private NewsTitle title;
    private NewsContent content;
    private String summary;
    private NewsSource source;            // 来源（含URL）
    private LocalDateTime publishedAt;
    private NewsStatus status;
    private Set<String> relatedStocks;
    private Set<String> relatedSectors;
    private NewsCategory category;        // 资讯分类
    private ImpactFactor impactFactor;    // 影响因子

    public News(NewsId id, NewsTitle title, NewsContent content, NewsSource source) {
        if (id == null) {
            throw new IllegalArgumentException("资讯ID不能为空");
        }
        if (title == null) {
            throw new IllegalArgumentException("资讯标题不能为空");
        }
        if (content == null) {
            throw new IllegalArgumentException("资讯内容不能为空");
        }
        this.id = id;
        this.title = title;
        this.content = content;
        this.source = source;
        this.status = NewsStatus.NEW;
        this.relatedStocks = new HashSet<>();
        this.relatedSectors = new HashSet<>();
        this.publishedAt = LocalDateTime.now();
    }

    // Getters
    public NewsId getId() {
        return id;
    }

    public NewsTitle getTitle() {
        return title;
    }

    public NewsContent getContent() {
        return content;
    }

    public String getSummary() {
        return summary;
    }

    public NewsSource getSource() {
        return source;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public NewsStatus getStatus() {
        return status;
    }

    public Set<String> getRelatedStocks() {
        return relatedStocks;
    }

    public Set<String> getRelatedSectors() {
        return relatedSectors;
    }

    public NewsCategory getCategory() {
        return category;
    }

    public ImpactFactor getImpactFactor() {
        return impactFactor;
    }

    // Setters (领域行为)
    public void setTitle(NewsTitle title) {
        this.title = title;
    }

    public void setContent(NewsContent content) {
        this.content = content;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public void setSource(NewsSource source) {
        this.source = source;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public void setCategory(NewsCategory category) {
        this.category = category;
    }

    public void setImpactFactor(ImpactFactor impactFactor) {
        this.impactFactor = impactFactor;
    }

    public void setRelatedStocks(Set<String> relatedStocks) {
        this.relatedStocks = relatedStocks != null ? new HashSet<>(relatedStocks) : new HashSet<>();
    }

    public void setRelatedSectors(Set<String> relatedSectors) {
        this.relatedSectors = relatedSectors != null ? new HashSet<>(relatedSectors) : new HashSet<>();
    }
    
    // 领域行为方法
    
    /**
     * 判断与另一条资讯是否相似
     * 基于标题相似度简单判断
     */
    public boolean isSimilarTo(News other) {
        if (other == null || other.title == null) {
            return false;
        }
        // 简单的标题相似度判断
        String thisTitle = this.title.getTitle().toLowerCase();
        String otherTitle = other.title.getTitle().toLowerCase();
        
        // 计算公共子串长度占比
        int commonLength = longestCommonSubstring(thisTitle, otherTitle).length();
        int maxLength = Math.max(thisTitle.length(), otherTitle.length());
        double similarity = (double) commonLength / maxLength;
        
        return similarity > 0.6; // 60%相似度阈值
    }
    
    private String longestCommonSubstring(String s1, String s2) {
        int m = s1.length();
        int n = s2.length();
        int maxLen = 0;
        int endIndex = 0;
        
        int[][] dp = new int[m + 1][n + 1];
        
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    if (dp[i][j] > maxLen) {
                        maxLen = dp[i][j];
                        endIndex = i;
                    }
                }
            }
        }
        
        return s1.substring(endIndex - maxLen, endIndex);
    }
    
    /**
     * 标记为已推送
     */
    public void markAsSent() {
        this.status = NewsStatus.SENT;
    }
    
    /**
     * 标记为已分析
     */
    public void markAsAnalyzed() {
        this.status = NewsStatus.ANALYZED;
    }
    
    /**
     * 标记为已聚合
     */
    public void markAsAggregated() {
        this.status = NewsStatus.AGGREGATED;
    }
    
    /**
     * 生成摘要
     */
    public String generateSummary() {
        if (summary != null && !summary.isEmpty()) {
            return summary;
        }
        if (content != null) {
            return content.getSummary(100);
        }
        return title.getTitle();
    }
    
    /**
     * 根据用户偏好评估影响程度
     */
    public ImpactLevel assessImpact(UserPreference preference) {
        if (preference == null) {
            return ImpactLevel.MINIMAL;
        }
        return preference.assessNewsImpact(this);
    }
    
    /**
     * 添加相关股票
     */
    public void addRelatedStock(String stockCode) {
        if (stockCode != null && !stockCode.trim().isEmpty()) {
            this.relatedStocks.add(stockCode);
        }
    }
    
    /**
     * 添加相关板块
     */
    public void addRelatedSector(String sector) {
        if (sector != null && !sector.trim().isEmpty()) {
            this.relatedSectors.add(sector);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        News news = (News) o;
        return Objects.equals(id, news.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "News{" +
                "id=" + id +
                ", title=" + title +
                ", category=" + category +
                ", status=" + status +
                '}';
    }
}
