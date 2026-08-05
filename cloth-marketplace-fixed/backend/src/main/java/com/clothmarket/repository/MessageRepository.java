package com.clothmarket.repository;

import com.clothmarket.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
            "(m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
            "(m.senderId = :userId2 AND m.receiverId = :userId1) " +
            "ORDER BY m.createdAt ASC")
    List<Message> findChatMessages(Long userId1, Long userId2);

    @Query("SELECT DISTINCT CASE " +
            "WHEN m.senderId = :userId THEN m.receiverId " +
            "ELSE m.senderId END " +
            "FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId")
    List<Long> findChatUserIds(Long userId);

    @Query("SELECT m FROM Message m WHERE " +
            "(m.senderId = :userId1 AND m.receiverId = :userId2) OR " +
            "(m.senderId = :userId2 AND m.receiverId = :userId1) " +
            "ORDER BY m.createdAt DESC")
    List<Message> findChatMessagesDesc(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT COUNT(m) FROM Message m WHERE " +
            "m.senderId = :fromUserId AND m.receiverId = :toUserId AND m.isRead = false")
    long countUnreadInChat(@Param("fromUserId") Long fromUserId, @Param("toUserId") Long toUserId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :userId AND m.isRead = false")
    long countTotalUnread(@Param("userId") Long userId);

    @Query("UPDATE Message m SET m.isRead = true WHERE " +
            "m.senderId = :fromUserId AND m.receiverId = :toUserId AND m.isRead = false")
    @org.springframework.data.jpa.repository.Modifying
    void markAsRead(@Param("fromUserId") Long fromUserId, @Param("toUserId") Long toUserId);
}