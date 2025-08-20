package com.backend.domain.restaurant;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "restaurant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id; // 자동 증가 ID

    @Column(name = "name", nullable = false, length = 200)
    private String name; // 음식점 이름

    @Column(name = "category_name", length = 200)
    private String categoryName; // 카테고리명 (음식점 > 한식 등)

    @Column(name = "phone", length = 50)
    private String phone; // 전화번호

    @Column(name = "road_address_name", length = 300)
    private String roadAddressName; // 도로명 주소

    @Column(name = "x", nullable = false)
    private Double x; // 경도(Longitude)

    @Column(name = "y", nullable = false)
    private Double y; // 위도(Latitude)

    @Column(name = "place_url", length = 500)
    private String placeUrl; // 카카오 장소 URL

    @Column(name = "distance")
    private Integer distance; // 중심 좌표로부터 거리(m)

    @Column(name = "funding_amount", nullable = false)
    private Long fundingAmount; // 현재 펀딩 금액(₩)

    @Column(name = "funding_goal_amount", nullable = false)
    private Long fundingGoalAmount; // 목표 펀딩 금액(₩

    @Column(name = "funding_start_date")
    private LocalDate fundingStartDate; // 펀딩 시작일

    @Column(name = "funding_end_date")
    private LocalDate fundingEndDate; // 펀딩 종료일
}
