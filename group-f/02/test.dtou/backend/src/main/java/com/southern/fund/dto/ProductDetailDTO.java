package com.southern.fund.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailDTO {
    
    private String tsCode;
    
    private String name;
    
    private String fundType;
    
    private String industryName;
    
    private String status;
    
    private String statusDesc;
    
    private BigDecimal asset;
    
    private String establishDate;
}
