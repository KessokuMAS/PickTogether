package com.backend.dto.member;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundingCreateRequest {
    
    private String memberId;
    private Long restaurantId;
    private String restaurantName;
    private String menuInfo;
    private Long totalAmount;
    private String paymentMethod;
    private String impUid;
    private String merchantUid;
    private Boolean agreeSMS;
    private Boolean agreeEmail;
} 