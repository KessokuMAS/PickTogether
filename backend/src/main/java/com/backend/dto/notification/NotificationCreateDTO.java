package com.backend.dto.notification;

import com.backend.domain.notification.NotificationType;
import lombok.*;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class NotificationCreateDTO {
    private String memberEmail;
    private String title;
    private String content;
    private NotificationType type;
    private Long relatedId;
    private String relatedType;
} 