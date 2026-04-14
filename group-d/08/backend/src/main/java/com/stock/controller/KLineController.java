package com.stock.controller;

import com.stock.model.KLineData;
import com.stock.service.KLineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kline")
@RequiredArgsConstructor
public class KLineController {
    
    private final KLineService kLineService;
    
    /**
     * 获取K线图片
     */
    @GetMapping(value = "/image/{code}", produces = MediaType.IMAGE_GIF_VALUE)
    public ResponseEntity<byte[]> getKLineImage(
            @PathVariable String code,
            @RequestParam(defaultValue = "daily") String type) {
        
        byte[] imageData = kLineService.getKLineImage(code, type);
        
        if (imageData.length == 0) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_GIF)
                .header("Cache-Control", "max-age=300")
                .body(imageData);
    }
    
    /**
     * 获取K线JSON数据
     */
    @GetMapping("/data/{code}")
    public ResponseEntity<List<KLineData>> getKLineData(
            @PathVariable String code,
            @RequestParam(defaultValue = "240") int scale,
            @RequestParam(defaultValue = "100") int datalen) {
        
        List<KLineData> data = kLineService.getKLineData(code, scale, datalen);
        
        return ResponseEntity.ok(data);
    }
}
