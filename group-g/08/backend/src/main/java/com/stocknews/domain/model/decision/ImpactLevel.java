package com.stocknews.domain.model.decision;

/**
 * 影响程度枚举
 * 用于决策模型评估资讯对股市的影响程度
 */
public enum ImpactLevel {
    CRITICAL(5, "极高影响", "重大利好/利空，可能引发市场大幅波动"),
    HIGH(4, "高影响", "显著利好/利空，可能影响板块走势"),
    MEDIUM(3, "中等影响", "一般利好/利空，可能影响个股走势"),
    LOW(2, "低影响", "轻微利好/利空，短期波动"),
    MINIMAL(1, "微弱影响", "几乎无影响");
    
    private final int level;
    private final String name;
    private final String description;

    ImpactLevel(int level, String name, String description) {
        this.level = level;
        this.name = name;
        this.description = description;
    }

    public int getLevel() {
        return level;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }
    
    public boolean isAtLeast(ImpactLevel other) {
        return this.level >= other.level;
    }
    
    public static ImpactLevel fromLevel(int level) {
        for (ImpactLevel il : values()) {
            if (il.level == level) {
                return il;
            }
        }
        return MINIMAL;
    }
}
