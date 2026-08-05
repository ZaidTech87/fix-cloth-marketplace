package com.clothmarket.config;

import com.clothmarket.security.JwtAuthenticationFilter;
import com.clothmarket.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * STEP 1 + STEP 4 FIX:
 * - Public endpoints: /auth/** (signup/login/forgot-reset password) and /uploads/**
 *   (publicly viewable media, same as before).
 * - Everything else now REQUIRES a valid JWT (authenticated()), enforced by
 *   JwtAuthenticationFilter running before Spring Security's own filter.
 * - CORS origins now come from an environment variable / application property
 *   ("allowed.origins") instead of being hardcoded to localhost, so this works
 *   in production without code changes (Step 4).
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    @Value("${allowed.origins}")
    private String allowedOrigins;

    private JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil);
    }

    // IMPORTANT: Spring Boot auto-registers ANY bean of type Filter into the
    // servlet container. Since we ALSO add this filter into the Security
    // chain below (addFilterBefore), we must disable that auto-registration
    // here - otherwise the filter would run twice per request.
    @Bean
    public org.springframework.boot.web.servlet.FilterRegistrationBean<JwtAuthenticationFilter> disableAutoRegistration() {
        org.springframework.boot.web.servlet.FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new org.springframework.boot.web.servlet.FilterRegistrationBean<>(jwtAuthenticationFilter());
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/ws/**").permitAll() // websocket handshake (Step 6)
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
