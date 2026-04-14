package com.stocknews.domain.model.decision;

/**
 * 数据来源类型枚举
 */
public enum SourceType {
    CRAWLER("爬虫抓取"),
    API("API接口"),
    MOCK("模拟数据");
    
    private final String description;

    SourceType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
