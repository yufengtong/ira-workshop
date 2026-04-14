package com.stocknews.domain.model.news;

/**
 * 资讯状态枚举
 */
public enum NewsStatus {
    NEW("新建"),
    AGGREGATED("已聚合"),
    DEDUPLICATED("已去重"),
    ANALYZED("已分析"),
    SENT("已推送"),
    ARCHIVED("已归档");
    
    private final String name;

    NewsStatus(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
