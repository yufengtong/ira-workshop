package com.stocknews.interfaces.assembler;

import com.stocknews.domain.model.decision.ImpactLevel;
import com.stocknews.domain.model.news.News;
import com.stocknews.interfaces.dto.NewsDTO;

import java.util.List;
import java.util.stream.Collectors;

/**
 * News DTO 组装器
 */
public class NewsAssembler {
    
    public static NewsDTO toDTO(News news) {
        if (news == null) return null;
        
        NewsDTO dto = new NewsDTO();
        dto.setId(news.getId().getId());
        dto.setTitle(news.getTitle().getTitle());
        dto.setSummary(news.getSummary());
        dto.setContent(news.getContent().getContent());
        
        if (news.getSource() != null) {
            dto.setProviderName(news.getSource().getProviderName());
            dto.setSourceUrl(news.getSource().getSourceUrl());
        }
        
        if (news.getCategory() != null) {
            dto.setCategory(news.getCategory().getName());
        }
        
        if (news.getImpactFactor() != null) {
            dto.setImpactLevel(ImpactLevel.fromLevel(
                (int)(news.getImpactFactor().getWeight() * 5)
            ).getName());
        }
        
        dto.setRelatedStocks(news.getRelatedStocks());
        dto.setRelatedSectors(news.getRelatedSectors());
        dto.setPublishedAt(news.getPublishedAt());
        
        return dto;
    }
    
    public static List<NewsDTO> toDTOList(List<News> newsList) {
        return newsList.stream()
            .map(NewsAssembler::toDTO)
            .collect(Collectors.toList());
    }
}
