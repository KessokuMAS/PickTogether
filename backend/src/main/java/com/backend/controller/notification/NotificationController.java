package com.backend.controller.notification;

import com.backend.dto.notification.NotificationDTO;
import com.backend.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Log4j2
public class NotificationController {
    
    private final NotificationService notificationService;
    
    // 특정 회원의 알림 목록 조회
    @GetMapping("/member/{email}")
    public ResponseEntity<Page<NotificationDTO>> getNotificationsByMember(
            @PathVariable String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<NotificationDTO> notifications = notificationService.getNotificationsByMemberEmail(email, pageable);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("알림 목록 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 특정 회원의 읽지 않은 알림 개수
    @GetMapping("/member/{email}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String email) {
        try {
            Long count = notificationService.getUnreadCountByMemberEmail(email);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("읽지 않은 알림 개수 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 특정 알림을 읽음 처리
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("알림 읽음 처리 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 특정 회원의 모든 알림을 읽음 처리
    @PutMapping("/member/{email}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String email) {
        try {
            notificationService.markAllAsReadByMemberEmail(email);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("모든 알림 읽음 처리 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 특정 알림 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("알림 삭제 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 특정 회원의 모든 읽은 알림 삭제
    @DeleteMapping("/member/{email}/read-delete-all")
    public ResponseEntity<Void> deleteAllReadNotifications(@PathVariable String email) {
        try {
            notificationService.deleteAllReadNotificationsByMemberEmail(email);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("읽은 알림 전체 삭제 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 