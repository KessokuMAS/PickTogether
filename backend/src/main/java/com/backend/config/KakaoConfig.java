package com.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "kakao")
public class KakaoConfig {
    private String restApiKey;
    private String redirectUri;
    private String authUrl;
    private String tokenUrl;
    private String userInfoUrl;
} 