package com.backend.domain.member;

import com.backend.domain.restaurant.Restaurant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "funding")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Funding {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_email", referencedColumnName = "email", nullable = false)
    private Member member;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;
    
    @Column(name = "restaurant_name", nullable = false)
    private String restaurantName;
    
    @Column(name = "menu_info", columnDefinition = "TEXT")
    private String menuInfo; // JSON 형태로 메뉴 정보 저장
    
    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;
    
    @Column(name = "payment_method", nullable = false)
    private String paymentMethod; // kakaopay, tosspay, card
    
    @Column(name = "imp_uid")
    private String impUid; // 포트원 결제 고유 ID
    
    @Column(name = "merchant_uid")
    private String merchantUid; // 주문 고유 ID
    
    @Column(name = "agree_sms")
    private Boolean agreeSMS;
    
    @Column(name = "agree_email")
    private Boolean agreeEmail;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private FundingStatus status;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    public enum FundingStatus {
        COMPLETED,    // 완료
        CANCELLED,    // 취소
        REFUNDED      // 환불
    }
} 