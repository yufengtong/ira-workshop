package com.southern.fund.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("company_strategy")
public class CompanyStrategy {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String companyCode;
    
    private String strategyType;
    
    private String strategyName;
    
    private BigDecimal concentrationScore;
    
    private BigDecimal diversificationScore;
    
    private BigDecimal innovationScore;
    
    private String analysisDesc;
    
    private String strengthIndustries;
    
    private String weaknessIndustries;
    
    private String opportunities;
    
    private Integer deleted;
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;
}
