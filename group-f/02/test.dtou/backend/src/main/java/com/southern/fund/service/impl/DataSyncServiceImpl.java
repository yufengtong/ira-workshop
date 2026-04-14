package com.southern.fund.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.southern.fund.entity.FundCompany;
import com.southern.fund.entity.FundIndustry;
import com.southern.fund.entity.FundProduct;
import com.southern.fund.mapper.FundCompanyMapper;
import com.southern.fund.mapper.FundIndustryMapper;
import com.southern.fund.mapper.FundProductMapper;
import com.southern.fund.service.DataSyncService;
import com.southern.fund.utils.TushareClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class DataSyncServiceImpl implements DataSyncService {
    
    @Autowired
    private TushareClient tushareClient;
    
    @Autowired
    private FundCompanyMapper fundCompanyMapper;
    
    @Autowired
    private FundProductMapper fundProductMapper;
    
    @Autowired
    private FundIndustryMapper fundIndustryMapper;
    
    @Override
    @Scheduled(cron = "0 0 2 * * ?")
    public void syncAll() {
        log.info("Starting daily data sync...");
        syncCompanies();
        syncIndustries();
        syncProducts();
        log.info("Daily data sync completed");
    }
    
    @Override
    public void syncCompanies() {
        log.info("Syncing fund companies...");
        try {
            Map<String, Object> params = new HashMap<>();
            JsonNode data = tushareClient.query("fund_company", params);
            
            if (data != null && data.has("items")) {
                JsonNode items = data.get("items");
                for (JsonNode item : items) {
                    FundCompany company = new FundCompany();
                    company.setCompanyCode(item.get(0).asText());
                    company.setCompanyName(item.get(1).asText());
                    company.setShortName(item.get(2).asText());
                    company.setEstablishDate(item.get(3).asText());
                    company.setTotalAsset(new BigDecimal(item.get(4).asText()));
                    company.setProductCount(item.get(5).asInt());
                    company.setDeleted(0);
                    company.setCreateTime(LocalDateTime.now());
                    company.setUpdateTime(LocalDateTime.now());
                    
                    FundCompany existing = fundCompanyMapper.selectOne(
                        new QueryWrapper<FundCompany>().eq("company_code", company.getCompanyCode())
                    );
                    if (existing != null) {
                        company.setId(existing.getId());
                        fundCompanyMapper.updateById(company);
                    } else {
                        fundCompanyMapper.insert(company);
                    }
                }
            }
            log.info("Fund companies sync completed");
        } catch (Exception e) {
            log.error("Failed to sync fund companies", e);
        }
    }
    
    @Override
    public void syncIndustries() {
        log.info("Syncing fund industries...");
        try {
            String[][] industryData = {
                {"I01", "股票型", "", "1", "主要投资于股票市场"},
                {"I02", "债券型", "", "1", "主要投资于债券市场"},
                {"I03", "混合型", "", "1", "股票和债券混合投资"},
                {"I04", "货币型", "", "1", "投资于货币市场工具"},
                {"I05", "指数型", "", "1", "跟踪特定指数表现"},
                {"I06", "QDII", "", "1", "投资境外市场"},
                {"I07", "FOF", "", "1", "投资基金的基金"},
                {"I08", "REITs", "", "1", "不动产投资信托"},
                {"I09", "商品型", "", "1", "投资大宗商品"},
                {"I10", "养老目标", "", "1", "养老目标基金"}
            };
            
            for (String[] data : industryData) {
                FundIndustry industry = new FundIndustry();
                industry.setIndustryCode(data[0]);
                industry.setIndustryName(data[1]);
                industry.setParentCode(data[2]);
                industry.setLevel(Integer.parseInt(data[3]));
                industry.setDescription(data[4]);
                industry.setSortOrder(0);
                industry.setDeleted(0);
                industry.setCreateTime(LocalDateTime.now());
                industry.setUpdateTime(LocalDateTime.now());
                
                FundIndustry existing = fundIndustryMapper.selectOne(
                    new QueryWrapper<FundIndustry>().eq("industry_code", industry.getIndustryCode())
                );
                if (existing != null) {
                    industry.setId(existing.getId());
                    fundIndustryMapper.updateById(industry);
                } else {
                    fundIndustryMapper.insert(industry);
                }
            }
            log.info("Fund industries sync completed");
        } catch (Exception e) {
            log.error("Failed to sync fund industries", e);
        }
    }
    
    @Override
    public void syncProducts() {
        log.info("Syncing fund products...");
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("market", "E");
            JsonNode data = tushareClient.query("fund_basic", params);
            
            if (data != null && data.has("items")) {
                JsonNode items = data.get("items");
                for (JsonNode item : items) {
                    FundProduct product = new FundProduct();
                    product.setTsCode(item.get(0).asText());
                    product.setName(item.get(1).asText());
                    product.setShortName(item.get(2).asText());
                    product.setCompanyCode(item.get(3).asText());
                    product.setCompanyName(item.get(4).asText());
                    product.setFundType(item.get(5).asText());
                    product.setInvestType(item.get(6).asText());
                    product.setStatus(item.get(7).asText());
                    product.setEstablishDate(item.get(8).asText());
                    product.setDeleted(0);
                    product.setCreateTime(LocalDateTime.now());
                    product.setUpdateTime(LocalDateTime.now());
                    
                    FundProduct existing = fundProductMapper.selectOne(
                        new QueryWrapper<FundProduct>().eq("ts_code", product.getTsCode())
                    );
                    if (existing != null) {
                        product.setId(existing.getId());
                        fundProductMapper.updateById(product);
                    } else {
                        fundProductMapper.insert(product);
                    }
                }
            }
            log.info("Fund products sync completed");
        } catch (Exception e) {
            log.error("Failed to sync fund products", e);
        }
    }
}
