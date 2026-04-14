package com.stocknews.domain.model.news;

import java.io.Serializable;
import java.util.Objects;

/**
 * 资讯内容值对象
 */
public class NewsContent implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final int MAX_LENGTH = 50000;
    
    private final String content;

    public NewsContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("资讯内容不能为空");
        }
        if (content.length() > MAX_LENGTH) {
            throw new IllegalArgumentException("资讯内容长度不能超过" + MAX_LENGTH + "字符");
        }
        this.content = content;
    }

    public String getContent() {
        return content;
    }
    
    public int length() {
        return content.length();
    }
    
    /**
     * 获取内容摘要（前N个字符）
     */
    public String getSummary(int maxLength) {
        if (content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + "...";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        NewsContent that = (NewsContent) o;
        return Objects.equals(content, that.content);
    }

    @Override
    public int hashCode() {
        return Objects.hash(content);
    }

    @Override
    public String toString() {
        return content;
    }
}
