package com.southern.fund.controller;

import com.southern.fund.service.DataSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/sync")
public class SyncController {
    
    @Autowired
    private DataSyncService dataSyncService;
    
    @PostMapping("/all")
    public ResponseEntity<Map<String, String>> syncAll() {
        dataSyncService.syncAll();
        Map<String, String> response = new HashMap<>();
        response.put("message", "数据同步任务已启动");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/companies")
    public ResponseEntity<Map<String, String>> syncCompanies() {
        dataSyncService.syncCompanies();
        Map<String, String> response = new HashMap<>();
        response.put("message", "基金公司数据同步已启动");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/products")
    public ResponseEntity<Map<String, String>> syncProducts() {
        dataSyncService.syncProducts();
        Map<String, String> response = new HashMap<>();
        response.put("message", "基金产品数据同步已启动");
        return ResponseEntity.ok(response);
    }
}
