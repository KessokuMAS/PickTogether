package com.backend.service.specialty;

import com.backend.dto.specialty.FundingSpecialtyDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface FundingSpecialtyService {

    // 특산품 구매 주문 생성
    FundingSpecialtyDTO createOrder(FundingSpecialtyDTO orderDTO);

    // 결제 완료 처리
    FundingSpecialtyDTO completePayment(String impUid, String merchantUid);

    // 주문 조회 (ID)
    FundingSpecialtyDTO getOrderById(Long id);

    // 주문 조회 (결제 고유번호)
    FundingSpecialtyDTO getOrderByImpUid(String impUid);

    // 주문 조회 (주문번호)
    FundingSpecialtyDTO getOrderByMerchantUid(String merchantUid);

    // 회원별 주문 목록 조회
    List<FundingSpecialtyDTO> getOrdersByMemberId(String memberId);

    // 회원별 주문 목록 조회 (페이징)
    Page<FundingSpecialtyDTO> getOrdersByMemberId(String memberId, Pageable pageable);

    // 특산품별 주문 목록 조회
    List<FundingSpecialtyDTO> getOrdersBySpecialtyId(String specialtyId);

    // 주문 상태별 조회
    List<FundingSpecialtyDTO> getOrdersByStatus(String orderStatus);

    // 기간별 주문 조회
    List<FundingSpecialtyDTO> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    // 주문 상태 변경
    FundingSpecialtyDTO updateOrderStatus(Long id, String newStatus);

    // 주문 취소
    FundingSpecialtyDTO cancelOrder(Long id);

    // 배송 상태 업데이트
    FundingSpecialtyDTO updateShippingStatus(Long id, String status);

    // 특산품별 총 주문 수량
    Long getTotalQuantityBySpecialtyId(String specialtyId);

    // 특산품별 총 매출
    Long getTotalAmountBySpecialtyId(String specialtyId);

    // 회원의 총 구매 금액
    Long getTotalAmountByMemberId(String memberId);

    // 전체 주문 목록 조회 (관리자용)
    Page<FundingSpecialtyDTO> getAllOrders(Pageable pageable);
} 