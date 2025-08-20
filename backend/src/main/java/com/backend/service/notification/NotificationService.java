package com.backend.service.notification;

import com.backend.dto.notification.NotificationCreateDTO;
import com.backend.dto.notification.NotificationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    
    // 알림 생성
    void createNotification(NotificationCreateDTO createDTO);
    
    // 특정 회원의 알림 목록 조회
    Page<NotificationDTO> getNotificationsByMemberEmail(String memberEmail, Pageable pageable);
    
    // 특정 회원의 읽지 않은 알림 개수
    Long getUnreadCountByMemberEmail(String memberEmail);
    
    // 특정 알림을 읽음 처리
    void markAsRead(Long notificationId);
    
    // 특정 회원의 모든 알림을 읽음 처리
    void markAllAsReadByMemberEmail(String memberEmail);
    
    // 가게요청 승인 알림 생성
    void createBusinessRequestApprovedNotification(String memberEmail, String businessName);
    
    // 가게요청 거부 알림 생성
    void createBusinessRequestRejectedNotification(String memberEmail, String businessName, String reason);
    
    // 특정 알림 삭제
    void deleteNotification(Long notificationId);
    
    // 특정 회원의 모든 읽은 알림 삭제
    void deleteAllReadNotificationsByMemberEmail(String memberEmail);
} 