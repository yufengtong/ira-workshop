package com.southern.fund.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BestPracticeDTO {
    
    private String companyCode;
    
    private String companyName;
    
    private String strategyType;
    
    private String highlight;
    
    private BigDecimal performanceScore;
    
    private List<String> keyStrengths;
    
    private String learnings;
}
