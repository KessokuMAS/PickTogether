package com.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.backend.security.filter.JWTCheckFilter;
import com.backend.security.handler.CustomAccessDeniedHandler;

import lombok.extern.log4j.Log4j2;

@Log4j2
@Configuration
@EnableWebSecurity
public class CustomSecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("http://localhost:3000")); 

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*")); // Authorization, Content-Type 등 포함
        configuration.setAllowCredentials(true); // 쿠키, Authorization 헤더 포함 가능

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        log.info("---------------------security config---------------------------");

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS 설정
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .formLogin(form -> form.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/member/**").permitAll()
                .requestMatchers("/api/test/**").permitAll()
                .requestMatchers("/api/products/view/**").permitAll() // 이미지 조회는 인증 없이 허용
                .requestMatchers("/api/store/**").hasRole("BUSINESS_OWNER") // 가게 관련은 사업자만
                .requestMatchers("/api/funding/**").hasRole("USER") // 펀딩 관련은 로그인 사용자만
                .requestMatchers("/api/admin/**").hasRole("ADMIN") // 관리자 기능
                .anyRequest().authenticated()
            )
            .addFilterBefore(new JWTCheckFilter(), UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(config -> config.accessDeniedHandler(new CustomAccessDeniedHandler()));

        return http.build();
    }
}

