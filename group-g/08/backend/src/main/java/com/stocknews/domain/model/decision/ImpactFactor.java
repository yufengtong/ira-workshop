package com.stocknews.domain.model.decision;

import java.io.Serializable;
import java.util.Objects;

/**
 * 影响因子值对象
 * 用于评估资讯对股市的影响
 */
public class ImpactFactor implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final String factorName;      // 因子名称（如"政策利好"、"业绩超预期"）
    private final double weight;          // 权重（0-1）
    private final NewsCategory category;  // 关联的资讯分类

    public ImpactFactor(String factorName, double weight, NewsCategory category) {
        if (factorName == null || factorName.trim().isEmpty()) {
            throw new IllegalArgumentException("因子名称不能为空");
        }
        if (weight < 0 || weight > 1) {
            throw new IllegalArgumentException("权重必须在0-1之间");
        }
        this.factorName = factorName;
        this.weight = weight;
        this.category = category;
    }

    public String getFactorName() {
        return factorName;
    }

    public double getWeight() {
        return weight;
    }

    public NewsCategory getCategory() {
        return category;
    }
    
    /**
     * 计算该因子对特定资讯的影响值
     * @param categoryWeight 用户对该分类的权重偏好
     * @return 影响值（0-1）
     */
    public double calculateImpact(double categoryWeight) {
        return weight * categoryWeight;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ImpactFactor that = (ImpactFactor) o;
        return Double.compare(that.weight, weight) == 0 &&
               Objects.equals(factorName, that.factorName) &&
               category == that.category;
    }

    @Override
    public int hashCode() {
        return Objects.hash(factorName, weight, category);
    }

    @Override
    public String toString() {
        return "ImpactFactor{" +
                "factorName='" + factorName + '\'' +
                ", weight=" + weight +
                ", category=" + category +
                '}';
    }
}
