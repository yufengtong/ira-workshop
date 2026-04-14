package com.stock.controller;

import com.stock.model.StockData;
import com.stock.service.AIAnalysisService;
import com.stock.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {
    
    private final StockService stockService;
    private final AIAnalysisService aiAnalysisService;
    
    /**
     * 获取实时股票数据
     */
    @GetMapping("/realtime")
    public ResponseEntity<List<StockData>> getRealTimeData(
            @RequestParam(defaultValue = "sz002603,sz002604") String codes) {
        
        List<String> stockCodes = Arrays.asList(codes.split(","));
        List<StockData> data = stockService.getRealTimeData(stockCodes);
        
        return ResponseEntity.ok(data);
    }
    
    /**
     * 刷新并保存股票数据
     */
    @PostMapping("/refresh")
    public ResponseEntity<List<StockData>> refreshData(
            @RequestParam(defaultValue = "sz002603,sz002604") String codes) {
        
        List<String> stockCodes = Arrays.asList(codes.split(","));
        List<StockData> data = stockService.refreshAndSave(stockCodes);
        
        return ResponseEntity.ok(data);
    }
    
    /**
     * 获取历史数据
     */
    @GetMapping("/history/{code}")
    public ResponseEntity<List<StockData>> getHistoryData(
            @PathVariable String code,
            @RequestParam(defaultValue = "24") int hours) {
        
        List<StockData> data = stockService.getHistoryData(code, hours);
        
        return ResponseEntity.ok(data);
    }
    
    /**
     * AI分析股票
     */
    @PostMapping("/analyze/{code}")
    public ResponseEntity<Map<String, Object>> analyzeStock(@PathVariable String code) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 获取当前数据
            List<StockData> currentData = stockService.getRealTimeData(Arrays.asList(code));
            if (currentData.isEmpty()) {
                result.put("success", false);
                result.put("message", "获取股票数据失败");
                return ResponseEntity.badRequest().body(result);
            }
            
            StockData stockData = currentData.get(0);
            
            // 获取历史数据
            List<StockData> historyData = stockService.getHistoryData(code, 24);
            
            // AI分析
            String analysis = aiAnalysisService.analyzeStock(stockData, historyData);
            
            result.put("success", true);
            result.put("analysis", analysis);
            result.put("stockName", stockData.getName());
            result.put("stockCode", stockData.getCode());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "分析失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
}
