package com.southern.fund.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.southern.fund.config.TushareConfig;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class TushareClient {
    
    @Autowired
    private TushareConfig tushareConfig;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    public JsonNode query(String apiName, Map<String, Object> params) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(tushareConfig.getBaseUrl());
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("api_name", apiName);
            requestBody.put("token", tushareConfig.getToken());
            requestBody.put("params", params);
            requestBody.put("fields", "");
            
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            httpPost.setEntity(new StringEntity(jsonBody, ContentType.APPLICATION_JSON));
            
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                String responseBody = new String(response.getEntity().getContent().readAllBytes());
                JsonNode jsonNode = objectMapper.readTree(responseBody);
                
                if (jsonNode.has("code") && jsonNode.get("code").asInt() != 0) {
                    log.error("Tushare API error: {}", jsonNode.get("msg").asText());
                    return null;
                }
                
                return jsonNode.get("data");
            }
        } catch (Exception e) {
            log.error("Tushare API request failed", e);
            return null;
        }
    }
}
