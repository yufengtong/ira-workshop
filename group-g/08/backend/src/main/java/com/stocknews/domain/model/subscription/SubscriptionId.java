package com.stocknews.domain.model.subscription;

import java.io.Serializable;
import java.util.Objects;

/**
 * 订阅ID值对象
 */
public class SubscriptionId implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private final String id;

    public SubscriptionId(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("订阅ID不能为空");
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
        SubscriptionId that = (SubscriptionId) o;
        return Objects.equals(id, that.id);
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
