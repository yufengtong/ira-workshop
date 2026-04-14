package com.stock.model;

import lombok.Data;

@Data
public class KLineData {
    private String day;      // 日期
    private Double open;     // 开盘价
    private Double high;     // 最高价
    private Double low;      // 最低价
    private Double close;    // 收盘价
    private Long volume;     // 成交量
}
