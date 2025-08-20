package com.backend.security.filter;

import com.backend.dto.member.MemberDTO;
import com.backend.util.JWTUtil;
import com.google.gson.Gson;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@Log4j2
@RequiredArgsConstructor
public class JWTCheckFilter extends OncePerRequestFilter {
    private final JWTUtil jwtUtil; // 생성자 주입

    @Override
protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();

    if (request.getMethod().equalsIgnoreCase("OPTIONS") || "/favicon.ico".equals(path)) {
        return true; // 예외
    }
    if (path.startsWith("/api/for-one/nearby")) return true;


    // 공개 엔드포인트만 명시
    String[] PUBLIC_PREFIXES = {
        "/api/member/login",
        "/api/member/register",
        "/api/member/kakao",
        "/api/member/google",
        "/api/member/naver",
        "/api/test/",
        "/api/products/view/",
        "/api/restaurants",
        "/api/community",
        "/api/local-specialty",
        "/uploads" // 이미지 파일 접근 허용
    };

    for (String prefix : PUBLIC_PREFIXES) {
        if (path.startsWith(prefix)) {
            return true; // 공개 → 필터 스킵
        }
    }

    return false; // 그 외 전부 필터 적용 (JWT 체크)
}

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        log.info("----- [JWTCheckFilter START] -----");

        String authHeaderStr = request.getHeader("Authorization");
        log.info("Authorization Header: {}", authHeaderStr);

        // Authorization 헤더 검증
        if (authHeaderStr == null || !authHeaderStr.startsWith("Bearer ")) {
            log.warn("❌ Authorization 헤더 없음 또는 형식 불일치");
            unauthorizedResponse(response, "NO_AUTH_HEADER");
            return;
        }

        String accessToken = authHeaderStr.substring(7);
        log.info("Access Token: {}", accessToken);

        try {
            // JWT 유효성 검증
            Map<String, Object> claims = jwtUtil.validateToken(accessToken);
            log.info("JWT Claims: {}", claims);

            // email 필드 유효성 확인 (없으면 sub 사용 시도)
            String email = claims.containsKey("email")
                    ? (String) claims.get("email")
                    : (String) claims.get("sub");

            String pw = (String) claims.get("pw");
            String nickname = (String) claims.get("nickname");
            String socialType = (String) claims.get("socialType");
            List<String> roleNames = (List<String>) claims.get("roleNames");

            if (email == null) {
                log.error("❌ JWT Claims에 email/sub 없음");
                unauthorizedResponse(response, "INVALID_CLAIMS");
                return;
            }

            // MemberDTO 생성
            MemberDTO memberDTO = new MemberDTO(email, pw, nickname, socialType, roleNames);
            log.info("✅ 인증된 사용자: {}", memberDTO);
            log.info("✅ 권한 목록: {}", memberDTO.getAuthorities());

            // SecurityContext에 저장
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(memberDTO, pw, memberDTO.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            log.info("✅ SecurityContext Authentication 세팅 완료");

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            log.error("❌ JWT 검증 실패: {}", e.getMessage(), e);
            unauthorizedResponse(response, "ERROR_ACCESS_TOKEN");
        }

        log.info("----- [JWTCheckFilter END] -----");
    }

    /**
     * 인증 실패 응답 공통 처리
     */
    private void unauthorizedResponse(HttpServletResponse response, String errorCode) throws IOException {
        Gson gson = new Gson();
        String msg = gson.toJson(Map.of("error", errorCode));
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json; charset=UTF-8");
        try (PrintWriter printWriter = response.getWriter()) {
            printWriter.println(msg);
        }
    }
}
