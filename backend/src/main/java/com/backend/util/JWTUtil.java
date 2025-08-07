package com.backend.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.log4j.Log4j2;

import javax.crypto.SecretKey;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Log4j2
public class JWTUtil {

    private static SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    public static String generateToken(Map<String, Object> valueMap, int min) {

        log.info("generateKey..." + key);

        String emailStr = (String) valueMap.get("email");
        String pwStr = (String) valueMap.get("pw");
        String nicknameStr = (String) valueMap.get("nickname");
        String socialType = (String) valueMap.get("socialType");
        List<String> roleNames = (List<String>) valueMap.get("roleNames");

        // JWT Payload
        Claims claims = Jwts.claims().setSubject(emailStr);

        claims.put("pw", pwStr);
        claims.put("nickname", nicknameStr);
        claims.put("socialType", socialType);
        claims.put("roleNames", roleNames);

        // JWT Header
        Map<String, Object> headers = Map.of("typ", "JWT");

        String token = Jwts.builder()
                .setHeader(headers)
                .setClaims(claims)
                .setIssuedAt(Date.from(ZonedDateTime.now().toInstant()))
                .setExpiration(Date.from(ZonedDateTime.now().plusMinutes(min).toInstant()))
                .signWith(key)
                .compact();

        return token;
    }

    public static Map<String, Object> validateToken(String token) throws JwtException {

        Map<String, Object> claims = null;

        claims = (Map<String, Object>) Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims;
    }
} 