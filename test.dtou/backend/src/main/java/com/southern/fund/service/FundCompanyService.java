package com.southern.fund.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.southern.fund.dto.CompanyProductDTO;
import com.southern.fund.dto.StrategyAnalysisDTO;
import com.southern.fund.entity.FundCompany;

import java.util.List;

public interface FundCompanyService extends IService<FundCompany> {
    
    List<FundCompany> getAllActiveCompanies();
    
    CompanyProductDTO getCompanyProducts(String companyCode);
    
    StrategyAnalysisDTO getCompanyStrategy(String companyCode);
}
