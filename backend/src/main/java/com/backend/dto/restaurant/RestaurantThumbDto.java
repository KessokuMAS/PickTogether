// src/main/java/com/backend/dto/restaurant/RestaurantThumbDto.java
package com.backend.dto.restaurant;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RestaurantThumbDto {

    private Long restaurantId;       // 음식점 ID
    private String name;             // 음식점 이름
    private String placeUrl;         // 카카오 장소 URL
    private String roadAddressName;  // 도로명 주소

    private Long imageId;            // 이미지 ID
    private String imageUrl;         // 썸네일 URL
    private Boolean isMain;          // 대표 이미지 여부
    private Integer sortOrder;       // 정렬용 (옵션)

    private Long fundingAmount;      // 현재 펀딩 금액(₩)
    private Long fundingGoalAmount;  // 목표 펀딩 금액(₩)

    private Double distance;         // 동적 거리(m) — 소수 포함

    /** 0~100% 계산 (목표 0 또는 null이면 null) */
    public Integer getFundingPercent() {
        if (fundingGoalAmount == null || fundingGoalAmount <= 0 || fundingAmount == null) return null;
        long pct = Math.round((fundingAmount * 100.0) / fundingGoalAmount);
        if (pct < 0) pct = 0;
        if (pct > 100) pct = 100;
        return (int) pct;
    }

    /** 반올림한 m 값(프론트 표시용) */
    public Integer getDistanceMeters() {
        if (distance == null) return null;
        return (int) Math.round(distance);
    }
}
