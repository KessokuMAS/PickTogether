package com.backend.dto.member;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberDTO implements UserDetails {

    private String email;
    private String pw;
    private String nickname;
    private String socialType;  // KAKAO, GOOGLE, NAVER, null=일반회원
    private List<String> roleNames;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.roleNames.stream()
                .map(str -> new SimpleGrantedAuthority("ROLE_" + str))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return this.pw;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // 소셜 회원인지 확인하는 메서드
    public boolean isSocial() {
        return socialType != null && !socialType.isEmpty();
    }
} 