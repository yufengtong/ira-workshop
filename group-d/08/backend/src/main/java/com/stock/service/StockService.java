package com.stock.service;

import com.stock.model.StockData;
import com.stock.repository.StockDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {
    
    private final StockDataRepository stockDataRepository;
    private final RestTemplate restTemplate;
    
    private static final String SINA_API_URL = "https://hq.sinajs.cn/list=";
    
    /**
     * 获取实时股票数据
     */
    public List<StockData> getRealTimeData(List<String> stockCodes) {
        if (stockCodes == null || stockCodes.isEmpty()) {
            return new ArrayList<>();
        }
        
        String codes = String.join(",", stockCodes);
        String url = SINA_API_URL + codes;
        
        try {
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.set("Referer", "https://finance.sina.com.cn");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // 调用新浪API
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            // 解析返回数据
            return parseStockData(response.getBody());
            
        } catch (Exception e) {
            log.error("获取股票数据失败: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 解析新浪API返回的数据
     */
    private List<StockData> parseStockData(String responseBody) {
        List<StockData> stockDataList = new ArrayList<>();
        
        if (responseBody == null || responseBody.isEmpty()) {
            return stockDataList;
        }
        
        // 按行分割
        String[] lines = responseBody.split("\n");
        
        for (String line : lines) {
            if (line.isEmpty()) continue;
            
            try {
                // 提取股票代码
                String code = extractCode(line);
                
                // 提取引号内的数据
                int startQuote = line.indexOf("\"");
                int endQuote = line.lastIndexOf("\"");
                
                if (startQuote == -1 || endQuote == -1 || startQuote == endQuote) {
                    continue;
                }
                
                String data = line.substring(startQuote + 1, endQuote);
                String[] fields = data.split(",");
                
                if (fields.length < 32) {
                    continue;
                }
                
                StockData stockData = new StockData();
                stockData.setCode(code);
                stockData.setName(fields[0]);
                stockData.setOpenPrice(parseDouble(fields[1]));
                stockData.setPreClose(parseDouble(fields[2]));
                stockData.setCurrentPrice(parseDouble(fields[3]));
                stockData.setHighPrice(parseDouble(fields[4]));
                stockData.setLowPrice(parseDouble(fields[5]));
                stockData.setVolume(parseLong(fields[8]));
                
                // 计算涨跌幅
                Double preClose = stockData.getPreClose();
                Double currentPrice = stockData.getCurrentPrice();
                if (preClose != null && preClose > 0 && currentPrice != null) {
                    double changePercent = ((currentPrice - preClose) / preClose) * 100;
                    stockData.setChangePercent(Math.round(changePercent * 100.0) / 100.0);
                }
                
                stockData.setTimestamp(LocalDateTime.now());
                
                stockDataList.add(stockData);
                
            } catch (Exception e) {
                log.error("解析股票数据失败: {}", e.getMessage());
            }
        }
        
        return stockDataList;
    }
    
    /**
     * 从响应行中提取股票代码
     */
    private String extractCode(String line) {
        int start = line.indexOf("hq_str_") + 7;
        int end = line.indexOf("=");
        if (start > 6 && end > start) {
            return line.substring(start, end);
        }
        return "unknown";
    }
    
    private Double parseDouble(String value) {
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    private Long parseLong(String value) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /**
     * 刷新并保存股票数据
     */
    public List<StockData> refreshAndSave(List<String> stockCodes) {
        List<StockData> dataList = getRealTimeData(stockCodes);
        
        // 保存到数据库
        for (StockData data : dataList) {
            stockDataRepository.save(data);
        }
        
        log.info("成功保存 {} 条股票数据", dataList.size());
        return dataList;
    }
    
    /**
     * 获取历史数据
     */
    public List<StockData> getHistoryData(String code, int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return stockDataRepository.findByCodeAndTimestampAfterOrderByTimestampDesc(code, since);
    }
}
