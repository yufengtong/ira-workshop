package com.stocknews.gateway;

import com.stocknews.domain.model.news.News;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 数据源网关接口 - 防腐层
 * 领域层通过此接口获取资讯，不依赖具体的实现
 */
public interface NewsProviderGateway {
    
    /**
     * 从所有配置的数据源获取资讯
     * @param since 获取该时间之后的资讯
     * @return 聚合后的资讯列表
     */
    List<News> fetchNewsFromAllSources(LocalDateTime since);
    
    /**
     * 从指定数据源获取资讯
     * @param providerName 数据源名称
     * @param since 获取该时间之后的资讯
     * @return 资讯列表
     */
    List<News> fetchNewsFromSource(String providerName, LocalDateTime since);
    
    /**
     * 配置数据源
     * @param providerName 数据源名称
     * @param config 配置信息
     */
    void configureProvider(String providerName, Object config);
    
    /**
     * 获取所有启用的数据源名称
     * @return 数据源名称列表
     */
    List<String> getEnabledProviderNames();
}
