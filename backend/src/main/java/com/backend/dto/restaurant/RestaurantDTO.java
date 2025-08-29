package com.backend.dto.restaurant;

import lombok.*;


@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantDTO {
  private Long id;
  private String name;
  private String categoryName;
  private String phone;
  private String roadAddressName;
  private Double x; // 경도
  private Double y; // 위도
  private String placeUrl;

  private Long fundingAmount;
  private Long totalFundingAmount; // 펀딩 테이블 결제내역 합산 금액
  private Long fundingGoalAmount;
  private Integer fundingPercent; // 0~100

  private String imageUrl; // 대표 이미지 URL

  // 확장 정보
  private String description;
  private String businessHours;
  private String priceRange;
  private String tags;
  private String homepageUrl;
  private String instagramUrl;
  private String notice;

  // 펀딩 기간 (서버 기동 시 자동 생성/저장)
  private String fundingStartDate; // ISO yyyy-MM-dd
  private String fundingEndDate;   // ISO yyyy-MM-dd
} 