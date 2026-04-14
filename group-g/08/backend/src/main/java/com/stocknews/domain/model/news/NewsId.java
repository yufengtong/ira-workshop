package com.stocknews.domain.model.news;

import java.io.Serializable;
import java.util.Objects;

/**
 * 资讯ID值对象
 */
public class NewsId implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final String id;

    public NewsId(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("资讯ID不能为空");
        }
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        NewsId newsId = (NewsId) o;
        return Objects.equals(id, newsId.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return id;
    }
}
