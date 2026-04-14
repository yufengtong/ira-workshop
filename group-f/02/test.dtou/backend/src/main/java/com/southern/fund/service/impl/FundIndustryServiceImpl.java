package com.southern.fund.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.southern.fund.dto.IndustryDistributionDTO;
import com.southern.fund.entity.FundIndustry;
import com.southern.fund.entity.FundProduct;
import com.southern.fund.mapper.FundIndustryMapper;
import com.southern.fund.mapper.FundProductMapper;
import com.southern.fund.service.FundIndustryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FundIndustryServiceImpl extends ServiceImpl<FundIndustryMapper, FundIndustry> implements FundIndustryService {
    
    @Autowired
    private FundProductMapper fundProductMapper;
    
    @Override
    public List<FundIndustry> getIndustriesByLevel(Integer level) {
        return baseMapper.selectByLevel(level);
    }
    
    @Override
    public List<IndustryDistributionDTO> getIndustryDistribution() {
        List<FundIndustry> industries = baseMapper.selectByLevel(1);
        List<FundProduct> allProducts = fundProductMapper.selectList(null);
        
        BigDecimal totalAsset = allProducts.stream()
            .map(FundProduct::getAsset)
            .filter(a -> a != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<String, List<FundProduct>> productsByIndustry = allProducts.stream()
            .filter(p -> p.getIndustryCode() != null)
            .collect(Collectors.groupingBy(FundProduct::getIndustryCode));
        
        List<IndustryDistributionDTO> result = new ArrayList<>();
        
        for (FundIndustry industry : industries) {
            IndustryDistributionDTO dto = new IndustryDistributionDTO();
            dto.setIndustryCode(industry.getIndustryCode());
            dto.setIndustryName(industry.getIndustryName());
            
            List<FundProduct> industryProducts = productsByIndustry.getOrDefault(
                industry.getIndustryCode(), 
                new ArrayList<>()
            );
            
            dto.setProductCount(industryProducts.size());
            
            BigDecimal industryAsset = industryProducts.stream()
                .map(FundProduct::getAsset)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setTotalAsset(industryAsset);
            
            long companyCount = industryProducts.stream()
                .map(FundProduct::getCompanyCode)
                .distinct()
                .count();
            dto.setCompanyCount((int) companyCount);
            
            if (totalAsset.compareTo(BigDecimal.ZERO) > 0) {
                dto.setMarketShare(
                    industryAsset.divide(totalAsset, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                );
            } else {
                dto.setMarketShare(BigDecimal.ZERO);
            }
            
            result.add(dto);
        }
        
        return result.stream()
            .sorted((a, b) -> b.getProductCount() - a.getProductCount())
            .collect(Collectors.toList());
    }
}
