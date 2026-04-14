package com.southern.fund;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
@MapperScan("com.southern.fund.mapper")
public class FundStrategyApplication {
    public static void main(String[] args) {
        SpringApplication.run(FundStrategyApplication.class, args);
    }
}
