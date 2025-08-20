package com.backend.domain.specialty;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "local_specialty")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalSpecialty {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "cntnts_no", unique = true, nullable = false)
    private String cntntsNo; // 콘텐츠 번호(키)
    
    @Column(name = "cntnts_sj", nullable = false, length = 500)
    private String cntntsSj; // 콘텐츠 제목
    
    @Column(name = "area_nm", length = 100)
    private String areaNm; // 지역명
    
    @Column(name = "img_url", length = 1000)
    private String imgUrl; // 이미지 URL
    
    @Column(name = "svc_dt")
    private LocalDate svcDt; // 등록일
    
    @Column(name = "link_url", length = 1000)
    private String linkUrl; // 관련 사이트 URL
    
    @Column(name = "area_code", length = 20)
    private String areaCode; // 행정동 코드
    
    @Column(name = "sido_nm", length = 50)
    private String sidoNm; // 시도명
    
    @Column(name = "sigungu_nm", length = 50)
    private String sigunguNm; // 시군구명
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDate createdAt; // DB 저장일
    
    @Column(name = "funding_goal_amount", nullable = false)
    private Long fundingGoalAmount = 500000L; // 펀딩 목표 금액 (50만원)
    
    @Column(name = "funding_amount", nullable = false)
    private Long fundingAmount = 0L; // 현재 펀딩 금액
} 