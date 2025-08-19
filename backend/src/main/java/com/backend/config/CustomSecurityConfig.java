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
import com.backend.util.JWTUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class CustomSecurityConfig {

    private final JWTUtil jwtUtil; // @Component로 등록된 JWTUtil 주입

    @Bean
    public JWTCheckFilter jwtCheckFilter() {
        return new JWTCheckFilter(jwtUtil); // 생성자 주입
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
        configuration.setAllowedHeaders(List.of("*")); // Authorization 포함
        configuration.setAllowCredentials(true);
        // 필요시 노출 헤더
        // configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        log.info("---------------------security config---------------------------");

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .formLogin(form -> form.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/uploads/**").permitAll() // 이미지 파일 접근 허용
                .requestMatchers("/api/member/mypage").authenticated()
                .requestMatchers("/api/member/locations").authenticated()
                .requestMatchers("/api/member/**").permitAll()
                .requestMatchers("/api/for-one/**").permitAll()

                .requestMatchers("/api/test/**").permitAll()
                .requestMatchers("/api/products/view/**").permitAll()
                .requestMatchers("/api/restaurants/**").permitAll()
                .requestMatchers("/api/community/**").permitAll()
                .requestMatchers("/api/local-specialty/**").permitAll() // 지역특산물 정보 공개 접근 허용

                .requestMatchers("/api/store/**").hasRole("BUSINESS_OWNER")
                .requestMatchers("/api/funding/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtCheckFilter(), UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(h -> h.accessDeniedHandler(new CustomAccessDeniedHandler()));

        return http.build();
    }
}
