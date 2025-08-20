package com.backend.domain.notification;

public enum NotificationType {
    BUSINESS_REQUEST_APPROVED("가게요청 승인"),
    BUSINESS_REQUEST_REJECTED("가게요청 거부"),
    FUNDING_COMPLETED("펀딩 완료"),
    PAYMENT_SUCCESS("결제 성공"),
    SYSTEM_NOTICE("시스템 공지");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 