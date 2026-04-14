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
public class MarketGapDTO {
    
    private String industryCode;
    
    private String industryName;
    
    private Integer currentProducts;
    
    private Integer potentialDemand;
    
    private BigDecimal opportunityScore;
    
    private String recommendation;
}
