package com.stocknews.domain.service;

import com.stocknews.domain.model.news.News;
import com.stocknews.domain.model.news.NewsContent;

/**
 * 摘要提炼服务 - 领域服务
 * 从资讯内容中提取关键信息生成摘要
 */
public class SummaryExtractionService {

    private static final int DEFAULT_SUMMARY_LENGTH = 100;
    private final int summaryLength;

    public SummaryExtractionService(int summaryLength) {
        this.summaryLength = summaryLength;
    }

    public SummaryExtractionService() {
        this(DEFAULT_SUMMARY_LENGTH);
    }

    /**
     * 提取资讯摘要
     * @param news 资讯对象
     * @return 摘要文本
     */
    public String extractSummary(News news) {
        if (news == null) {
            return "";
        }

        // 如果已有摘要，直接返回
        if (news.getSummary() != null && !news.getSummary().isEmpty()) {
            return news.getSummary();
        }

        // 从内容中提取摘要
        if (news.getContent() != null) {
            return extractFromContent(news.getContent().getContent());
        }

        // 最后使用标题
        return news.getTitle() != null ? news.getTitle().getTitle() : "";
    }

    /**
     * 从内容中提取摘要
     * 简单实现：取前N个字符
     */
    private String extractFromContent(String content) {
        if (content == null || content.isEmpty()) {
            return "";
        }

        // 移除HTML标签
        content = content.replaceAll("<[^>]+>", "");
        // 移除多余空白
        content = content.replaceAll("\\s+", " ").trim();

        if (content.length() <= summaryLength) {
            return content;
        }

        // 取前N个字符，在句子边界截断
        String truncated = content.substring(0, summaryLength);
        int lastPeriod = Math.max(
            truncated.lastIndexOf('。'),
            Math.max(truncated.lastIndexOf('！'), truncated.lastIndexOf('？'))
        );

        if (lastPeriod > summaryLength * 0.5) {
            return truncated.substring(0, lastPeriod + 1);
        }

        return truncated + "...";
    }

    /**
     * 批量提取摘要
     */
    public void extractSummaries(Iterable<News> newsList) {
        if (newsList == null) {
            return;
        }
        for (News news : newsList) {
            String summary = extractSummary(news);
            news.setSummary(summary);
        }
    }

    public int getSummaryLength() {
        return summaryLength;
    }
}
