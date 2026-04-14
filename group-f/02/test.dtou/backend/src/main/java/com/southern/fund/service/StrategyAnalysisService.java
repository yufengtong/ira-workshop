package com.southern.fund.service;

import com.southern.fund.dto.BestPracticeDTO;
import com.southern.fund.dto.MarketGapDTO;

import java.util.List;

public interface StrategyAnalysisService {
    
    List<MarketGapDTO> analyzeMarketGaps();
    
    List<BestPracticeDTO> getBestPractices();
    
    void analyzeCompanyStrategy(String companyCode);
}
