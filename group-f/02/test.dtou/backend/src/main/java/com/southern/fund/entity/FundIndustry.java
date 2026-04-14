package com.southern.fund.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("fund_industry")
public class FundIndustry {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String industryCode;
    
    private String industryName;
    
    private String parentCode;
    
    private Integer level;
    
    private String description;
    
    private Integer sortOrder;
    
    private Integer deleted;
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;
}
