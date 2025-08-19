package com.backend.repository;

import com.backend.domain.member.Member;
import com.backend.domain.member.MemberRole;
import com.backend.repository.member.MemberRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.test.annotation.Commit;
import org.springframework.security.crypto.password.PasswordEncoder;


@SpringBootTest
public class MemberRoleTests {
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @Commit
    public void createAdminAccount() {
        // ADMIN 역할을 가지는 계정 생성
        Member adminMember = Member.builder()
                .email("admin@picktogether.com")
                .pw(passwordEncoder.encode("1234")) // 비밀번호 암호화
                .nickname("관리자")
                .socialType(null) // 일반 회원
                .build();
        
        // ADMIN 역할 추가
        adminMember.addRole(MemberRole.ADMIN);
        
        // 계정 저장
        Member savedAdmin = memberRepository.save(adminMember);
        
        System.out.println("[INFO] Admin account created successfully!");
        System.out.println("[INFO] Email: " + savedAdmin.getEmail());
        System.out.println("[INFO] Nickname: " + savedAdmin.getNickname());
        System.out.println("[INFO] Roles: " + savedAdmin.getMemberRoleList());
        System.out.println("[INFO] Is Social: " + savedAdmin.isSocial());
    }

    @Test
    @Commit
    public void createBusinessOwnerAccount() {
        // BUSINESS_OWNER 역할을 가지는 계정 생성
        Member businessOwnerMember = Member.builder()
                .email("business@picktogether.com")
                .pw(passwordEncoder.encode("1234")) // 비밀번호 암호화
                .nickname("소상공인")
                .socialType(null) // 일반 회원
                .build();
        
        // BUSINESS_OWNER 역할 추가
        businessOwnerMember.addRole(MemberRole.BUSINESS_OWNER);
        
        // 계정 저장
        Member savedBusinessOwner = memberRepository.save(businessOwnerMember);
        
        System.out.println("[INFO] Business Owner account created successfully!");
        System.out.println("[INFO] Email: " + savedBusinessOwner.getEmail());
        System.out.println("[INFO] Nickname: " + savedBusinessOwner.getNickname());
        System.out.println("[INFO] Roles: " + savedBusinessOwner.getMemberRoleList());
        System.out.println("[INFO] Is Social: " + savedBusinessOwner.isSocial());
    }
} 