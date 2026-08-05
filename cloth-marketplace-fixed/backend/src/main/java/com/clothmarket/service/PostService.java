package com.clothmarket.service;

import com.clothmarket.dto.PostRequest;
import com.clothmarket.model.Post;
import com.clothmarket.model.User;
import com.clothmarket.repository.PostRepository;
import com.clothmarket.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final ModerationService moderationService;
    // ================= CREATE POST =================
    public Post createPost(
            Long userId,
            PostRequest request,
            MultipartFile file
    ) throws IOException {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Post post = new Post();
        post.setUser(user);
        post.setUserId(userId);
        post.setDescription(request.getDescription());
        post.setPrice(request.getPrice());
        post.setQuantity(request.getQuantity());
        post.setClothType(request.getClothType());

        // ================= FILE UPLOAD (STEP 5 FIX: Cloudinary/local via StorageService) =================
        // ================= FILE UPLOAD (STEP 5 FIX: Cloudinary/local via StorageService) =================
        if (file != null && !file.isEmpty()) {

            // AI MODERATION: agar image me nudity/porn content milta hai,
            // yahan exception throw hoga aur poora post creation cancel ho
            // jayega - post kabhi database me save nahi hoga.
            String contentTypeCheck = file.getContentType();
            if (contentTypeCheck != null && contentTypeCheck.startsWith("image/")) {
                moderationService.checkImage(file);
            }

            String mediaUrl = storageService.store(file, "posts");
            post.setMediaUrl(mediaUrl);

            String contentType = file.getContentType();
            if (contentType != null) {
                if (contentType.startsWith("image/")) {
                    post.setMediaType("image");
                } else if (contentType.startsWith("video/")) {
                    post.setMediaType("video");
                }
            }
        }

        // Post save karo — createdAt @PrePersist se auto set hoga
        Post savedPost = postRepository.save(post);

        // Naye post me bhi user info set karo
        // taaki frontend ko turant sahi data mile
        savedPost.setUserName(user.getName());
        savedPost.setUserLocation(user.getLocation());
        savedPost.setUserProfileImage(user.getProfileImage());

        return savedPost;
    }

    // ================= FEED (N+1 fix) =================
    public Page<Post> getFeed(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts =
                postRepository.findAllOrderByCreatedAtDesc(pageable);

        // ✅ Sab userIds ek baar nikalo
        List<Long> userIds = posts.stream()
                .map(Post::getUserId)
                .distinct()
                .collect(Collectors.toList());

        // ✅ Ek hi DB query me saare users fetch karo
        Map<Long, User> userMap = userRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // ✅ Map se user info set karo — koi extra DB call nahi
        posts.forEach(post -> {
            User user = userMap.get(post.getUserId());
            if (user != null) {
                post.setUserName(user.getName());
                post.setUserLocation(user.getLocation());
                post.setUserProfileImage(user.getProfileImage());
            }
        });

        return posts;
    }

    // ================= USER POSTS =================
    public List<Post> getUserPosts(Long userId) {

        List<Post> posts = postRepository.findUserPosts(userId);

        // getUserPosts me sirf ek user ke posts hain
        // isliye ek query kaafi hai
        User user = userRepository.findById(userId).orElse(null);

        if (user != null) {
            posts.forEach(post -> {
                post.setUserName(user.getName());
                post.setUserLocation(user.getLocation());
                post.setUserProfileImage(user.getProfileImage());
            });
        }

        return posts;
    }

    // ================= SINGLE POST =================
    public Post getPostById(Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new RuntimeException("Post not found"));

        User user = userRepository
                .findById(post.getUserId())
                .orElse(null);

        if (user != null) {
            post.setUserName(user.getName());
            post.setUserLocation(user.getLocation());
            post.setUserProfileImage(user.getProfileImage());
        }

        return post;
    }

    // ================= DELETE POST =================
    public void deletePost(Long postId, Long userId) throws IOException {

        Post post = postRepository.findByIdAndUserId(postId, userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Post not found or access denied"));

        // Local disk cleanup only (no-op if file is on Cloudinary)
        storageService.deleteLocalIfApplicable(post.getMediaUrl());

        postRepository.delete(post);
    }
}
//why iam going to test whey dthis hf