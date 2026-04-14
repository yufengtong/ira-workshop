package com.southern.fund.controller;

import com.southern.fund.dto.BestPracticeDTO;
import com.southern.fund.dto.MarketGapDTO;
import com.southern.fund.service.StrategyAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/analysis")
public class AnalysisController {
    
    @Autowired
    private StrategyAnalysisService strategyAnalysisService;
    
    @GetMapping("/gaps")
    public ResponseEntity<List<MarketGapDTO>> analyzeMarketGaps() {
        return ResponseEntity.ok(strategyAnalysisService.analyzeMarketGaps());
    }
    
    @GetMapping("/best-practices")
    public ResponseEntity<List<BestPracticeDTO>> getBestPractices() {
        return ResponseEntity.ok(strategyAnalysisService.getBestPractices());
    }
    
    @PostMapping("/company/{companyCode}/analyze")
    public ResponseEntity<Void> analyzeCompanyStrategy(@PathVariable String companyCode) {
        strategyAnalysisService.analyzeCompanyStrategy(companyCode);
        return ResponseEntity.ok().build();
    }
}
