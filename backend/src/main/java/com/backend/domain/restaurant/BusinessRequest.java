package com.backend.domain.restaurant;

import com.backend.domain.member.Member;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "business_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class BusinessRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "category_name")
    private String categoryName;
    
    @Column
    private String phone;
    
    @Column(name = "road_address_name", nullable = false)
    private String roadAddressName;
    
    @Column(nullable = false)
    private Double x;
    
    @Column(nullable = false)
    private Double y;
    
    @Column(name = "place_url")
    private String placeUrl;
    
    @Column(name = "funding_goal_amount")
    private Long fundingGoalAmount;
    
    @Column(name = "funding_start_date")
    private String fundingStartDate;

    @Column(name = "funding_end_date")
    private String fundingEndDate;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BusinessRequestStatus status;

    // 인증된 사용자 정보 스냅샷 (회원 레코드가 없어도 저장 가능하도록)
    @Column(name = "requester_email", length = 255)
    private String requesterEmail;

    @Column(name = "requester_nickname", length = 255)
    private String requesterNickname;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_comment")
    private String reviewComment;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = BusinessRequestStatus.PENDING;
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
} 