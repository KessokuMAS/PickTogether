package com.backend.dto.notification;

import com.backend.domain.notification.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDTO {
    private Long id;
    private String title;
    private String content;
    private NotificationType type;
    private Boolean isRead;
    private Long relatedId;
    private String relatedType;
    private LocalDateTime createdAt;
    
    // 회원 정보 (닉네임만)
    private String memberNickname;
} 