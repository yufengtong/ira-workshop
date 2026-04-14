package com.stocknews.domain.model.news;

import java.io.Serializable;
import java.util.Objects;

/**
 * 资讯标题值对象
 */
public class NewsTitle implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final int MAX_LENGTH = 500;
    
    private final String title;

    public NewsTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("资讯标题不能为空");
        }
        if (title.length() > MAX_LENGTH) {
            throw new IllegalArgumentException("资讯标题长度不能超过" + MAX_LENGTH + "字符");
        }
        this.title = title;
    }

    public String getTitle() {
        return title;
    }
    
    public int length() {
        return title.length();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        NewsTitle newsTitle = (NewsTitle) o;
        return Objects.equals(title, newsTitle.title);
    }

    @Override
    public int hashCode() {
        return Objects.hash(title);
    }

    @Override
    public String toString() {
        return title;
    }
}
