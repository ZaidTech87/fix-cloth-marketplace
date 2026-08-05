package com.clothmarket.controller;

import com.clothmarket.dto.ChatPreview;
import com.clothmarket.model.Message;
import com.clothmarket.model.User;
import com.clothmarket.security.CurrentUser;
import com.clothmarket.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // STEP 2 FIX: senderId ab JWT se aata hai, client isse spoof nahi kar sakta.
    @PostMapping("/send/text")
    public ResponseEntity<?> sendTextMessage(
            @RequestParam Long receiverId,
            @RequestParam String message) {
        try {
            Long senderId = CurrentUser.id();
            Message savedMessage = messageService.sendTextMessage(senderId, receiverId, message);
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/send/voice")
    public ResponseEntity<?> sendVoiceMessage(
            @RequestParam Long receiverId,
            @RequestParam("file") MultipartFile voiceFile) {
        try {
            Long senderId = CurrentUser.id();
            Message savedMessage = messageService.sendVoiceMessage(senderId, receiverId, voiceFile);
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // STEP 2 FIX: sirf apni khud ki conversation padh sakte hain -
    // logged-in user in dono me se ek hona chahiye.
    @GetMapping("/chat")
    public ResponseEntity<?> getChatMessages(@RequestParam Long otherUserId) {
        try {
            Long myId = CurrentUser.id();
            List<Message> messages = messageService.getChatMessages(myId, otherUserId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/chat-users/{userId}")
    public ResponseEntity<?> getChatUsers(@PathVariable Long userId) {
        if (!forbidIfNotSelf(userId)) return forbidden();
        try {
            List<User> users = messageService.getChatUsers(userId);
            users.forEach(user -> user.setPassword(null));
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/inbox/{userId}")
    public ResponseEntity<?> getInbox(@PathVariable Long userId) {
        if (!forbidIfNotSelf(userId)) return forbidden();
        try {
            return ResponseEntity.ok(messageService.getInbox(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long userId) {
        if (!forbidIfNotSelf(userId)) return forbidden();
        long count = messageService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // STEP 2 FIX: "toUserId" hamesha main khud hoon (jo padh raha hai),
    // client se lena zaroorat nahi - spoof-proof.
    @PostMapping("/mark-read")
    public ResponseEntity<?> markAsRead(@RequestParam Long fromUserId) {
        Long myId = CurrentUser.id();
        messageService.markAsRead(fromUserId, myId);
        return ResponseEntity.ok().build();
    }

    private boolean forbidIfNotSelf(Long pathUserId) {
        return CurrentUser.id().equals(pathUserId);
    }

    private ResponseEntity<?> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("You can only access your own data"));
    }

    private record ErrorResponse(String message) {}
}
