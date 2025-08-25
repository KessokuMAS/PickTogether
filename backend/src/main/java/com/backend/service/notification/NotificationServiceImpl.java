package com.backend.service.notification;

import com.backend.domain.member.Member;
import com.backend.domain.notification.Notification;
import com.backend.domain.notification.NotificationType;
import com.backend.dto.notification.NotificationCreateDTO;
import com.backend.dto.notification.NotificationDTO;
import com.backend.repository.member.MemberRepository;
import com.backend.repository.notification.NotificationRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Log4j2
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final MemberRepository memberRepository;
    
    @Override
    @Transactional
    public void createNotification(NotificationCreateDTO createDTO) {
        try {
            Member member = memberRepository.findByEmail(createDTO.getMemberEmail())
                    .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다: " + createDTO.getMemberEmail()));
            
            Notification notification = Notification.builder()
                    .member(member)
                    .title(createDTO.getTitle())
                    .content(createDTO.getContent())
                    .type(createDTO.getType())
                    .isRead(false)
                    .relatedId(createDTO.getRelatedId())
                    .relatedType(createDTO.getRelatedType())
                    .build();
            
            notificationRepository.save(notification);
            log.info("알림 생성 완료: {} - {}", createDTO.getMemberEmail(), createDTO.getTitle());
        } catch (Exception e) {
            log.error("알림 생성 실패: {}", e.getMessage(), e);
            throw new RuntimeException("알림 생성에 실패했습니다.", e);
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getNotificationsByMemberEmail(String memberEmail, Pageable pageable) {
        return notificationRepository.findByMemberEmailOrderByCreatedAtDesc(memberEmail, pageable)
                .map(this::convertToDTO);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCountByMemberEmail(String memberEmail) {
        return notificationRepository.countUnreadByMemberEmail(memberEmail);
    }
    
    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.markAsReadById(notificationId);
    }
    
    @Override
    @Transactional
    public void markAllAsReadByMemberEmail(String memberEmail) {
        notificationRepository.markAllAsReadByMemberEmail(memberEmail);
    }
    
    @Override
    @Transactional
    public void createBusinessRequestApprovedNotification(String memberEmail, String businessName) {
        NotificationCreateDTO createDTO = NotificationCreateDTO.builder()
                .memberEmail(memberEmail)
                .title("가게요청이 승인되었습니다!")
                .content(String.format("'%s' 가게요청이 승인되었습니다. 이제 펀딩을 시작할 수 있습니다.", businessName))
                .type(NotificationType.BUSINESS_REQUEST_APPROVED)
                .relatedType("BUSINESS_REQUEST")
                .build();
        
        createNotification(createDTO);
    }
    
    @Override
    @Transactional
    public void createBusinessRequestRejectedNotification(String memberEmail, String businessName, String reason) {
        NotificationCreateDTO createDTO = NotificationCreateDTO.builder()
                .memberEmail(memberEmail)
                .title("가게요청이 거부되었습니다")
                .content(String.format("'%s' 가게요청이 거부되었습니다. 사유: %s", businessName, reason))
                .type(NotificationType.BUSINESS_REQUEST_REJECTED)
                .relatedType("BUSINESS_REQUEST")
                .build();
        
        createNotification(createDTO);
    }
    
    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        try {
            notificationRepository.deleteById(notificationId);
            log.info("알림 삭제 완료: {}", notificationId);
        } catch (Exception e) {
            log.error("알림 삭제 실패: {}", e.getMessage(), e);
            throw new RuntimeException("알림 삭제에 실패했습니다.", e);
        }
    }
    
    @Override
    @Transactional
    public void deleteAllReadNotificationsByMemberEmail(String memberEmail) {
        try {
            List<Notification> readNotifications = notificationRepository.findByMemberEmailAndIsReadTrue(memberEmail);
            notificationRepository.deleteAll(readNotifications);
            log.info("읽은 알림 전체 삭제 완료: {} - {}개", memberEmail, readNotifications.size());
        } catch (Exception e) {
            log.error("읽은 알림 전체 삭제 실패: {}", e.getMessage(), e);
            throw new RuntimeException("읽은 알림 전체 삭제에 실패했습니다.", e);
        }
    }
    
    private NotificationDTO convertToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .relatedId(notification.getRelatedId())
                .relatedType(notification.getRelatedType())
                .createdAt(notification.getCreatedAt())
                .memberNickname(notification.getMember().getNickname())
                .build();
    }
} 