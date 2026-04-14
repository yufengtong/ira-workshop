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
public class StrategyAnalysisDTO {
    
    private String companyCode;
    
    private String companyName;
    
    private String strategyType;
    
    private String strategyName;
    
    private BigDecimal concentrationScore;
    
    private BigDecimal diversificationScore;
    
    private BigDecimal innovationScore;
    
    private String analysisDesc;
    
    private List<String> strengthIndustries;
    
    private List<String> weaknessIndustries;
    
    private List<String> opportunities;
}
