package com.stocknews.domain.model.decision;

import com.stocknews.domain.model.news.News;

import java.io.Serializable;
import java.util.*;

/**
 * 用户偏好值对象
 * 用于个性化资讯推送和影响程度评估
 */
public class UserPreference implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final String userId;
    private final Map<NewsCategory, Double> categoryWeights;  // 各分类权重偏好
    private final Set<String> focusStocks;      // 关注股票
    private final Set<String> focusSectors;     // 关注板块
    private final ImpactLevel pushThreshold;    // 推送阈值（只推送超过该影响程度的资讯）

    public UserPreference(String userId, Map<NewsCategory, Double> categoryWeights,
                          Set<String> focusStocks, Set<String> focusSectors,
                          ImpactLevel pushThreshold) {
        this.userId = userId;
        this.categoryWeights = categoryWeights != null ? new HashMap<>(categoryWeights) : new HashMap<>();
        this.focusStocks = focusStocks != null ? new HashSet<>(focusStocks) : new HashSet<>();
        this.focusSectors = focusSectors != null ? new HashSet<>(focusSectors) : new HashSet<>();
        this.pushThreshold = pushThreshold != null ? pushThreshold : ImpactLevel.MEDIUM;
        
        // 初始化默认分类权重
        initDefaultWeights();
    }
    
    private void initDefaultWeights() {
        if (categoryWeights.isEmpty()) {
            categoryWeights.put(NewsCategory.POLICY, 0.8);
            categoryWeights.put(NewsCategory.COMPANY, 0.7);
            categoryWeights.put(NewsCategory.INDUSTRY, 0.6);
            categoryWeights.put(NewsCategory.MACRO, 0.5);
        }
    }

    public String getUserId() {
        return userId;
    }

    public Map<NewsCategory, Double> getCategoryWeights() {
        return Collections.unmodifiableMap(categoryWeights);
    }

    public Set<String> getFocusStocks() {
        return Collections.unmodifiableSet(focusStocks);
    }

    public Set<String> getFocusSectors() {
        return Collections.unmodifiableSet(focusSectors);
    }

    public ImpactLevel getPushThreshold() {
        return pushThreshold;
    }
    
    public double getCategoryWeight(NewsCategory category) {
        return categoryWeights.getOrDefault(category, 0.5);
    }
    
    /**
     * 根据用户偏好评估资讯影响程度
     */
    public ImpactLevel assessNewsImpact(News news) {
        if (news == null || news.getCategory() == null) {
            return ImpactLevel.MINIMAL;
        }
        
        double baseWeight = getCategoryWeight(news.getCategory());
        double impactFactorWeight = news.getImpactFactor() != null ? 
            news.getImpactFactor().getWeight() : 0.5;
        
        // 检查是否关注相关股票或板块
        boolean isFocusRelated = isFocusRelated(news);
        if (isFocusRelated) {
            baseWeight *= 1.2; // 提升权重20%
        }
        
        double totalImpact = baseWeight * impactFactorWeight;
        
        // 映射到影响程度
        if (totalImpact >= 0.8) return ImpactLevel.CRITICAL;
        if (totalImpact >= 0.6) return ImpactLevel.HIGH;
        if (totalImpact >= 0.4) return ImpactLevel.MEDIUM;
        if (totalImpact >= 0.2) return ImpactLevel.LOW;
        return ImpactLevel.MINIMAL;
    }
    
    /**
     * 判断是否应该推送该资讯
     */
    public boolean shouldPush(News news) {
        ImpactLevel impact = assessNewsImpact(news);
        return impact.isAtLeast(pushThreshold);
    }
    
    private boolean isFocusRelated(News news) {
        // 检查相关股票
        if (news.getRelatedStocks() != null) {
            for (String stock : news.getRelatedStocks()) {
                if (focusStocks.contains(stock)) {
                    return true;
                }
            }
        }
        // 检查相关板块
        if (news.getRelatedSectors() != null) {
            for (String sector : news.getRelatedSectors()) {
                if (focusSectors.contains(sector)) {
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserPreference that = (UserPreference) o;
        return Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId);
    }
}
