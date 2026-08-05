package com.clothmarket.model;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
    
    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "media_url")
    private String mediaUrl;
    
    @Column(name = "media_type")
    private String mediaType; // "image" or "video"
    
    private Double price;
    
    private Integer quantity;
    
    @Column(name = "cloth_type")
    private String clothType;
    
    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @Transient
    private String userName;
    
    @Transient
    private String userLocation;
    
    @Transient
    private String userProfileImage;

    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
