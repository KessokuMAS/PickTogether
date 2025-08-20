package com.backend.repository.notification;

import com.backend.domain.notification.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // 특정 회원의 알림 목록 조회 (페이징)
    Page<Notification> findByMemberEmailOrderByCreatedAtDesc(String memberEmail, Pageable pageable);
    
    // 특정 회원의 읽지 않은 알림 개수
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.member.email = :email AND n.isRead = false")
    Long countUnreadByMemberEmail(@Param("email") String email);
    
    // 특정 회원의 모든 알림을 읽음 처리
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.member.email = :email")
    void markAllAsReadByMemberEmail(@Param("email") String email);
    
    // 특정 알림을 읽음 처리
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id")
    void markAsReadById(@Param("id") Long id);
    
    // 특정 회원의 읽은 알림 목록 조회
    List<Notification> findByMemberEmailAndIsReadTrue(String memberEmail);
} 