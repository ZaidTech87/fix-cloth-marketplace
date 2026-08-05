package com.clothmarket.service;

import com.clothmarket.dto.AuthResponse;
import com.clothmarket.dto.LoginRequest;
import com.clothmarket.dto.SignUpRequest;
import com.clothmarket.model.User;
import com.clothmarket.repository.UserRepository;
import com.clothmarket.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse signUp(SignUpRequest request) {
        if (userRepository.existsByMobile(request.getMobile())) {
            throw new RuntimeException("Mobile number already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setLocation(request.getLocation());
        user.setMobile(request.getMobile());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getMobile());

        return new AuthResponse(
            token,
            user.getId(),
            user.getName(),
            user.getMobile(),
            user.getLocation(),
            user.getProfileImage(),
            "User registered successfully"
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByMobile(request.getMobile())
                .orElseThrow(() -> new RuntimeException("Invalid mobile number or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid mobile number or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getMobile());

        return new AuthResponse(
            token,
            user.getId(),
            user.getName(),
            user.getMobile(),
            user.getLocation(),
            user.getProfileImage(),
            "Login successful"
        );
    }
}
