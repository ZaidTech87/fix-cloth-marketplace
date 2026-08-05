package com.clothmarket.controller;

import com.clothmarket.model.User;
import com.clothmarket.security.CurrentUser;
import com.clothmarket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam("name") String name) {
        List<User> users = userService.searchUsersByName(name);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/mobile/{mobile}")
    public ResponseEntity<User> getUserByMobile(@PathVariable String mobile) {
        try {
            User user = userService.getUserByMobile(mobile);
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // STEP 2 FIX: koi bhi user sirf apni khud ki profile image update kar sake,
    // path variable "id" ab sirf sanity-check ke liye hai - asli check
    // logged-in user (JWT se) ke against hota hai.
    @PostMapping("/{id}/profile-image")
    public ResponseEntity<?> updateProfileImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            Long loggedInUserId = CurrentUser.id();
            if (!loggedInUserId.equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("You can only update your own profile image"));
            }
            User updatedUser = userService.updateProfileImage(id, file);
            updatedUser.setPassword(null);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    private record ErrorResponse(String message) {}
}