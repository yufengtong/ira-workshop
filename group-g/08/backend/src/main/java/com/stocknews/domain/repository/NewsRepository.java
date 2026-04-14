package com.stocknews.domain.repository;

import com.stocknews.domain.model.news.News;
import com.stocknews.domain.model.news.NewsId;
import com.stocknews.domain.model.news.NewsStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 资讯仓储接口 - 领域层定义
 */
public interface NewsRepository {
    
    /**
     * 保存资讯
     */
    News save(News news);
    
    /**
     * 批量保存资讯
     */
    List<News> saveAll(List<News> newsList);
    
    /**
     * 根据ID查找资讯
     */
    Optional<News> findById(NewsId id);
    
    /**
     * 查找所有资讯
     */
    List<News> findAll();
    
    /**
     * 根据状态查找资讯
     */
    List<News> findByStatus(NewsStatus status);
    
    /**
     * 查找指定时间之后的资讯
     */
    List<News> findByPublishedAtAfter(LocalDateTime dateTime);
    
    /**
     * 查找指定时间范围内的资讯
     */
    List<News> findByPublishedAtBetween(LocalDateTime start, LocalDateTime end);
    
    /**
     * 根据ID删除资讯
     */
    void deleteById(NewsId id);
    
    /**
     * 删除所有资讯
     */
    void deleteAll();
    
    /**
     * 统计资讯数量
     */
    long count();
}
