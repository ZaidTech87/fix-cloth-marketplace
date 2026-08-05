package com.clothmarket.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
public class SignUpRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Enter a valid mobile number (10-15 digits)")
    private String mobile;
    
    // STEP 8 FIX: sirf length nahi, kam se kam ek letter + ek digit bhi
    // zaroori - taaki "111111" jaisa weak password na chal jaye.
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
        message = "Password must contain at least one letter and one number"
    )
    private String password;
}
