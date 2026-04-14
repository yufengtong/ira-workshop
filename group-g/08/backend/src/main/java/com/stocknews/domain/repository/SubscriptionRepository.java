package com.stocknews.domain.repository;

import com.stocknews.domain.model.subscription.Email;
import com.stocknews.domain.model.subscription.Subscription;
import com.stocknews.domain.model.subscription.SubscriptionId;

import java.util.List;
import java.util.Optional;

/**
 * 订阅仓储接口 - 领域层定义
 */
public interface SubscriptionRepository {
    
    /**
     * 保存订阅
     */
    Subscription save(Subscription subscription);
    
    /**
     * 根据ID查找订阅
     */
    Optional<Subscription> findById(SubscriptionId id);
    
    /**
     * 根据邮箱查找订阅
     */
    Optional<Subscription> findByEmail(Email email);
    
    /**
     * 查找所有活跃订阅
     */
    List<Subscription> findByActiveTrue();
    
    /**
     * 查找所有订阅
     */
    List<Subscription> findAll();
    
    /**
     * 删除订阅
     */
    void deleteById(SubscriptionId id);
    
    /**
     * 统计订阅数量
     */
    long count();
}
