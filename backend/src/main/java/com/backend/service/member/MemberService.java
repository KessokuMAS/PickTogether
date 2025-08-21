package com.backend.service.member;

import java.util.Map;

import com.backend.dto.member.MemberDTO;

public interface MemberService {

    Map<String, Object> login(String email, String pw);
    
    Map<String, Object> register(String email, String pw, String nickname);

    MemberDTO getMemberByEmail(String email);

    // 회원 정보 수정 메서드들
    void updateNickname(String email, String nickname);
    
    void updatePassword(String email, String currentPassword, String newPassword);
} 