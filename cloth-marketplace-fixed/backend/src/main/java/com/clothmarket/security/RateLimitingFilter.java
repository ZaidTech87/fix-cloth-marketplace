package com.clothmarket.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * STEP 8 FIX: Pehle /auth/login, /auth/signup, /auth/forgot-password par
 * koi rate limit nahi tha - koi bhi script se unlimited login attempts
 * (password brute-force) ya fake signups kar sakta tha.
 *
 * Yeh filter har IP ko in sensitive endpoints par 10 requests/minute tak
 * limit karta hai. In-memory hai (single instance ke liye theek hai; agar
 * multiple server instances chalte hain to Redis-backed Bucket4j use karna
 * better hoga - abhi ke MVP scale ke liye yeh kaafi hai).
 */
@Component
@Order(1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket newBucket() {
        Bandwidth limit = Bandwidth.classic(10, Refill.greedy(10, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private boolean isRateLimited(String path) {
        return path.startsWith("/auth/login")
                || path.startsWith("/auth/signup")
                || path.startsWith("/auth/forgot-password")
                || path.startsWith("/auth/reset-password")
                || path.startsWith("/chatbot/ask");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI().replaceFirst("^/api", "");

        if (isRateLimited(path)) {
            String clientIp = request.getHeader("X-Forwarded-For") != null
                    ? request.getHeader("X-Forwarded-For").split(",")[0].trim()
                    : request.getRemoteAddr();

            Bucket bucket = buckets.computeIfAbsent(clientIp, ip -> newBucket());

            if (!bucket.tryConsume(1)) {
                response.setStatus(429); // Too Many Requests
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Too many attempts. Please try again in a minute.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
