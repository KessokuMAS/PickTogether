package com.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.backend.controller.formatter.LocalDateFormatter;


@Configuration
public class CustomServletConfig implements WebMvcConfigurer{

  @Override
  
  public void addFormatters(FormatterRegistry registry) {
    
    registry.addFormatter(new LocalDateFormatter());
  }

      @Override
  public void addCorsMappings(CorsRegistry registry) {

    registry.addMapping("/**")
            .allowedOrigins("*")
            .allowedMethods("HEAD", "GET", "POST", "PUT", "DELETE", "OPTIONS")
            .maxAge(300)
            .allowedHeaders("Authorization", "Cache-Control", "Content-Type");
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // 업로드된 이미지 파일을 정적 리소스로 제공
    registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:uploads/");
  }
}