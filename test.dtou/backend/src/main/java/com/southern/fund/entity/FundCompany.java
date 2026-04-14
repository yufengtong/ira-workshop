package com.southern.fund.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("fund_company")
public class FundCompany {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String companyCode;
    
    private String companyName;
    
    private String shortName;
    
    private String establishDate;
    
    private BigDecimal totalAsset;
    
    private Integer productCount;
    
    private String strategyType;
    
    private String strategyDesc;
    
    private Integer deleted;
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;
}
