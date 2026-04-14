package com.southern.fund.controller;

import com.southern.fund.dto.CompanyProductDTO;
import com.southern.fund.dto.StrategyAnalysisDTO;
import com.southern.fund.entity.FundCompany;
import com.southern.fund.service.FundCompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/companies")
public class CompanyController {
    
    @Autowired
    private FundCompanyService fundCompanyService;
    
    @GetMapping
    public ResponseEntity<List<FundCompany>> getAllCompanies() {
        return ResponseEntity.ok(fundCompanyService.getAllActiveCompanies());
    }
    
    @GetMapping("/{companyCode}")
    public ResponseEntity<FundCompany> getCompanyByCode(@PathVariable String companyCode) {
        FundCompany company = fundCompanyService.getById(companyCode);
        if (company == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(company);
    }
    
    @GetMapping("/{companyCode}/products")
    public ResponseEntity<CompanyProductDTO> getCompanyProducts(@PathVariable String companyCode) {
        CompanyProductDTO dto = fundCompanyService.getCompanyProducts(companyCode);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }
    
    @GetMapping("/{companyCode}/strategy")
    public ResponseEntity<StrategyAnalysisDTO> getCompanyStrategy(@PathVariable String companyCode) {
        StrategyAnalysisDTO dto = fundCompanyService.getCompanyStrategy(companyCode);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }
}
