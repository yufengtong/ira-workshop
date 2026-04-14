package com.southern.fund.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProductDTO {
    
    private String companyCode;
    
    private String companyName;
    
    private Integer totalProducts;
    
    private Integer operatingCount;
    
    private Integer pendingCount;
    
    private Integer reportingCount;
    
    private BigDecimal totalAsset;
    
    private String strategyType;
    
    private String strategyDesc;
    
    private List<ProductDetailDTO> products;
    
    private Map<String, Integer> industryDistribution;
}
