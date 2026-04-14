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
public class IndustryDistributionDTO {
    
    private String industryCode;
    
    private String industryName;
    
    private Integer productCount;
    
    private BigDecimal totalAsset;
    
    private Integer companyCount;
    
    private BigDecimal marketShare;
}
