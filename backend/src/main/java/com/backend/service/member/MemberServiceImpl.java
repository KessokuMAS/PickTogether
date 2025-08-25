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
        log.info("회원가입 시도: " + email + ", 회원 유형: " + memberType);

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
                .build();

        // 회원 유형에 따른 역할 추가
        if ("BUSINESS_OWNER".equals(memberType)) {
            member.addRole(MemberRole.BUSINESS_OWNER);
        } else {
            // 기본값은 USER
            member.addRole(MemberRole.USER);
        }

        // 저장
        memberRepository.save(member);

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
                            .pw(member.getPw())
                            .nickname(member.getNickname())
                            .socialType(member.getSocialType())
                            .roleNames(roleNames)
                            .build();
                })
                .orElse(null);
    }

    // 회원 정보 수정 메서드들 구현
    @Override
    public void updateNickname(String email, String nickname) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));
        
        member.changeNickname(nickname);
        memberRepository.save(member);
    }

    @Override
    public void updatePassword(String email, String currentPassword, String newPassword) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));
        
        // 현재 비밀번호 검증
        if (!passwordEncoder.matches(currentPassword, member.getPw())) {
            throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
        }
        
        // 새 비밀번호 암호화 및 저장
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        member.changePw(encodedNewPassword);
        memberRepository.save(member);
    }
} 