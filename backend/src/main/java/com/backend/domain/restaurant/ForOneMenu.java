package com.backend.domain.restaurant;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter @Setter
@Builder
@NoArgsConstructor @AllArgsConstructor
@Entity
@Table(
    name = "for_one_menu",
    indexes = {
        @Index(name = "idx_fom_menu", columnList = "menu_id"),
        @Index(name = "idx_fom_status_time", columnList = "status, starts_at, ends_at")
    }
)
@ToString(exclude = "menu")
public class ForOneMenu {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 어떤 메뉴의 한그릇 펀딩인지 */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;

    /** 스냅샷 가격(생성 시점 메뉴 가격 복제) */
    @Column(nullable = false)
    private Integer originalPrice;

    /** 할인 퍼센트 (0~100). fundingPrice가 명시되면 이 값은 참고용 */
    @Column
    private Integer discountPercent;

    /** 펀딩 적용 가격(명시형). null이면 originalPrice와 discountPercent로 계산 */
    @Column
    private Integer fundingPrice;

    /** 최소/최대 참여 인원 */
    @Column(nullable = false)
    private Integer minParticipants;   // 목표 인원
    @Column
    private Integer maxParticipants;   // 상한(없으면 null)

    /** 현재 참여 인원 */
    @Column(nullable = false)
    private Integer currentParticipants;

    /** 기간 */
    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt;
    @Column(name = "ends_at", nullable = false)
    private LocalDateTime endsAt;

    /** 상태 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ForOneStatus status;

    /** 생성/수정 시간 */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /** 최종 결제가 기준이 되는 펀딩 가격 */
    public int effectiveFundingPrice() {
        if (fundingPrice != null) return fundingPrice;
        int percent = (discountPercent == null) ? 0 : discountPercent;
        return Math.max(0, originalPrice - (originalPrice * percent / 100));
    }

    /** 목표 달성 여부 */
    public boolean meetGoal() {
        return currentParticipants >= minParticipants;
    }

    /** 생성 전 기본값/스냅샷 세팅 */
    @PrePersist
    private void prePersist() {
        if (currentParticipants == null) currentParticipants = 0;
        if (originalPrice == null && menu != null && menu.getPrice() != null) {
            originalPrice = menu.getPrice(); // 가격 스냅샷
        }
    }
}
