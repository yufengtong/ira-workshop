package com.stocknews.domain.model.decision;

/**
 * 走势方向枚举
 */
public enum TrendDirection {
    UP("上涨"),
    DOWN("下跌"),
    FLAT("横盘");
    
    private final String name;

    TrendDirection(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
