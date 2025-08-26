package com.backend.service.member;

import java.util.Map;

import com.backend.dto.member.MemberDTO;

public interface MemberService {

    Map<String, Object> login(String email, String pw);
    
    Map<String, Object> register(String email, String pw, String nickname);

    MemberDTO getMemberByEmail(String email);

} 