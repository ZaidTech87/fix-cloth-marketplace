package com.clothmarket.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    public String generateToken(Long userId, String mobile) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("mobile", mobile);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(mobile)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    public Long extractUserId(String token) {
        Claims claims = extractClaims(token);
        return claims.get("userId", Long.class);
    }
    
    public String extractMobile(String token) {
        return extractClaims(token).getSubject();
    }
    
    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }
    
    public boolean validateToken(String token, String mobile) {
        return (extractMobile(token).equals(mobile) && !isTokenExpired(token));
    }
}
