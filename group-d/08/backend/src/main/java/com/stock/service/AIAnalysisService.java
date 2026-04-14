package com.stock.service;

import com.stock.model.StockData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIAnalysisService {
    
    private final RestTemplate restTemplate;
    
    @Value("${dashscope.api.key:}")
    private String apiKey;
    
    private static final String DASHSCOPE_API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
    
    /**
     * 分析股票数据
     */
    public String analyzeStock(StockData stockData, List<StockData> historyData) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "AI分析功能未配置,请在application.properties中设置dashscope.api.key";
        }
        
        try {
            // 构建分析提示
            String prompt = buildAnalysisPrompt(stockData, historyData);
            
            // 调用通义千问API
            String analysis = callQwenAPI(prompt);
            
            return analysis;
        } catch (Exception e) {
            log.error("AI分析失败: {}", e.getMessage(), e);
            return "AI分析暂时不可用,请稍后重试";
        }
    }
    
    /**
     * 构建分析提示词
     */
    private String buildAnalysisPrompt(StockData current, List<StockData> history) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一位专业的股票分析师,请根据以下股票数据进行简明扼要的分析:\n\n");
        
        prompt.append("股票信息:\n");
        prompt.append("- 股票代码: ").append(current.getCode()).append("\n");
        prompt.append("- 股票名称: ").append(current.getName()).append("\n");
        prompt.append("- 当前价格: ").append(current.getCurrentPrice()).append("元\n");
        prompt.append("- 涨跌幅: ").append(current.getChangePercent()).append("%\n");
        prompt.append("- 开盘价: ").append(current.getOpenPrice()).append("元\n");
        prompt.append("- 最高价: ").append(current.getHighPrice()).append("元\n");
        prompt.append("- 最低价: ").append(current.getLowPrice()).append("元\n");
        prompt.append("- 昨收价: ").append(current.getPreClose()).append("元\n");
        prompt.append("- 成交量: ").append(current.getVolume()).append("手\n\n");
        
        if (history != null && !history.isEmpty()) {
            prompt.append("最近").append(history.size()).append("条历史数据趋势:\n");
            for (int i = 0; i < Math.min(5, history.size()); i++) {
                StockData h = history.get(i);
                prompt.append("- ").append(h.getTimestamp())
                      .append(": 价格").append(h.getCurrentPrice())
                      .append(", 涨跌幅").append(h.getChangePercent()).append("%\n");
            }
            prompt.append("\n");
        }
        
        prompt.append("请从以下角度进行分析(200字以内):\n");
        prompt.append("1. 当前走势判断(上涨/下跌/震荡)\n");
        prompt.append("2. 涨跌幅的可能原因分析\n");
        prompt.append("3. 短期趋势预判\n");
        prompt.append("4. 操作建议(仅供参考)\n\n");
        prompt.append("注意:请用简洁的中文回答,避免使用过于专业的术语,让普通投资者也能理解。");
        
        return prompt.toString();
    }
    
    /**
     * 调用通义千问API
     */
    private String callQwenAPI(String prompt) {
        // 构建请求体
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "qwen-turbo");
        
        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);
        requestBody.put("messages", new Object[]{message});
        
        // 设置请求头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        // 发送请求
        ResponseEntity<Map> response = restTemplate.exchange(
            DASHSCOPE_API_URL,
            HttpMethod.POST,
            entity,
            Map.class
        );
        
        // 解析响应
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            Map<String, Object> body = response.getBody();
            if (body.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, Object> msg = (Map<String, Object>) firstChoice.get("message");
                    return (String) msg.get("content");
                }
            }
        }
        
        throw new RuntimeException("AI分析API调用失败");
    }
}
