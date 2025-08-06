package com.backend.controller.member;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.backend.dto.member.MemberDTO;
import com.backend.service.member.SocialMemberService;
import com.backend.service.member.GoogleMemberService;
import com.backend.service.member.NaverMemberService;
import com.backend.util.JWTUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.Map;

@RestController
@Log4j2
@RequiredArgsConstructor
public class SocialController {

    private final SocialMemberService socialMemberService;
    private final GoogleMemberService googleMemberService;
    private final NaverMemberService naverMemberService;

    @GetMapping("/api/member/kakao")
    public Map<String, Object> getMemberFromKakao(@RequestParam String accessToken) {
        log.info("accessToken: {}", accessToken);

        MemberDTO memberDTO = socialMemberService.getKakaoMember(accessToken);

        // 클레임 구성
        Map<String, Object> claims = Map.of(
            "sub", memberDTO.getEmail(),
            "email", memberDTO.getEmail(),
            "pw", memberDTO.getPw(),
            "nickname", memberDTO.getNickname(),
            "socialType", memberDTO.getSocialType(),
            "roleNames", memberDTO.getRoleNames()
        );

        // 토큰 발급 (정적 메서드 호출)
        String jwtAccessToken = JWTUtil.generateToken(claims, 60 * 24); // 24시간
        String jwtRefreshToken = JWTUtil.generateToken(claims, 60 * 24 * 7); // 7일

        // 응답 구성
        return Map.of(
            "accessToken", jwtAccessToken,
            "refreshToken", jwtRefreshToken,
            "member", memberDTO
        );
    }

    @GetMapping("/api/member/google")
    public Map<String, Object> getMemberFromGoogle(@RequestParam String accessToken) {
        log.info("Google accessToken: {}", accessToken);

        MemberDTO memberDTO = googleMemberService.getGoogleMember(accessToken);

        // 클레임 구성
        Map<String, Object> claims = Map.of(
            "sub", memberDTO.getEmail(),
            "email", memberDTO.getEmail(),
            "pw", memberDTO.getPw(),
            "nickname", memberDTO.getNickname(),
            "socialType", memberDTO.getSocialType(),
            "roleNames", memberDTO.getRoleNames()
        );

        // 토큰 발급 (정적 메서드 호출)
        String jwtAccessToken = JWTUtil.generateToken(claims, 60 * 24); // 24시간
        String jwtRefreshToken = JWTUtil.generateToken(claims, 60 * 24 * 7); // 7일

        // 응답 구성
        return Map.of(
            "accessToken", jwtAccessToken,
            "refreshToken", jwtRefreshToken,
            "member", memberDTO
        );
    }

    @GetMapping("/api/member/naver/token")
    public Map<String, Object> getNaverToken(@RequestParam String code, @RequestParam String state) {
        log.info("Naver code: {}, state: {}", code, state);

        String accessToken = naverMemberService.getNaverAccessToken(code, state);

        return Map.of("access_token", accessToken);
    }

    @GetMapping("/api/member/naver")
    public Map<String, Object> getMemberFromNaver(@RequestParam String accessToken) {
        log.info("Naver accessToken: {}", accessToken);

        MemberDTO memberDTO = naverMemberService.getNaverMember(accessToken);

        // 클레임 구성
        Map<String, Object> claims = Map.of(
            "sub", memberDTO.getEmail(),
            "email", memberDTO.getEmail(),
            "pw", memberDTO.getPw(),
            "nickname", memberDTO.getNickname(),
            "socialType", memberDTO.getSocialType(),
            "roleNames", memberDTO.getRoleNames()
        );

        // 토큰 발급 (정적 메서드 호출)
        String jwtAccessToken = JWTUtil.generateToken(claims, 60 * 24); // 24시간
        String jwtRefreshToken = JWTUtil.generateToken(claims, 60 * 24 * 7); // 7일

        // 응답 구성
        return Map.of(
            "accessToken", jwtAccessToken,
            "refreshToken", jwtRefreshToken,
            "member", memberDTO
        );
    }
} 