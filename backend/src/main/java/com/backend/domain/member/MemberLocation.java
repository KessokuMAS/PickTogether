package com.backend.domain.member;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "member_location")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "member")
public class MemberLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // PK

    private String name; // 위치 이름(예: 집, 회사, 자주 가는 식당)

    private Double latitude; // 위도
    private Double longitude; // 경도

    private String address; // 전체 주소
    private String roadAddress; // 도로명 주소 (옵션)

    // 회원과의 연관 관계 설정 (다대일)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_email")
    private Member member;

    // Kakao Place ID 같이 외부 식별자 저장 가능
    private String kakaoPlaceId;
}
