package com.southern.fund.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("fund_product")
public class FundProduct {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String tsCode;
    
    private String name;
    
    private String shortName;
    
    private String companyCode;
    
    private String companyName;
    
    private String fundType;
    
    private String investType;
    
    private String industryCode;
    
    private String industryName;
    
    private String status;
    
    private BigDecimal asset;
    
    private String establishDate;
    
    private String issueDate;
    
    private String dueDate;
    
    private String listDate;
    
    private Integer deleted;
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;
}
