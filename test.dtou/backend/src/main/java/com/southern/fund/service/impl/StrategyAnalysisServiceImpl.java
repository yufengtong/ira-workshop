package com.southern.fund.service.impl;

import com.southern.fund.dto.BestPracticeDTO;
import com.southern.fund.dto.MarketGapDTO;
import com.southern.fund.entity.CompanyStrategy;
import com.southern.fund.entity.FundCompany;
import com.southern.fund.entity.FundIndustry;
import com.southern.fund.entity.FundProduct;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.southern.fund.mapper.CompanyStrategyMapper;
import com.southern.fund.mapper.FundCompanyMapper;
import com.southern.fund.mapper.FundIndustryMapper;
import com.southern.fund.mapper.FundProductMapper;
import com.southern.fund.service.StrategyAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StrategyAnalysisServiceImpl implements StrategyAnalysisService {
    
    @Autowired
    private FundProductMapper fundProductMapper;
    
    @Autowired
    private FundIndustryMapper fundIndustryMapper;
    
    @Autowired
    private FundCompanyMapper fundCompanyMapper;
    
    @Autowired
    private CompanyStrategyMapper companyStrategyMapper;
    
    @Override
    public List<MarketGapDTO> analyzeMarketGaps() {
        List<FundIndustry> industries = fundIndustryMapper.selectByLevel(1);
        List<FundProduct> allProducts = fundProductMapper.selectList(null);
        
        int avgProductsPerIndustry = allProducts.size() / Math.max(industries.size(), 1);
        
        Map<String, List<FundProduct>> productsByIndustry = allProducts.stream()
            .filter(p -> p.getIndustryCode() != null)
            .collect(Collectors.groupingBy(FundProduct::getIndustryCode));
        
        List<MarketGapDTO> gaps = new ArrayList<>();
        
        for (FundIndustry industry : industries) {
            List<FundProduct> products = productsByIndustry.getOrDefault(
                industry.getIndustryCode(), 
                new ArrayList<>()
            );
            
            int currentCount = products.size();
            int potentialDemand = Math.max(avgProductsPerIndustry - currentCount, 0);
            
            if (potentialDemand > avgProductsPerIndustry * 0.3) {
                MarketGapDTO dto = new MarketGapDTO();
                dto.setIndustryCode(industry.getIndustryCode());
                dto.setIndustryName(industry.getIndustryName());
                dto.setCurrentProducts(currentCount);
                dto.setPotentialDemand(potentialDemand);
                
                BigDecimal opportunityScore = BigDecimal.valueOf(potentialDemand)
                    .divide(BigDecimal.valueOf(Math.max(avgProductsPerIndustry, 1)), 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
                dto.setOpportunityScore(opportunityScore);
                
                if (opportunityScore.compareTo(BigDecimal.valueOf(80)) > 0) {
                    dto.setRecommendation("高机会领域，建议重点布局");
                } else if (opportunityScore.compareTo(BigDecimal.valueOf(50)) > 0) {
                    dto.setRecommendation("中等机会，可关注");
                } else {
                    dto.setRecommendation("机会有限，谨慎进入");
                }
                
                gaps.add(dto);
            }
        }
        
        return gaps.stream()
            .sorted((a, b) -> b.getOpportunityScore().compareTo(a.getOpportunityScore()))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<BestPracticeDTO> getBestPractices() {
        List<CompanyStrategy> strategies = companyStrategyMapper.selectList(null);
        List<BestPracticeDTO> practices = new ArrayList<>();
        
        for (CompanyStrategy strategy : strategies) {
            FundCompany company = fundCompanyMapper.selectById(strategy.getCompanyCode());
            if (company == null) continue;
            
            BestPracticeDTO dto = new BestPracticeDTO();
            dto.setCompanyCode(strategy.getCompanyCode());
            dto.setCompanyName(company.getCompanyName());
            dto.setStrategyType(strategy.getStrategyType());
            
            BigDecimal performanceScore = calculatePerformanceScore(strategy);
            dto.setPerformanceScore(performanceScore);
            
            if ("focused".equals(strategy.getStrategyType())) {
                dto.setHighlight("聚焦战略，深耕细分领域");
            } else if ("balanced".equals(strategy.getStrategyType())) {
                dto.setHighlight("均衡布局，风险分散");
            } else if ("aggressive".equals(strategy.getStrategyType())) {
                dto.setHighlight("积极扩张，快速布局");
            } else {
                dto.setHighlight("稳健经营，保守策略");
            }
            
            List<String> strengths = new ArrayList<>();
            if (strategy.getStrengthIndustries() != null) {
                strengths = Arrays.asList(strategy.getStrengthIndustries().split(","));
            }
            dto.setKeyStrengths(strengths);
            
            dto.setLearnings(generateLearnings(strategy));
            
            practices.add(dto);
        }
        
        return practices.stream()
            .sorted((a, b) -> b.getPerformanceScore().compareTo(a.getPerformanceScore()))
            .limit(10)
            .collect(Collectors.toList());
    }
    
    @Override
    public void analyzeCompanyStrategy(String companyCode) {
        List<FundProduct> products = fundProductMapper.selectByCompanyCode(companyCode);
        
        Map<String, Long> industryCount = products.stream()
            .filter(p -> p.getIndustryCode() != null)
            .collect(Collectors.groupingBy(FundProduct::getIndustryCode, Collectors.counting()));
        
        long totalProducts = products.size();
        long industryCountDistinct = industryCount.size();
        
        double concentration = industryCount.values().stream()
            .mapToLong(Long::longValue)
            .max()
            .orElse(0) / (double) Math.max(totalProducts, 1);
        
        String strategyType;
        String strategyName;
        
        if (concentration > 0.5) {
            strategyType = "focused";
            strategyName = "聚焦型";
        } else if (concentration > 0.3) {
            strategyType = "balanced";
            strategyName = "均衡型";
        } else if (industryCountDistinct > 10) {
            strategyType = "aggressive";
            strategyName = "激进型";
        } else {
            strategyType = "conservative";
            strategyName = "保守型";
        }
        
        CompanyStrategy strategy = companyStrategyMapper.selectByCompanyCode(companyCode);
        if (strategy == null) {
            strategy = new CompanyStrategy();
            strategy.setCompanyCode(companyCode);
        }
        
        strategy.setStrategyType(strategyType);
        strategy.setStrategyName(strategyName);
        strategy.setConcentrationScore(BigDecimal.valueOf(concentration * 100));
        strategy.setDiversificationScore(BigDecimal.valueOf(industryCountDistinct * 10));
        
        CompanyStrategy existing = companyStrategyMapper.selectOne(
            new QueryWrapper<CompanyStrategy>().eq("company_code", strategy.getCompanyCode())
        );
        if (existing != null) {
            strategy.setId(existing.getId());
            companyStrategyMapper.updateById(strategy);
        } else {
            companyStrategyMapper.insert(strategy);
        }
    }
    
    private BigDecimal calculatePerformanceScore(CompanyStrategy strategy) {
        BigDecimal concentration = strategy.getConcentrationScore() != null ? 
            strategy.getConcentrationScore() : BigDecimal.ZERO;
        BigDecimal diversification = strategy.getDiversificationScore() != null ? 
            strategy.getDiversificationScore() : BigDecimal.ZERO;
        BigDecimal innovation = strategy.getInnovationScore() != null ? 
            strategy.getInnovationScore() : BigDecimal.ZERO;
        
        return concentration.multiply(BigDecimal.valueOf(0.3))
            .add(diversification.multiply(BigDecimal.valueOf(0.3)))
            .add(innovation.multiply(BigDecimal.valueOf(0.4)));
    }
    
    private String generateLearnings(CompanyStrategy strategy) {
        StringBuilder learnings = new StringBuilder();
        
        if (strategy.getStrengthIndustries() != null && !strategy.getStrengthIndustries().isEmpty()) {
            learnings.append("在").append(strategy.getStrengthIndustries()).append("等领域具有明显优势；");
        }
        
        if (strategy.getOpportunities() != null && !strategy.getOpportunities().isEmpty()) {
            learnings.append("可关注").append(strategy.getOpportunities()).append("等机会领域。");
        }
        
        return learnings.toString();
    }
}
