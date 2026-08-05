package com.clothmarket.controller;

import com.clothmarket.dto.PostRequest;
import com.clothmarket.model.Post;
import com.clothmarket.security.CurrentUser;
import com.clothmarket.service.PostService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {
    
    private final PostService postService;
    private final ObjectMapper objectMapper;
    
    // STEP 2 FIX: userId ab request param se nahi, JWT token se aata hai
    // (CurrentUser.id()). Isse koi bhi doosre user ki id bhejkar uske
    // naam se post nahi bana sakta (IDOR/impersonation fixed).
    @PostMapping("/create")
    public ResponseEntity<?> createPost(
            @RequestParam("postData") String postDataJson,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            Long userId = CurrentUser.id();
            PostRequest postRequest = objectMapper.readValue(postDataJson, PostRequest.class);
            Post post = postService.createPost(userId, postRequest, file);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/feed")
    public ResponseEntity<Page<Post>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Post> posts = postService.getFeed(page, size);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getUserPosts(@PathVariable Long userId) {
        try {
            List<Post> posts = postService.getUserPosts(userId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPostById(@PathVariable Long postId) {
        try {
            Post post = postService.getPostById(postId);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId) {

        try {
            Long userId = CurrentUser.id();
            postService.deletePost(postId, userId);
            return ResponseEntity.ok("Post deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    private record ErrorResponse(String message) {}
}
