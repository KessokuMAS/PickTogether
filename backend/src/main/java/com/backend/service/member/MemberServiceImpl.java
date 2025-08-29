package com.backend.service.member;

import com.backend.domain.member.Member;
import com.backend.domain.member.MemberRole;
import com.backend.dto.member.MemberDTO;
import com.backend.repository.member.MemberRepository;
import com.backend.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil; // 생성자 주입


    @Override
    public Map<String, Object> login(String email, String pw) {
        log.info("로그인 시도: " + email);

        // 이메일로 회원 조회
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));

        // 비밀번호 검증
        if (!passwordEncoder.matches(pw, member.getPw())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 역할 목록을 문자열 리스트로 변환
        List<String> roleNames = member.getMemberRoleList().stream()
                .map(MemberRole::name)
                .collect(Collectors.toList());

        // JWT 토큰 생성
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", member.getEmail());
        claims.put("pw", member.getPw());
        claims.put("nickname", member.getNickname());
        claims.put("socialType", member.getSocialType());
        claims.put("roleNames", roleNames);

        String accessToken = jwtUtil.generateToken(claims, 60); // 60분 유효

        // MemberDTO 생성
        MemberDTO memberDTO = MemberDTO.builder()
                .email(member.getEmail())
                .pw(member.getPw())
                .nickname(member.getNickname())
                .socialType(member.getSocialType())
                .roleNames(roleNames)
                .build();

        Map<String, Object> result = new HashMap<>();
        result.put("accessToken", accessToken);
        result.put("member", memberDTO);
        return result;
    }

    @Override
    public Map<String, Object> register(String email, String pw, String nickname, String memberType) {
        log.info("회원가입 시도: " + email + ", 회원유형: " + memberType);

        // 이메일 중복 확인
        if (memberRepository.existsByEmail(email)) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        // 비밀번호 암호화
        String encodedPw = passwordEncoder.encode(pw);

        // 회원 생성
        Member member = Member.builder()
                .email(email)
                .pw(encodedPw)
                .nickname(nickname)
                .socialType(null)  // 일반회원은 null
                .deleteAccount(0)  // 명시적으로 0으로 설정
                .build();

        // 회원 유형에 따른 역할 설정
        if ("BUSINESS_OWNER".equals(memberType)) {
            member.addRole(MemberRole.BUSINESS_OWNER);
            log.info("자영업자 역할로 회원가입: " + email);
        } else {
            // 기본 역할은 USER
            member.addRole(MemberRole.USER);
            log.info("일반 사용자 역할로 회원가입: " + email);
        }

        // 저장 전에 명시적으로 기본값 설정
        if (member.getDeleteAccount() == null) {
            member.setDeleteAccount(0);
        }

        // 저장
        memberRepository.save(member);
        
        // 저장 후 확인
        log.info("회원가입 완료 - 이메일: {}, 역할: {}, deleteAccount: {}", 
                email, member.getMemberRoleList(), member.getDeleteAccount());

        Map<String, Object> result = new HashMap<>();
        result.put("message", "회원가입이 완료되었습니다.");
        return result;
    }

    @Override
    public MemberDTO getMemberByEmail(String email) {
        return memberRepository.findByEmail(email)
                .map(member -> {
                    // 역할 목록을 문자열 리스트로 변환
                    List<String> roleNames = member.getMemberRoleList().stream()
                            .map(MemberRole::name)
                            .collect(Collectors.toList());
                    
                    return MemberDTO.builder()
                            .email(member.getEmail())
                            .nickname(member.getNickname())
                            .socialType(member.getSocialType())
                            .roleNames(roleNames)
                            .build();
                })
                .orElse(null);
    }

    @Override
    public boolean existsByEmail(String email) {
        return memberRepository.existsByEmail(email);
    }

    @Override
    public boolean updateProfile(String email, String nickname) {
        log.info("프로필 수정 시도: " + email + " -> " + nickname);
        
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));
        
        // 닉네임 업데이트
        member.changeNickname(nickname);
        memberRepository.save(member);
        
        log.info("프로필 수정 완료: " + email + " -> " + nickname);
        return true;
    }
    
    @Override
    public boolean updatePassword(String email, String currentPassword, String newPassword) {
        log.info("비밀번호 수정 시도: " + email);
        
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));
        
        // 현재 비밀번호 검증
        if (!passwordEncoder.matches(currentPassword, member.getPw())) {
            throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
        }
        
        // 새 비밀번호 암호화 및 업데이트
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        member.changePw(encodedNewPassword);
        memberRepository.save(member);
        
        log.info("비밀번호 수정 완료: " + email);
        return true;
    }

    @Override
    public boolean deleteAccount(String email, String confirmEmail) {
        if (!email.equals(confirmEmail)) {
            throw new RuntimeException("이메일이 일치하지 않습니다.");
        }

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));

        // null 안전한 탈퇴 여부 확인
        if (member.isDeleted()) {
            throw new RuntimeException("이미 탈퇴된 회원입니다.");
        }

        member.deleteAccount();
        memberRepository.save(member);

        log.info("회원 탈퇴 완료: " + email);
        return true;
    }
} 