package com.southern.fund.config;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.southern.fund.entity.FundCompany;
import com.southern.fund.entity.FundIndustry;
import com.southern.fund.entity.FundProduct;
import com.southern.fund.entity.CompanyStrategy;
import com.southern.fund.mapper.FundCompanyMapper;
import com.southern.fund.mapper.FundIndustryMapper;
import com.southern.fund.mapper.FundProductMapper;
import com.southern.fund.mapper.CompanyStrategyMapper;
import com.southern.fund.utils.TushareClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 数据初始化器
 * 应用启动时从Tushare API加载初始数据
 */
@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private TushareClient tushareClient;

    @Autowired
    private FundCompanyMapper fundCompanyMapper;

    @Autowired
    private FundIndustryMapper fundIndustryMapper;

    @Autowired
    private FundProductMapper fundProductMapper;

    @Autowired
    private CompanyStrategyMapper companyStrategyMapper;

    @Override
    public void run(String... args) {
        log.info("========================================");
        log.info("开始从Tushare API初始化数据...");
        log.info("========================================");

        try {
            // 1. 初始化行业数据
            initIndustries();

            // 2. 初始化基金公司数据
            initCompanies();

            // 3. 初始化基金产品数据
            initProducts();

            // 4. 更新公司统计数据
            updateCompanyStats();

            // 5. 初始化战略分析数据
            initStrategies();

            log.info("========================================");
            log.info("✅ 数据初始化完成!");
            log.info("========================================");
        } catch (Exception e) {
            log.error("数据初始化失败: {}", e.getMessage(), e);
        }
    }

    private void initIndustries() {
        log.info("\n🏭 初始化行业数据...");

        String[][] industryData = {
                {"I01", "股票型", "主要投资于股票市场"},
                {"I02", "债券型", "主要投资于债券市场"},
                {"I03", "混合型", "股票和债券混合投资"},
                {"I04", "货币型", "投资于货币市场工具"},
                {"I05", "指数型", "跟踪特定指数表现"},
                {"I06", "QDII", "投资境外市场"},
                {"I07", "FOF", "投资基金的基金"},
                {"I08", "REITs", "不动产投资信托"},
                {"I09", "商品型", "投资大宗商品"},
                {"I10", "养老目标", "养老目标基金"}
        };

        int count = 0;
        for (String[] data : industryData) {
            FundIndustry existing = fundIndustryMapper.selectOne(
                    new QueryWrapper<FundIndustry>().eq("industry_code", data[0])
            );

            if (existing == null) {
                FundIndustry industry = new FundIndustry();
                industry.setIndustryCode(data[0]);
                industry.setIndustryName(data[1]);
                industry.setParentCode("");
                industry.setLevel(1);
                industry.setDescription(data[2]);
                industry.setSortOrder(0);
                industry.setDeleted(0);
                industry.setCreateTime(LocalDateTime.now());
                industry.setUpdateTime(LocalDateTime.now());

                fundIndustryMapper.insert(industry);
                count++;
            }
        }

        log.info("✓ 成功导入 {} 个行业", count);
    }

    private void initCompanies() {
        log.info("\n🏢 初始化基金公司数据...");

        JsonNode result = tushareClient.query("fund_company", new HashMap<>());
        if (result == null || !result.has("items")) {
            log.warn("无法获取基金公司数据");
            return;
        }

        JsonNode items = result.get("items");
        JsonNode fields = result.get("fields");

        // 创建字段索引映射
        Map<String, Integer> fieldIndex = new HashMap<>();
        for (int i = 0; i < fields.size(); i++) {
            fieldIndex.put(fields.get(i).asText(), i);
        }

        int count = 0;
        // 只取前30家主要基金公司
        for (int i = 0; i < Math.min(items.size(), 30); i++) {
            JsonNode item = items.get(i);

            String orgCode = getStringValue(item, fieldIndex, "org_code");
            String creditCode = getStringValue(item, fieldIndex, "credit_code");
            String companyCode = orgCode != null ? orgCode : (creditCode != null ? creditCode : "COMP" + String.format("%05d", i));

            // 检查是否已存在
            FundCompany existing = fundCompanyMapper.selectOne(
                    new QueryWrapper<FundCompany>().eq("company_code", companyCode)
            );
            if (existing != null) continue;

            FundCompany company = new FundCompany();
            company.setCompanyCode(companyCode);
            company.setCompanyName(getStringValue(item, fieldIndex, "name"));
            company.setShortName(getStringValue(item, fieldIndex, "shortname"));
            company.setEstablishDate(getStringValue(item, fieldIndex, "setup_date"));
            company.setTotalAsset(BigDecimal.ZERO);
            company.setProductCount(0);
            company.setStrategyType("balanced");
            company.setStrategyDesc("待分析");
            company.setDeleted(0);
            company.setCreateTime(LocalDateTime.now());
            company.setUpdateTime(LocalDateTime.now());

            fundCompanyMapper.insert(company);
            count++;
        }

        log.info("✓ 成功导入 {} 家基金公司", count);
    }

    private void initProducts() {
        log.info("\n📈 初始化基金产品数据...");

        Map<String, Object> params = new HashMap<>();
        params.put("market", "E");

        JsonNode result = tushareClient.query("fund_basic", params);
        if (result == null || !result.has("items")) {
            log.warn("无法获取基金产品数据");
            return;
        }

        JsonNode items = result.get("items");
        JsonNode fields = result.get("fields");

        // 创建字段索引映射
        Map<String, Integer> fieldIndex = new HashMap<>();
        for (int i = 0; i < fields.size(); i++) {
            fieldIndex.put(fields.get(i).asText(), i);
        }

        // 基金类型映射
        Map<String, String> typeMapping = new HashMap<>();
        typeMapping.put("股票型", "I01");
        typeMapping.put("债券型", "I02");
        typeMapping.put("混合型", "I03");
        typeMapping.put("货币型", "I04");
        typeMapping.put("指数型", "I05");
        typeMapping.put("QDII", "I06");
        typeMapping.put("FOF", "I07");

        // 状态映射
        Map<String, String> statusMap = new HashMap<>();
        statusMap.put("L", "运作中");
        statusMap.put("I", "待发售");
        statusMap.put("C", "已清盘");

        int count = 0;
        // 只取前100只基金
        for (int i = 0; i < Math.min(items.size(), 100); i++) {
            JsonNode item = items.get(i);

            String tsCode = getStringValue(item, fieldIndex, "ts_code");
            if (tsCode == null) continue;

            // 检查是否已存在
            FundProduct existing = fundProductMapper.selectOne(
                    new QueryWrapper<FundProduct>().eq("ts_code", tsCode)
            );
            if (existing != null) continue;

            String fundType = getStringValue(item, fieldIndex, "fund_type");
            String industryCode = typeMapping.getOrDefault(fundType, "I01");
            String status = statusMap.getOrDefault(getStringValue(item, fieldIndex, "status"), "运作中");

            FundProduct product = new FundProduct();
            product.setTsCode(tsCode);
            product.setName(getStringValue(item, fieldIndex, "name"));
            product.setShortName(getStringValue(item, fieldIndex, "name"));
            product.setCompanyCode(getStringValue(item, fieldIndex, "management"));
            product.setCompanyName(getStringValue(item, fieldIndex, "management"));
            product.setFundType(fundType);
            product.setInvestType(getStringValue(item, fieldIndex, "invest_type"));
            product.setIndustryCode(industryCode);
            product.setIndustryName(fundType);
            product.setStatus(status);
            product.setAsset(BigDecimal.ZERO);
            product.setEstablishDate(getStringValue(item, fieldIndex, "found_date"));
            product.setDeleted(0);
            product.setCreateTime(LocalDateTime.now());
            product.setUpdateTime(LocalDateTime.now());

            fundProductMapper.insert(product);
            count++;
        }

        log.info("✓ 成功导入 {} 只基金产品", count);
    }

    private void updateCompanyStats() {
        log.info("\n📊 更新公司统计数据...");

        List<FundCompany> companies = fundCompanyMapper.selectList(null);
        for (FundCompany company : companies) {
            Long count = fundProductMapper.selectCount(
                    new QueryWrapper<FundProduct>().eq("company_code", company.getCompanyCode())
            );

            company.setProductCount(count.intValue());
            company.setUpdateTime(LocalDateTime.now());
            fundCompanyMapper.updateById(company);
        }

        log.info("✓ 公司统计数据更新完成");
    }

    private void initStrategies() {
        log.info("\n🎯 初始化战略分析数据...");

        List<FundCompany> companies = fundCompanyMapper.selectList(null);
        int count = 0;

        for (FundCompany company : companies) {
            // 检查是否已存在
            CompanyStrategy existing = companyStrategyMapper.selectOne(
                    new QueryWrapper<CompanyStrategy>().eq("company_code", company.getCompanyCode())
            );
            if (existing != null) continue;

            // 根据产品数量判断战略类型
            String strategyType;
            String strategyName;
            int productCount = company.getProductCount();

            if (productCount > 50) {
                strategyType = "balanced";
                strategyName = "均衡型";
            } else if (productCount > 20) {
                strategyType = "focused";
                strategyName = "聚焦型";
            } else if (productCount > 5) {
                strategyType = "aggressive";
                strategyName = "激进型";
            } else {
                strategyType = "conservative";
                strategyName = "保守型";
            }

            CompanyStrategy strategy = new CompanyStrategy();
            strategy.setCompanyCode(company.getCompanyCode());
            strategy.setStrategyType(strategyType);
            strategy.setStrategyName(strategyName);
            strategy.setConcentrationScore(new BigDecimal("60.0"));
            strategy.setDiversificationScore(new BigDecimal("70.0"));
            strategy.setInnovationScore(new BigDecimal("65.0"));
            strategy.setAnalysisDesc(company.getCompanyName() + "采用" + strategyName + "战略");
            strategy.setDeleted(0);
            strategy.setCreateTime(LocalDateTime.now());
            strategy.setUpdateTime(LocalDateTime.now());

            companyStrategyMapper.insert(strategy);
            count++;
        }

        log.info("✓ 成功导入 {} 条战略分析数据", count);
    }

    private String getStringValue(JsonNode item, Map<String, Integer> fieldIndex, String fieldName) {
        Integer index = fieldIndex.get(fieldName);
        if (index == null || index >= item.size()) return null;
        JsonNode node = item.get(index);
        return node.isNull() ? null : node.asText();
    }
}
