package com.stocknews.domain.service;

import com.stocknews.domain.model.news.News;
import com.stocknews.domain.model.news.NewsTitle;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 去重服务 - 领域服务
 * 基于SimHash相似度算法实现资讯去重
 */
public class DeduplicationService {
    
    private final double similarityThreshold;

    public DeduplicationService(double similarityThreshold) {
        this.similarityThreshold = similarityThreshold;
    }

    public DeduplicationService() {
        this(0.8); // 默认相似度阈值
    }

    /**
     * 对资讯列表进行去重
     * @param newsList 待去重的资讯列表
     * @return 去重后的资讯列表
     */
    public List<News> deduplicate(List<News> newsList) {
        if (newsList == null || newsList.isEmpty()) {
            return new ArrayList<>();
        }

        List<News> result = new ArrayList<>();
        Set<String> seenHashes = new HashSet<>();

        for (News news : newsList) {
            String hash = computeSimHash(news);
            boolean isDuplicate = false;

            // 检查是否与已有资讯相似
            for (String seenHash : seenHashes) {
                double similarity = computeSimilarity(hash, seenHash);
                if (similarity >= similarityThreshold) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                result.add(news);
                seenHashes.add(hash);
            }
        }

        return result;
    }

    /**
     * 计算资讯的SimHash
     */
    private String computeSimHash(News news) {
        if (news == null || news.getTitle() == null) {
            return "0";
        }

        String content = news.getTitle().getTitle();
        if (news.getContent() != null) {
            content += " " + news.getContent().getContent();
        }

        // 简化的SimHash实现
        int[] vector = new int[64];
        String[] words = content.split("\\s+");
        
        for (String word : words) {
            if (word.isEmpty()) continue;
            int hash = word.hashCode();
            for (int i = 0; i < 32; i++) {
                int bit = (hash >> i) & 1;
                vector[i] += bit == 1 ? 1 : -1;
            }
        }

        StringBuilder simHash = new StringBuilder();
        for (int i = 0; i < 32; i++) {
            simHash.append(vector[i] > 0 ? '1' : '0');
        }

        return simHash.toString();
    }

    /**
     * 计算两个SimHash的相似度
     */
    private double computeSimilarity(String hash1, String hash2) {
        if (hash1 == null || hash2 == null || 
            hash1.length() != hash2.length()) {
            return 0.0;
        }

        int sameBits = 0;
        for (int i = 0; i < hash1.length(); i++) {
            if (hash1.charAt(i) == hash2.charAt(i)) {
                sameBits++;
            }
        }

        return (double) sameBits / hash1.length();
    }

    public double getSimilarityThreshold() {
        return similarityThreshold;
    }
}
