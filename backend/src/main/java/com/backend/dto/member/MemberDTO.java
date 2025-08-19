package com.backend.dto.member;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
// 응답 JSON에 쓸모없는 시큐리티 메타 정보는 제외
@JsonIgnoreProperties({"authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
public class MemberDTO implements UserDetails {

    private String email;

    @JsonIgnore       // 절대 바깥으로 나가면 안 됨
    private String pw;

    private String nickname;     
    private String socialType;    // KAKAO, GOOGLE, NAVER, null=일반회원

    @Builder.Default               
    private List<String> roleNames = new ArrayList<>();

    @Override
    @JsonIgnore 
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<String> rn = (roleNames == null) ? Collections.emptyList() : roleNames; // 이중 안전장치
        return rn.stream()
                .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    @Override
    @JsonIgnore 
    public String getPassword() {
        return this.pw;
    }

    @Override
    public String getUsername() {
        return this.email; 
    }

    @Override @JsonIgnore public boolean isAccountNonExpired() { return true; }
    @Override @JsonIgnore public boolean isAccountNonLocked() { return true; }
    @Override @JsonIgnore public boolean isCredentialsNonExpired() { return true; }
    @Override @JsonIgnore public boolean isEnabled() { return true; }

    // 소셜 회원 여부
    public boolean isSocial() {
        return socialType != null && !socialType.isEmpty();
    }
}
