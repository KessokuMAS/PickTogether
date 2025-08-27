package com.backend.dto.member;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundingDTO {
    
    private Long id;
    private Long restaurantId; // 레스토랑 ID 추가
    private String restaurantName;
    private String menuInfo;
    private Long totalAmount;
    private String paymentMethod;
    private String impUid;
    private String merchantUid;
    private Boolean agreeSMS;
    private Boolean agreeEmail;
    private String status;
    private LocalDateTime createdAt;
} 