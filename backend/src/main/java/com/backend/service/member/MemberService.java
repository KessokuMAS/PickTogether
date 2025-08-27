package com.backend.service.member;

import java.util.Map;

import com.backend.dto.member.MemberDTO;

public interface MemberService {

    Map<String, Object> login(String email, String pw);
    
    Map<String, Object> register(String email, String pw, String nickname, String memberType);

    MemberDTO getMemberByEmail(String email);

    boolean existsByEmail(String email);

    boolean deleteAccount(String email, String confirmEmail);

} 