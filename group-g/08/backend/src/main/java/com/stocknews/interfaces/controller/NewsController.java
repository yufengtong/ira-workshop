package com.stocknews.interfaces.controller;

import com.stocknews.application.service.NewsQueryService;
import com.stocknews.domain.model.news.News;
import com.stocknews.interfaces.assembler.NewsAssembler;
import com.stocknews.interfaces.dto.NewsDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 资讯控制器
 */
@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {
    
    private final NewsQueryService newsQueryService;
    
    public NewsController(NewsQueryService newsQueryService) {
        this.newsQueryService = newsQueryService;
    }
    
    /**
     * 获取最新资讯列表
     */
    @GetMapping
    public ResponseEntity<List<NewsDTO>> getLatestNews() {
        List<News> news = newsQueryService.getLatestNews();
        return ResponseEntity.ok(NewsAssembler.toDTOList(news));
    }
    
    /**
     * 根据来源获取资讯
     */
    @GetMapping("/source/{providerName}")
    public ResponseEntity<List<NewsDTO>> getNewsBySource(@PathVariable String providerName) {
        List<News> news = newsQueryService.getNewsBySource(providerName);
        return ResponseEntity.ok(NewsAssembler.toDTOList(news));
    }
    
    /**
     * 获取高影响资讯
     */
    @GetMapping("/high-impact")
    public ResponseEntity<List<NewsDTO>> getHighImpactNews() {
        List<News> news = newsQueryService.getHighImpactNews(null);
        return ResponseEntity.ok(NewsAssembler.toDTOList(news));
    }
}
