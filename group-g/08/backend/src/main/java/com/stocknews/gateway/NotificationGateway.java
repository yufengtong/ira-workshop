package com.stocknews.gateway;

import com.stocknews.domain.model.news.News;

import java.util.List;

/**
 * 通知网关接口 - 防腐层
 * 领域层通过此接口发送通知，不依赖具体的实现
 */
public interface NotificationGateway {
    
    /**
     * 发送资讯摘要
     * @param email 收件人邮箱
     * @param subject 邮件主题
     * @param newsList 资讯列表
     */
    void sendSummary(String email, String subject, List<News> newsList);
    
    /**
     * 发送普通通知
     * @param email 收件人邮箱
     * @param subject 主题
     * @param content 内容
     */
    void sendNotification(String email, String subject, String content);
    
    /**
     * 发送高影响资讯提醒
     * @param email 收件人邮箱
     * @param news 高影响资讯
     */
    void sendHighImpactAlert(String email, News news);
}
