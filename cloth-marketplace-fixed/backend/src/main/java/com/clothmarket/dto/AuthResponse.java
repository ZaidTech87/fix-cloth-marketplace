package com.clothmarket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String mobile;
    private String location;
    private String profileImage;
    private String message;
}
