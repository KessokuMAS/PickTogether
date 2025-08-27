package com.backend.domain.member;

import jakarta.persistence.*;
import jakarta.annotation.PostConstruct;
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

    @Column(columnDefinition = "INTEGER DEFAULT 0", nullable = false)
    @Builder.Default
    private Integer deleteAccount = 0;  // 회원 탈퇴 여부 (0: 활성, 1: 탈퇴)

    // 명시적 생성자 추가 (기본 생성자와 충돌하지 않도록)
    public Member(String email, String pw, String nickname, String socialType) {
        this.email = email;
        this.pw = pw;
        this.nickname = nickname;
        this.socialType = socialType;
        this.deleteAccount = 0;  // 명시적으로 0으로 초기화
        this.memberRoleList = new ArrayList<>();
    }

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "member_roles", joinColumns = @JoinColumn(name = "member_email"))
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private List<MemberRole> memberRoleList = new ArrayList<>();

    @PostConstruct
    public void init() {
        if (this.deleteAccount == null) {
            this.deleteAccount = 0;
        }
        if (this.memberRoleList == null) {
            this.memberRoleList = new ArrayList<>();
        }
    }

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

    // 회원 탈퇴 처리 메서드
    public void deleteAccount() {
        this.deleteAccount = 1;
    }

    // null 안전한 getter 메서드
    public Integer getDeleteAccount() {
        return this.deleteAccount != null ? this.deleteAccount : 0;
    }

    // null 안전한 isDeleted 메서드
    public boolean isDeleted() {
        return this.getDeleteAccount() == 1;
    }

    // deleteAccount 설정 메서드
    public void setDeleteAccount(Integer deleteAccount) {
        this.deleteAccount = deleteAccount != null ? deleteAccount : 0;
    }

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
@Builder.Default
private List<MemberLocation> locations = new ArrayList<>();
} 