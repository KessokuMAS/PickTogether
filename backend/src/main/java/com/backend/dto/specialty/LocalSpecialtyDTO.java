package com.backend.dto.specialty;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalSpecialtyDTO {
    
    private Long id;
    private String cntntsNo;
    private String cntntsSj;
    private String areaNm;
    private String imgUrl;
    private LocalDate svcDt;
    private String linkUrl;
    private String areaCode;
    private String sidoNm;
    private String sigunguNm;
    private LocalDate createdAt;
    
    // 펀딩 관련 정보
    private Long fundingGoalAmount;
    private Long fundingAmount;
    private Integer fundingPercent;
    private Long totalFundingAmount; // 펀딩 테이블 결제내역 합산 금액
} 