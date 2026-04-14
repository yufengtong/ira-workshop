package com.stocknews.domain.model.subscription;

import java.io.Serializable;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * 邮箱值对象
 */
public class Email implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    
    private final String address;

    public Email(String address) {
        if (address == null || address.trim().isEmpty()) {
            throw new IllegalArgumentException("邮箱地址不能为空");
        }
        if (!EMAIL_PATTERN.matcher(address).matches()) {
            throw new IllegalArgumentException("邮箱格式不正确: " + address);
        }
        this.address = address.toLowerCase().trim();
    }

    public String getAddress() {
        return address;
    }
    
    public String getDomain() {
        int atIndex = address.indexOf('@');
        return atIndex > 0 ? address.substring(atIndex + 1) : "";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Email email = (Email) o;
        return Objects.equals(address, email.address);
    }

    @Override
    public int hashCode() {
        return Objects.hash(address);
    }

    @Override
    public String toString() {
        return address;
    }
}
