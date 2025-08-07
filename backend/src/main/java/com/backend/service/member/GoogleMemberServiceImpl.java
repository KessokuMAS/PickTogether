package com.backend.service.member;

import java.util.LinkedHashMap;
import java.util.Optional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import com.backend.config.GoogleConfig;
import com.backend.domain.member.Member;
import com.backend.domain.member.MemberRole;
import com.backend.dto.member.MemberDTO;
import com.backend.repository.member.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@RequiredArgsConstructor
public class GoogleMemberServiceImpl implements GoogleMemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleConfig googleConfig;

    @Override
    public MemberDTO getGoogleMember(String accessToken) {
        String email = getEmailFromGoogleAccessToken(accessToken);
        log.info("email: " + email);

        Optional<Member> result = memberRepository.findById(email);

        if(result.isPresent()) {
            Member existingMember = result.get();
            
            // 기존 회원이 소셜 회원이 아니거나 다른 소셜 타입인 경우 업데이트
            if (existingMember.getSocialType() == null || !existingMember.getSocialType().equals("GOOGLE")) {
                existingMember.changeSocialType("GOOGLE");
                memberRepository.save(existingMember);
                log.info("기존 회원의 소셜 타입을 GOOGLE로 업데이트: " + email);
            }
            
            MemberDTO memberDTO = entityToDTO(existingMember);
            return memberDTO;
        }

        // 회원이 아니었다면 새로 생성
        Member socialMember = makeSocialMember(email);
        memberRepository.save(socialMember);

        MemberDTO memberDTO = entityToDTO(socialMember);
        return memberDTO;
    }

    private String getEmailFromGoogleAccessToken(String accessToken) {
        if(accessToken == null) {
            throw new RuntimeException("Access Token is null");
        }
        
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        headers.add("Content-Type", "application/json");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        UriComponents uriBuilder = UriComponentsBuilder.fromHttpUrl(googleConfig.getUserInfoUrl()).build();

        ResponseEntity<LinkedHashMap> response = 
            restTemplate.exchange(
                uriBuilder.toString(), 
                HttpMethod.GET, 
                entity, 
                LinkedHashMap.class);

        log.info(response);

        LinkedHashMap<String, Object> bodyMap = response.getBody();
        log.info("------------------------------");
        log.info(bodyMap);

        String email = (String) bodyMap.get("email");
        if (email == null) {
            log.error("이메일 정보가 없습니다. 구글 계정에서 이메일 정보를 확인해주세요.");
            throw new RuntimeException("이메일 정보를 가져올 수 없습니다. 이메일 동의가 필요합니다.");
        }

        return email;
    }
    
    private String makeTempPassword() {
        StringBuffer buffer = new StringBuffer();
        for(int i = 0; i < 10; i++) {
            buffer.append((char) ((int)(Math.random() * 55) + 65));
        }
        return buffer.toString();
    }
    
    private Member makeSocialMember(String email) {
        String tempPassword = makeTempPassword();
        log.info("tempPassword: " + tempPassword);

        String nickname = "소셜회원";

        Member member = Member.builder()
            .email(email)
            .pw(passwordEncoder.encode(tempPassword))
            .nickname(nickname)
            .socialType("GOOGLE")
            .build();

        member.addRole(MemberRole.USER);

        return member;
    }
} 