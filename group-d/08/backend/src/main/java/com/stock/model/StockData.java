package com.stock.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "stock_data")
public class StockData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String code;        // 股票代码 sz002603
    
    @Column(nullable = false)
    private String name;        // 股票名称
    
    private Double currentPrice; // 当前价格
    
    private Double openPrice;    // 开盘价
    
    private Double preClose;     // 昨收价
    
    private Double highPrice;    // 最高价
    
    private Double lowPrice;     // 最低价
    
    private Long volume;         // 成交量
    
    private Double changePercent; // 涨跌幅
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
}
