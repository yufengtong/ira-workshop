package com.southern.fund.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.southern.fund.dto.CompanyProductDTO;
import com.southern.fund.dto.ProductDetailDTO;
import com.southern.fund.dto.StrategyAnalysisDTO;
import com.southern.fund.entity.CompanyStrategy;
import com.southern.fund.entity.FundCompany;
import com.southern.fund.entity.FundProduct;
import com.southern.fund.mapper.CompanyStrategyMapper;
import com.southern.fund.mapper.FundCompanyMapper;
import com.southern.fund.mapper.FundProductMapper;
import com.southern.fund.service.FundCompanyService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FundCompanyServiceImpl extends ServiceImpl<FundCompanyMapper, FundCompany> implements FundCompanyService {
    
    @Autowired
    private FundProductMapper fundProductMapper;
    
    @Autowired
    private CompanyStrategyMapper companyStrategyMapper;
    
    @Override
    public List<FundCompany> getAllActiveCompanies() {
        return baseMapper.selectAllActive();
    }
    
    @Override
    public CompanyProductDTO getCompanyProducts(String companyCode) {
        FundCompany company = baseMapper.selectById(companyCode);
        if (company == null) {
            return null;
        }
        
        List<FundProduct> products = fundProductMapper.selectByCompanyCode(companyCode);
        
        CompanyProductDTO dto = new CompanyProductDTO();
        dto.setCompanyCode(companyCode);
        dto.setCompanyName(company.getCompanyName());
        dto.setTotalProducts(products.size());
        dto.setStrategyType(company.getStrategyType());
        dto.setStrategyDesc(company.getStrategyDesc());
        dto.setTotalAsset(company.getTotalAsset());
        
        // 统计各状态产品数量
        int operating = 0, pending = 0, reporting = 0;
        Map<String, Integer> industryDist = new HashMap<>();
        List<ProductDetailDTO> productDetails = new ArrayList<>();
        
        for (FundProduct product : products) {
            ProductDetailDTO detail = new ProductDetailDTO();
            BeanUtils.copyProperties(product, detail);
            productDetails.add(detail);
            
            String status = product.getStatus();
            if ("运作中".equals(status)) {
                operating++;
            } else if ("待发售".equals(status)) {
                pending++;
            } else if ("上报中".equals(status)) {
                reporting++;
            }
            
            String industry = product.getIndustryName();
            if (industry != null) {
                industryDist.merge(industry, 1, Integer::sum);
            }
        }
        
        dto.setOperatingCount(operating);
        dto.setPendingCount(pending);
        dto.setReportingCount(reporting);
        dto.setProducts(productDetails);
        dto.setIndustryDistribution(industryDist);
        
        return dto;
    }
    
    @Override
    public StrategyAnalysisDTO getCompanyStrategy(String companyCode) {
        CompanyStrategy strategy = companyStrategyMapper.selectByCompanyCode(companyCode);
        FundCompany company = baseMapper.selectById(companyCode);
        
        if (strategy == null || company == null) {
            return null;
        }
        
        StrategyAnalysisDTO dto = new StrategyAnalysisDTO();
        dto.setCompanyCode(companyCode);
        dto.setCompanyName(company.getCompanyName());
        dto.setStrategyType(strategy.getStrategyType());
        dto.setStrategyName(strategy.getStrategyName());
        dto.setConcentrationScore(strategy.getConcentrationScore());
        dto.setDiversificationScore(strategy.getDiversificationScore());
        dto.setInnovationScore(strategy.getInnovationScore());
        dto.setAnalysisDesc(strategy.getAnalysisDesc());
        
        if (strategy.getStrengthIndustries() != null) {
            dto.setStrengthIndustries(
                List.of(strategy.getStrengthIndustries().split(","))
            );
        }
        
        if (strategy.getWeaknessIndustries() != null) {
            dto.setWeaknessIndustries(
                List.of(strategy.getWeaknessIndustries().split(","))
            );
        }
        
        if (strategy.getOpportunities() != null) {
            dto.setOpportunities(
                List.of(strategy.getOpportunities().split(","))
            );
        }
        
        return dto;
    }
}
