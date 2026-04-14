package com.stocknews;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 股市资讯推送系统启动类
 * DDD架构 - 分层：接口层 -> 应用层 -> 领域层 -> 防腐层 -> 基础设施层
 */
@SpringBootApplication
@EnableScheduling
public class StockNewsApplication {
    public static void main(String[] args) {
        SpringApplication.run(StockNewsApplication.class, args);
    }
}
