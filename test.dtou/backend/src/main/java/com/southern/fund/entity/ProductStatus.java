package com.southern.fund.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("product_status")
public class ProductStatus {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String tsCode;
    
    private String status;
    
    private String statusDesc;
    
    private String reportDate;
    
    private String approveDate;
    
    private String issueDate;
    
    private String endDate;
    
    private String remark;
    
    private Integer deleted;
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;
}
