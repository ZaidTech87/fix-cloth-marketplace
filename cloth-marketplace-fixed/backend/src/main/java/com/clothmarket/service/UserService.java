package com.clothmarket.service;

import com.clothmarket.model.User;
import com.clothmarket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StorageService storageService;

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByMobile(String mobile) {
        return userRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> searchUsersByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return List.of();
        }
        List<User> users = userRepository.findTop10ByNameContainingIgnoreCase(name.trim());
        // Password kabhi bhi search results mein leak nahi honi chahiye
        users.forEach(u -> u.setPassword(null));
        return users;
    }

    // STEP 5 FIX: ab StorageService use hota hai (Cloudinary ya local fallback)
    public User updateProfileImage(Long userId, MultipartFile file) throws IOException {
        User user = getUserById(userId);
        String mediaUrl = storageService.store(file, "profiles");
        user.setProfileImage(mediaUrl);
        return userRepository.save(user);
    }
}
