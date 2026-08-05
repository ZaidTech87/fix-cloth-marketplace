package com.clothmarket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "sender_id", nullable = false)
    private Long senderId;
    
    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "voice_url")
    private String voiceUrl;
    
    @Column(name = "message_type")
    private String messageType; // "text" or "voice"
    
    @Column(name = "is_read")
    private Boolean isRead = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Transient
    private String senderName;
    
    @Transient
    private String receiverName;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
