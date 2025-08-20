package com.backend.domain.specialty;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "funding_specialty")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class FundingSpecialty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 회원 정보
    @Column(name = "member_id", nullable = false)
    private String memberId; // 회원 이메일

    // 특산품 정보
    @Column(name = "specialty_id", nullable = false)
    private String specialtyId; // cntntsNo

    @Column(name = "specialty_name", nullable = false, length = 500)
    private String specialtyName;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private Long unitPrice;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    // 구매자 정보
    @Column(name = "buyer_name", nullable = false)
    private String buyerName;

    @Column(name = "buyer_phone", nullable = false)
    private String buyerPhone;

    @Column(name = "buyer_email", nullable = false)
    private String buyerEmail;

    // 배송 정보
    @Column(name = "zip_code")
    private String zipCode;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "detail_address", length = 500)
    private String detailAddress;

    // 결제 정보
    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Column(name = "imp_uid", unique = true)
    private String impUid; // 포트원 결제 고유번호

    @Column(name = "merchant_uid", unique = true)
    private String merchantUid; // 주문번호

    // 주문 상태
    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus = OrderStatus.PENDING;

    // 수신 동의
    @Column(name = "agree_sms")
    private Boolean agreeSms = false;

    @Column(name = "agree_email")
    private Boolean agreeEmail = false;

    // 지역 정보 (특산품 원산지)
    @Column(name = "sido_nm")
    private String sidoNm;

    @Column(name = "sigungu_nm")
    private String sigunguNm;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 주문 상태 enum
    public enum OrderStatus {
        PENDING,    // 결제 대기
        PAID,       // 결제 완료
        SHIPPED,    // 배송 중
        DELIVERED,  // 배송 완료
        CANCELLED   // 주문 취소
    }
} 