package com.stocknews.domain.model.subscription;

import com.stocknews.domain.model.decision.UserPreference;

import java.io.Serializable;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * 订阅聚合根
 * 管理用户的订阅信息和偏好设置
 */
public class Subscription implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final SubscriptionId id;
    private Email email;
    private PushFrequency frequency;
    private Set<String> watchStocks;
    private UserPreference preference;  // 用户偏好
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime lastPushedAt;

    public Subscription(SubscriptionId id, Email email, PushFrequency frequency) {
        if (id == null) {
            throw new IllegalArgumentException("订阅ID不能为空");
        }
        if (email == null) {
            throw new IllegalArgumentException("邮箱不能为空");
        }
        this.id = id;
        this.email = email;
        this.frequency = frequency != null ? frequency : PushFrequency.DAILY;
        this.watchStocks = new HashSet<>();
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    // Getters
    public SubscriptionId getId() {
        return id;
    }

    public Email getEmail() {
        return email;
    }

    public PushFrequency getFrequency() {
        return frequency;
    }

    public Set<String> getWatchStocks() {
        return watchStocks;
    }

    public UserPreference getPreference() {
        return preference;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getLastPushedAt() {
        return lastPushedAt;
    }

    // Setters
    public void setEmail(Email email) {
        this.email = email;
    }

    public void setFrequency(PushFrequency frequency) {
        this.frequency = frequency;
    }

    public void setWatchStocks(Set<String> watchStocks) {
        this.watchStocks = watchStocks != null ? new HashSet<>(watchStocks) : new HashSet<>();
    }

    public void setPreference(UserPreference preference) {
        this.preference = preference;
    }

    // 领域行为
    
    /**
     * 判断在指定时间是否应该推送
     */
    public boolean shouldPushOn(LocalDateTime time) {
        if (!active) {
            return false;
        }
        
        switch (frequency) {
            case REALTIME:
                return true;
            case DAILY:
                // 每天上午9点推送
                return time.getHour() == 9 && time.getMinute() == 0;
            case WEEKLY:
                // 每周一上午9点推送
                return time.getDayOfWeek() == DayOfWeek.MONDAY && 
                       time.getHour() == 9 && time.getMinute() == 0;
            case MANUAL:
                return false;
            default:
                return false;
        }
    }
    
    /**
     * 激活订阅
     */
    public void activate() {
        this.active = true;
    }
    
    /**
     * 停用订阅
     */
    public void deactivate() {
        this.active = false;
    }
    
    /**
     * 更新用户偏好
     */
    public void updatePreference(UserPreference newPreference) {
        this.preference = newPreference;
    }
    
    /**
     * 记录推送时间
     */
    public void recordPush() {
        this.lastPushedAt = LocalDateTime.now();
    }
    
    /**
     * 添加关注股票
     */
    public void addWatchStock(String stockCode) {
        if (stockCode != null && !stockCode.trim().isEmpty()) {
            this.watchStocks.add(stockCode);
        }
    }
    
    /**
     * 移除关注股票
     */
    public void removeWatchStock(String stockCode) {
        this.watchStocks.remove(stockCode);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Subscription that = (Subscription) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Subscription{" +
                "id=" + id +
                ", email=" + email +
                ", frequency=" + frequency +
                ", active=" + active +
                '}';
    }
}
