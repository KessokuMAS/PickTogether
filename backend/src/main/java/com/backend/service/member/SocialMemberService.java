package com.backend.service.member;

import com.backend.domain.member.Member;
import com.backend.dto.member.MemberDTO;

public interface SocialMemberService {
    MemberDTO getKakaoMember(String accessToken);

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