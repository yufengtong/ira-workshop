package com.stocknews.domain.model.subscription;

/**
 * 推送频率枚举
 */
public enum PushFrequency {
    DAILY("每日推送"),
    WEEKLY("每周推送"),
    REALTIME("实时推送"),
    MANUAL("手动获取");
    
    private final String name;

    PushFrequency(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
