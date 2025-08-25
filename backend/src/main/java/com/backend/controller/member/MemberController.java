package com.backend.controller.member;

import com.backend.dto.member.MemberDTO;
import com.backend.service.member.MemberService;
import com.backend.util.JWTUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
@Log4j2
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        try {
            log.info("로그인 요청: " + request);
            
            String email = request.get("email");
            String password = request.get("password"); // 프론트엔드에서 보내는 필드명
            String pw = request.get("pw"); // 백엔드에서 기대하는 필드명

            // password 또는 pw 필드 중 하나를 사용
            String actualPassword = password != null ? password : pw;

            if (email == null || actualPassword == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "이메일과 비밀번호를 입력해주세요.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Map<String, Object> result = memberService.login(email, actualPassword);
            log.info("로그인 성공: " + email);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("로그인 실패: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("로그인 예외 발생: " + e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "서버 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        try {
            log.info("회원가입 요청: " + request);
            
            String email = request.get("email");
            String password = request.get("password"); // 프론트엔드에서 보내는 필드명
            String pw = request.get("pw"); // 백엔드에서 기대하는 필드명
            String name = request.get("name"); // 프론트엔드에서 보내는 필드명
            String nickname = request.get("nickname"); // 백엔드에서 기대하는 필드명
            String memberType = request.get("memberType"); // 회원 유형

            // password 또는 pw 필드 중 하나를 사용
            String actualPassword = password != null ? password : pw;
            // name 또는 nickname 필드 중 하나를 사용
            String actualNickname = name != null ? name : nickname;

            if (email == null || actualPassword == null || actualNickname == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "이메일, 비밀번호, 닉네임을 모두 입력해주세요.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // memberType이 null인 경우 기본값 USER로 설정
            if (memberType == null) {
                memberType = "USER";
            }

            Map<String, Object> result = memberService.register(email, actualPassword, actualNickname, memberType);
            log.info("회원가입 성공: " + email);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("회원가입 실패: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("회원가입 예외 발생: " + e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "서버 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Member API is working!");
        return ResponseEntity.ok(response);
    }
                    
    @GetMapping("/mypage")
    public ResponseEntity<MemberDTO> getCurrentMember(Authentication authentication) {
        // 인증 객체에서 username(email) 꺼내기
        String email = authentication.getName();
        MemberDTO member = memberService.getMemberByEmail(email);

        if (member == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(member);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            String nickname = request.get("nickname");

            if (nickname == null || nickname.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "닉네임을 입력해주세요.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            memberService.updateNickname(email, nickname);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "닉네임이 성공적으로 수정되었습니다.");
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("닉네임 수정 실패: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("닉네임 수정 예외 발생: " + e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "서버 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, Object>> updatePassword(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "현재 비밀번호와 새 비밀번호를 모두 입력해주세요.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (newPassword.length() < 4) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "새 비밀번호는 4자 이상이어야 합니다.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // 소셜 로그인 여부 확인
            MemberDTO member = memberService.getMemberByEmail(email);
            if (member != null && member.isSocial()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            memberService.updatePassword(email, currentPassword, newPassword);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "비밀번호가 성공적으로 수정되었습니다.");
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("비밀번호 수정 실패: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("비밀번호 수정 예외 발생: " + e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "서버 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        try {
            log.info("로그아웃 요청");
            Map<String, String> response = new HashMap<>();
            response.put("message", "로그아웃되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("로그아웃 예외 발생: " + e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "서버 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

} 