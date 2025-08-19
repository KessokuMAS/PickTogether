package com.backend.domain.member;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString(exclude = "memberRoleList")
public class Member {

    @Id
    private String email;       // 이메일

    private String pw;          // 비밀번호

    private String nickname;    // 닉네임

    private String socialType;  // 소셜 로그인 타입 (KAKAO, GOOGLE, NAVER, null=일반회원)

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "member_roles", joinColumns = @JoinColumn(name = "member_email"))
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private List<MemberRole> memberRoleList = new ArrayList<>();

    public void addRole(MemberRole memberRole) {
        memberRoleList.add(memberRole);
    }

    public void clearRole() {
        memberRoleList.clear();
    }

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }

    public void changePw(String pw) {
        this.pw = pw;
    }

    public void changeSocialType(String socialType) {
        this.socialType = socialType;
    }

    // 소셜 회원인지 확인하는 메서드
    public boolean isSocial() {
        return socialType != null && !socialType.isEmpty();
    }

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
@Builder.Default
private List<MemberLocation> locations = new ArrayList<>();
} 