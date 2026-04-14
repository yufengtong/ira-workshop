package com.southern.fund;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.southern.fund.utils.TushareClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tushare API 连接测试
 */
@SpringBootTest
public class TushareApiTest {

    @Autowired
    private TushareClient tushareClient;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testConnection() {
        System.out.println("========================================");
        System.out.println("Tushare API 连接测试");
        System.out.println("========================================");

        // 测试1: 获取基金公司列表
        System.out.println("\n📊 测试1: 获取基金公司列表 (fund_company)");
        Map<String, Object> params = new HashMap<>();
        JsonNode result = tushareClient.query("fund_company", params);
        
        assertNotNull(result, "API返回不应为空");
        assertTrue(result.has("items"), "应包含items字段");
        
        JsonNode items = result.get("items");
        System.out.println("✓ 成功获取数据");
        System.out.println("  - 记录数: " + items.size());
        
        if (items.size() > 0) {
            JsonNode first = items.get(0);
            System.out.println("  - 示例数据: " + first);
        }

        // 测试2: 获取基金基础信息
        System.out.println("\n📊 测试2: 获取基金基础信息 (fund_basic)");
        params = new HashMap<>();
        params.put("market", "E");
        result = tushareClient.query("fund_basic", params);
        
        assertNotNull(result, "API返回不应为空");
        assertTrue(result.has("items"), "应包含items字段");
        
        items = result.get("items");
        System.out.println("✓ 成功获取数据");
        System.out.println("  - 记录数: " + items.size());

        System.out.println("\n========================================");
        System.out.println("✅ 所有测试通过! API连接正常");
        System.out.println("========================================");
    }
}
