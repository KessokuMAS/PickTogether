package com.backend.domain.restaurant;

public enum BusinessRequestStatus {
    PENDING("대기중"),
    APPROVED("승인됨"),
    REJECTED("거부됨");
    
    private final String description;
    
    BusinessRequestStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
} 