package com.stock.service;

import com.stock.model.KLineData;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class KLineService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String SINA_KLINE_IMAGE_URL = "http://image.sinajs.cn/newchart/%s/n/%s.gif";
    private static final String SINA_KLINE_DATA_URL = "http://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=%s&scale=%d&ma=no&datalen=%d";
    
    /**
     * 获取K线图片字节数据
     */
    public byte[] getKLineImage(String code, String type) {
        String url = String.format(SINA_KLINE_IMAGE_URL, type, code);
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Referer", "https://finance.sina.com.cn");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<byte[]> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, byte[].class
            );
            
            return response.getBody();
        } catch (Exception e) {
            log.error("获取K线图片失败: {}", e.getMessage());
            return new byte[0];
        }
    }
    
    /**
     * 获取K线JSON数据
     */
    public List<KLineData> getKLineData(String code, int scale, int dataLen) {
        String url = String.format(SINA_KLINE_DATA_URL, code, scale, dataLen);
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Referer", "https://finance.sina.com.cn");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            String jsonData = response.getBody();
            if (jsonData == null || jsonData.isEmpty()) {
                return new ArrayList<>();
            }
            
            // 解析JSON数组
            return parseKLineJson(jsonData);
            
        } catch (Exception e) {
            log.error("获取K线数据失败: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 解析K线JSON数据
     */
    private List<KLineData> parseKLineJson(String json) {
        List<KLineData> kLineDataList = new ArrayList<>();
        
        try {
            JsonNode arrayNode = objectMapper.readTree(json);
            
            if (arrayNode.isArray()) {
                for (JsonNode node : arrayNode) {
                    KLineData data = new KLineData();
                    data.setDay(node.has("day") ? node.get("day").asText() : "");
                    data.setOpen(node.has("open") ? node.get("open").asDouble() : 0.0);
                    data.setHigh(node.has("high") ? node.get("high").asDouble() : 0.0);
                    data.setLow(node.has("low") ? node.get("low").asDouble() : 0.0);
                    data.setClose(node.has("close") ? node.get("close").asDouble() : 0.0);
                    data.setVolume(node.has("volume") ? node.get("volume").asLong() : 0L);
                    kLineDataList.add(data);
                }
            }
        } catch (Exception e) {
            log.error("解析K线JSON失败: {}", e.getMessage());
        }
        
        return kLineDataList;
    }
}
