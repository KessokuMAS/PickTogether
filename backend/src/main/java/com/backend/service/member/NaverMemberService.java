package com.backend.service.member;

import com.backend.domain.member.Member;
import com.backend.dto.member.MemberDTO;

public interface NaverMemberService {
    String getNaverAccessToken(String code, String state);
    MemberDTO getNaverMember(String accessToken);

    default MemberDTO entityToDTO(Member member) {
        return new MemberDTO(
            member.getEmail(),
            member.getPw(),
            member.getNickname(),
            member.getSocialType(),
            member.getMemberRoleList().stream().map(Enum::name).toList()
        );
    }
} 