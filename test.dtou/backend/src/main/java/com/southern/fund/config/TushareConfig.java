package com.southern.fund.config;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.file.Paths;

@Data
@Slf4j
@Configuration
@ConfigurationProperties(prefix = "tushare")
public class TushareConfig {
    
    private String token;
    
    private String baseUrl = "https://api.tushare.pro";
    
    private Integer timeout = 30000;
    
    @PostConstruct
    public void init() {
        // 如果token为空，尝试从.env文件读取
        if (token == null || token.isEmpty()) {
            token = loadTokenFromEnvFile();
            if (token != null) {
                log.info("✅ 已从.env文件加载Tushare Token");
            } else {
                log.warn("⚠️ 未找到Tushare Token，请配置tushare.token或.env文件");
            }
        }
    }
    
    private String loadTokenFromEnvFile() {
        // 尝试多个可能的.env文件位置
        String[] possiblePaths = {
            ".env",
            "../.env",
            "../../.env",
            System.getProperty("user.dir") + "/.env",
            Paths.get(System.getProperty("user.dir")).getParent() + "/.env"
        };
        
        for (String path : possiblePaths) {
            File envFile = new File(path);
            if (envFile.exists()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.startsWith("TUSHARE_TOKEN=")) {
                            String value = line.substring("TUSHARE_TOKEN=".length()).trim();
                            // 移除可能的引号
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            return value;
                        }
                    }
                } catch (Exception e) {
                    log.warn("读取.env文件失败: {}", path, e);
                }
            }
        }
        return null;
    }
}
