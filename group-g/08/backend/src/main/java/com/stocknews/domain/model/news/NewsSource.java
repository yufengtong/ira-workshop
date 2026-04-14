package com.stocknews.domain.model.news;

import com.stocknews.domain.model.decision.SourceType;

import java.io.Serializable;
import java.util.Objects;

/**
 * 资讯来源值对象
 * 包含来源名称和原文链接，前端可点击跳转
 */
public class NewsSource implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final String providerName;    // 来源名称（如"新浪财经"）
    private final String sourceUrl;        // 原文链接
    private final SourceType type;         // 来源类型

    public NewsSource(String providerName, String sourceUrl, SourceType type) {
        if (providerName == null || providerName.trim().isEmpty()) {
            throw new IllegalArgumentException("来源名称不能为空");
        }
        this.providerName = providerName;
        this.sourceUrl = sourceUrl;
        this.type = type != null ? type : SourceType.CRAWLER;
    }

    public String getProviderName() {
        return providerName;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public SourceType getType() {
        return type;
    }
    
    public boolean hasSourceUrl() {
        return sourceUrl != null && !sourceUrl.trim().isEmpty();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        NewsSource that = (NewsSource) o;
        return Objects.equals(providerName, that.providerName) &&
               Objects.equals(sourceUrl, that.sourceUrl) &&
               type == that.type;
    }

    @Override
    public int hashCode() {
        return Objects.hash(providerName, sourceUrl, type);
    }

    @Override
    public String toString() {
        return "NewsSource{" +
                "providerName='" + providerName + '\'' +
                ", sourceUrl='" + sourceUrl + '\'' +
                ", type=" + type +
                '}';
    }
}
