package com.southern.fund.controller;

import com.southern.fund.dto.IndustryDistributionDTO;
import com.southern.fund.entity.FundIndustry;
import com.southern.fund.service.FundIndustryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/industries")
public class IndustryController {
    
    @Autowired
    private FundIndustryService fundIndustryService;
    
    @GetMapping
    public ResponseEntity<List<FundIndustry>> getIndustries(
            @RequestParam(required = false) Integer level) {
        List<FundIndustry> industries;
        if (level != null) {
            industries = fundIndustryService.getIndustriesByLevel(level);
        } else {
            industries = fundIndustryService.list();
        }
        return ResponseEntity.ok(industries);
    }
    
    @GetMapping("/distribution")
    public ResponseEntity<List<IndustryDistributionDTO>> getIndustryDistribution() {
        return ResponseEntity.ok(fundIndustryService.getIndustryDistribution());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FundIndustry> getIndustryById(@PathVariable Long id) {
        FundIndustry industry = fundIndustryService.getById(id);
        if (industry == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(industry);
    }
}
