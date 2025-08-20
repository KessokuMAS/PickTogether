package com.backend.dto.specialty;

import com.backend.domain.specialty.FundingSpecialty;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundingSpecialtyDTO {

    private Long id;

    // 회원 정보
    private String memberId;

    // 특산품 정보
    private String specialtyId;
    private String specialtyName;
    private Integer quantity;
    private Long unitPrice;
    private Long totalAmount;

    // 구매자 정보
    private String buyerName;
    private String buyerPhone;
    private String buyerEmail;

    // 배송 정보
    private String zipCode;
    private String address;
    private String detailAddress;
    private String fullAddress; // 전체 주소 (조합)

    // 결제 정보
    private String paymentMethod;
    private String impUid;
    private String merchantUid;

    // 주문 상태
    private FundingSpecialty.OrderStatus orderStatus;
    private String orderStatusText; // 한글 상태명

    // 수신 동의
    private Boolean agreeSms;
    private Boolean agreeEmail;

    // 지역 정보
    private String sidoNm;
    private String sigunguNm;
    private String regionText; // 지역명 조합

    // 시간 정보
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 추가 정보
    private String formattedCreatedAt; // 포맷된 생성일
    private String formattedTotalAmount; // 포맷된 금액

    // Entity에서 DTO로 변환하는 정적 메서드
    public static FundingSpecialtyDTO fromEntity(FundingSpecialty entity) {
        if (entity == null) return null;

        return FundingSpecialtyDTO.builder()
                .id(entity.getId())
                .memberId(entity.getMemberId())
                .specialtyId(entity.getSpecialtyId())
                .specialtyName(entity.getSpecialtyName())
                .quantity(entity.getQuantity())
                .unitPrice(entity.getUnitPrice())
                .totalAmount(entity.getTotalAmount())
                .buyerName(entity.getBuyerName())
                .buyerPhone(entity.getBuyerPhone())
                .buyerEmail(entity.getBuyerEmail())
                .zipCode(entity.getZipCode())
                .address(entity.getAddress())
                .detailAddress(entity.getDetailAddress())
                .fullAddress(buildFullAddress(entity.getAddress(), entity.getDetailAddress()))
                .paymentMethod(entity.getPaymentMethod())
                .impUid(entity.getImpUid())
                .merchantUid(entity.getMerchantUid())
                .orderStatus(entity.getOrderStatus())
                .orderStatusText(getOrderStatusText(entity.getOrderStatus()))
                .agreeSms(entity.getAgreeSms())
                .agreeEmail(entity.getAgreeEmail())
                .sidoNm(entity.getSidoNm())
                .sigunguNm(entity.getSigunguNm())
                .regionText(buildRegionText(entity.getSidoNm(), entity.getSigunguNm()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .formattedCreatedAt(formatDateTime(entity.getCreatedAt()))
                .formattedTotalAmount(formatAmount(entity.getTotalAmount()))
                .build();
    }

    // 전체 주소 조합
    private static String buildFullAddress(String address, String detailAddress) {
        if (address == null && detailAddress == null) return null;
        if (address == null) return detailAddress;
        if (detailAddress == null) return address;
        return address + " " + detailAddress;
    }

    // 지역명 조합
    private static String buildRegionText(String sidoNm, String sigunguNm) {
        if (sidoNm == null && sigunguNm == null) return null;
        if (sidoNm == null) return sigunguNm;
        if (sigunguNm == null) return sidoNm;
        return sidoNm + " " + sigunguNm;
    }

    // 주문 상태 한글 변환
    private static String getOrderStatusText(FundingSpecialty.OrderStatus status) {
        if (status == null) return "알 수 없음";
        
        switch (status) {
            case PENDING: return "결제 대기";
            case PAID: return "결제 완료";
            case SHIPPED: return "배송 중";
            case DELIVERED: return "배송 완료";
            case CANCELLED: return "주문 취소";
            default: return "알 수 없음";
        }
    }

    // 날짜 포맷
    private static String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.toString(); // 필요에 따라 포맷 변경
    }

    // 금액 포맷
    private static String formatAmount(Long amount) {
        if (amount == null) return "0원";
        return String.format("%,d원", amount);
    }
} 