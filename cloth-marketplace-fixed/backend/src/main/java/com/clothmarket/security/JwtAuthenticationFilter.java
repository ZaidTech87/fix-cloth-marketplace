package com.clothmarket.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * STEP 1 FIX: Pehle JWT sirf login pe banta tha, kisi bhi request par verify
 * nahi hota tha (SecurityConfig me anyRequest().permitAll() tha aur koi filter
 * hi nahi tha). Ab yeh filter har request ke "Authorization: Bearer <token>"
 * header ko check karega, token verify karega, aur authenticated userId ko
 * SecurityContext me daalega taaki controllers me hum
 * SecurityContextHolder se asli logged-in userId nikal sakein
 * (client se bheja hua userId trust nahi karna - yeh Step 2 me use hoga).
 *
 * NOTE: Jaan-boojh kar @Component nahi lagaya - SecurityConfig me isse
 * manually @Bean banate hain aur addFilterBefore se register karte hain.
 * Agar yahan @Component bhi laga dete, Spring Boot isse EK BAAR generic
 * servlet filter ke roop me aur EK BAAR Security chain me register kar deta
 * (double execution bug).
 */
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Long userId = jwtUtil.extractUserId(token);
                String mobile = jwtUtil.extractMobile(token);

                if (!jwtUtil.isTokenExpired(token) && userId != null) {
                    AuthenticatedUser principal = new AuthenticatedUser(userId, mobile);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    principal, null, Collections.emptyList());

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // Invalid/expired/malformed token -> request simply stays unauthenticated.
                // Protected endpoints will then be rejected by SecurityConfig (401/403).
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
