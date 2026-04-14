package com.stocknews.domain.model.decision;

/**
 * 资讯分类枚举
 * 用于决策模型的影响因子计算
 */
public enum NewsCategory {
    POLICY("政策", "宏观政策、监管政策等"),
    COMPANY("公司", "上市公司公告、业绩、重大事件等"),
    INDUSTRY("行业", "行业动态、发展趋势等"),
    MACRO("宏观", "宏观经济、国际形势等");
    
    private final String name;
    private final String description;

    NewsCategory(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }
    
    public static NewsCategory fromString(String text) {
        if (text == null) return null;
        for (NewsCategory category : NewsCategory.values()) {
            if (category.name().equalsIgnoreCase(text) || 
                category.name.equals(text)) {
                return category;
            }
        }
        return null;
    }
}
