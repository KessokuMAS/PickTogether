package com.backend.controller.specialty;

import com.backend.dto.specialty.FundingSpecialtyDTO;
import com.backend.service.specialty.FundingSpecialtyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/funding-specialty")
@RequiredArgsConstructor
@Log4j2
public class FundingSpecialtyController {

    private final FundingSpecialtyService fundingSpecialtyService;

    // 특산품 주문 생성
    @PostMapping
    public ResponseEntity<FundingSpecialtyDTO> createOrder(@RequestBody FundingSpecialtyDTO orderDTO) {
        try {
            log.info("특산품 주문 생성 요청: {}", orderDTO.getSpecialtyName());
            FundingSpecialtyDTO createdOrder = fundingSpecialtyService.createOrder(orderDTO);
            return ResponseEntity.ok(createdOrder);
        } catch (Exception e) {
            log.error("특산품 주문 생성 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 결제 완료 처리
    @PutMapping("/payment/complete")
    public ResponseEntity<FundingSpecialtyDTO> completePayment(@RequestBody Map<String, String> paymentInfo) {
        try {
            String impUid = paymentInfo.get("impUid");
            String merchantUid = paymentInfo.get("merchantUid");
            
            log.info("결제 완료 처리 요청: impUid={}, merchantUid={}", impUid, merchantUid);
            FundingSpecialtyDTO completedOrder = fundingSpecialtyService.completePayment(impUid, merchantUid);
            return ResponseEntity.ok(completedOrder);
        } catch (Exception e) {
            log.error("결제 완료 처리 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 주문 조회 (ID)
    @GetMapping("/{id}")
    public ResponseEntity<FundingSpecialtyDTO> getOrderById(@PathVariable Long id) {
        try {
            FundingSpecialtyDTO order = fundingSpecialtyService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("주문 조회 실패: ID={}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    // 주문 조회 (결제 고유번호)
    @GetMapping("/imp/{impUid}")
    public ResponseEntity<FundingSpecialtyDTO> getOrderByImpUid(@PathVariable String impUid) {
        try {
            FundingSpecialtyDTO order = fundingSpecialtyService.getOrderByImpUid(impUid);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("주문 조회 실패: impUid={}", impUid, e);
            return ResponseEntity.notFound().build();
        }
    }

    // 주문 조회 (주문번호)
    @GetMapping("/merchant/{merchantUid}")
    public ResponseEntity<FundingSpecialtyDTO> getOrderByMerchantUid(@PathVariable String merchantUid) {
        try {
            FundingSpecialtyDTO order = fundingSpecialtyService.getOrderByMerchantUid(merchantUid);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("주문 조회 실패: merchantUid={}", merchantUid, e);
            return ResponseEntity.notFound().build();
        }
    }

    // 회원별 주문 목록 조회
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<FundingSpecialtyDTO>> getOrdersByMemberId(@PathVariable String memberId) {
        try {
            List<FundingSpecialtyDTO> orders = fundingSpecialtyService.getOrdersByMemberId(memberId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("회원별 주문 조회 실패: memberId={}", memberId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 회원별 주문 목록 조회 (페이징)
    @GetMapping("/member/{memberId}/page")
    public ResponseEntity<Page<FundingSpecialtyDTO>> getOrdersByMemberIdWithPaging(
            @PathVariable String memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<FundingSpecialtyDTO> orders = fundingSpecialtyService.getOrdersByMemberId(memberId, pageable);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("회원별 주문 조회 실패 (페이징): memberId={}", memberId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 특산품별 주문 목록 조회
    @GetMapping("/specialty/{specialtyId}")
    public ResponseEntity<List<FundingSpecialtyDTO>> getOrdersBySpecialtyId(@PathVariable String specialtyId) {
        try {
            List<FundingSpecialtyDTO> orders = fundingSpecialtyService.getOrdersBySpecialtyId(specialtyId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("특산품별 주문 조회 실패: specialtyId={}", specialtyId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 주문 상태별 조회
    @GetMapping("/status/{status}")
    public ResponseEntity<List<FundingSpecialtyDTO>> getOrdersByStatus(@PathVariable String status) {
        try {
            List<FundingSpecialtyDTO> orders = fundingSpecialtyService.getOrdersByStatus(status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("상태별 주문 조회 실패: status={}", status, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 주문 상태 변경
    @PutMapping("/{id}/status")
    public ResponseEntity<FundingSpecialtyDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusInfo) {
        try {
            String newStatus = statusInfo.get("status");
            log.info("주문 상태 변경 요청: ID={}, newStatus={}", id, newStatus);
            FundingSpecialtyDTO updatedOrder = fundingSpecialtyService.updateOrderStatus(id, newStatus);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            log.error("주문 상태 변경 실패: ID={}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 주문 취소
    @PutMapping("/{id}/cancel")
    public ResponseEntity<FundingSpecialtyDTO> cancelOrder(@PathVariable Long id) {
        try {
            log.info("주문 취소 요청: ID={}", id);
            FundingSpecialtyDTO cancelledOrder = fundingSpecialtyService.cancelOrder(id);
            return ResponseEntity.ok(cancelledOrder);
        } catch (Exception e) {
            log.error("주문 취소 실패: ID={}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 배송 상태 업데이트
    @PutMapping("/{id}/shipping")
    public ResponseEntity<FundingSpecialtyDTO> updateShippingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> shippingInfo) {
        try {
            String status = shippingInfo.get("status");
            log.info("배송 상태 업데이트 요청: ID={}, status={}", id, status);
            FundingSpecialtyDTO updatedOrder = fundingSpecialtyService.updateShippingStatus(id, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            log.error("배송 상태 업데이트 실패: ID={}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 특산품별 통계 조회
    @GetMapping("/statistics/specialty/{specialtyId}")
    public ResponseEntity<Map<String, Object>> getSpecialtyStatistics(@PathVariable String specialtyId) {
        try {
            Long totalQuantity = fundingSpecialtyService.getTotalQuantityBySpecialtyId(specialtyId);
            Long totalAmount = fundingSpecialtyService.getTotalAmountBySpecialtyId(specialtyId);
            
            Map<String, Object> statistics = Map.of(
                "specialtyId", specialtyId,
                "totalQuantity", totalQuantity,
                "totalAmount", totalAmount
            );
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("특산품 통계 조회 실패: specialtyId={}", specialtyId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 회원별 구매 통계 조회
    @GetMapping("/statistics/member/{memberId}")
    public ResponseEntity<Map<String, Object>> getMemberStatistics(@PathVariable String memberId) {
        try {
            Long totalAmount = fundingSpecialtyService.getTotalAmountByMemberId(memberId);
            List<FundingSpecialtyDTO> orders = fundingSpecialtyService.getOrdersByMemberId(memberId);
            
            Map<String, Object> statistics = Map.of(
                "memberId", memberId,
                "totalAmount", totalAmount,
                "totalOrders", orders.size()
            );
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("회원 통계 조회 실패: memberId={}", memberId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 전체 주문 목록 조회 (관리자용)
    @GetMapping("/admin/all")
    public ResponseEntity<Page<FundingSpecialtyDTO>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<FundingSpecialtyDTO> orders = fundingSpecialtyService.getAllOrders(pageable);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("전체 주문 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 