package com.stocknews.domain.repository;

import com.stocknews.domain.model.decision.UserPreference;

import java.util.Optional;

/**
 * 用户偏好仓储接口 - 领域层定义
 */
public interface UserPreferenceRepository {
    
    /**
     * 保存用户偏好
     */
    UserPreference save(UserPreference preference);
    
    /**
     * 根据用户ID查找偏好
     */
    Optional<UserPreference> findByUserId(String userId);
    
    /**
     * 根据用户ID删除偏好
     */
    void deleteByUserId(String userId);
}
