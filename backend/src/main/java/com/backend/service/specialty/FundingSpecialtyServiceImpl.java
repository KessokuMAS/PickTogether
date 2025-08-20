package com.backend.service.specialty;

import com.backend.domain.specialty.FundingSpecialty;
import com.backend.dto.specialty.FundingSpecialtyDTO;
import com.backend.repository.specialty.FundingSpecialtyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class FundingSpecialtyServiceImpl implements FundingSpecialtyService {

    private final FundingSpecialtyRepository fundingSpecialtyRepository;

    @Override
    public FundingSpecialtyDTO createOrder(FundingSpecialtyDTO orderDTO) {
        log.info("특산품 주문 생성: {}", orderDTO.getSpecialtyName());

        FundingSpecialty order = FundingSpecialty.builder()
                .memberId(orderDTO.getMemberId())
                .specialtyId(orderDTO.getSpecialtyId())
                .specialtyName(orderDTO.getSpecialtyName())
                .quantity(orderDTO.getQuantity())
                .unitPrice(orderDTO.getUnitPrice())
                .totalAmount(orderDTO.getTotalAmount())
                .buyerName(orderDTO.getBuyerName())
                .buyerPhone(orderDTO.getBuyerPhone())
                .buyerEmail(orderDTO.getBuyerEmail())
                .zipCode(orderDTO.getZipCode())
                .address(orderDTO.getAddress())
                .detailAddress(orderDTO.getDetailAddress())
                .paymentMethod(orderDTO.getPaymentMethod())
                .merchantUid(orderDTO.getMerchantUid())
                .orderStatus(FundingSpecialty.OrderStatus.PENDING)
                .agreeSms(orderDTO.getAgreeSms())
                .agreeEmail(orderDTO.getAgreeEmail())
                .sidoNm(orderDTO.getSidoNm())
                .sigunguNm(orderDTO.getSigunguNm())
                .build();

        FundingSpecialty savedOrder = fundingSpecialtyRepository.save(order);
        log.info("특산품 주문 생성 완료: ID={}", savedOrder.getId());

        return FundingSpecialtyDTO.fromEntity(savedOrder);
    }

    @Override
    public FundingSpecialtyDTO completePayment(String impUid, String merchantUid) {
        log.info("결제 완료 처리: impUid={}, merchantUid={}", impUid, merchantUid);

        FundingSpecialty order = fundingSpecialtyRepository.findByMerchantUid(merchantUid)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다: " + merchantUid));

        order.setImpUid(impUid);
        order.setOrderStatus(FundingSpecialty.OrderStatus.PAID);

        FundingSpecialty updatedOrder = fundingSpecialtyRepository.save(order);
        log.info("결제 완료 처리 완료: ID={}", updatedOrder.getId());

        return FundingSpecialtyDTO.fromEntity(updatedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public FundingSpecialtyDTO getOrderById(Long id) {
        FundingSpecialty order = fundingSpecialtyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다: " + id));
        return FundingSpecialtyDTO.fromEntity(order);
    }

    @Override
    @Transactional(readOnly = true)
    public FundingSpecialtyDTO getOrderByImpUid(String impUid) {
        FundingSpecialty order = fundingSpecialtyRepository.findByImpUid(impUid)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다: " + impUid));
        return FundingSpecialtyDTO.fromEntity(order);
    }

    @Override
    @Transactional(readOnly = true)
    public FundingSpecialtyDTO getOrderByMerchantUid(String merchantUid) {
        FundingSpecialty order = fundingSpecialtyRepository.findByMerchantUid(merchantUid)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다: " + merchantUid));
        return FundingSpecialtyDTO.fromEntity(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FundingSpecialtyDTO> getOrdersByMemberId(String memberId) {
        List<FundingSpecialty> orders = fundingSpecialtyRepository.findByMemberIdOrderByCreatedAtDesc(memberId);
        return orders.stream()
                .map(FundingSpecialtyDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FundingSpecialtyDTO> getOrdersByMemberId(String memberId, Pageable pageable) {
        Page<FundingSpecialty> orders = fundingSpecialtyRepository.findByMemberIdOrderByCreatedAtDesc(memberId, pageable);
        return orders.map(FundingSpecialtyDTO::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FundingSpecialtyDTO> getOrdersBySpecialtyId(String specialtyId) {
        List<FundingSpecialty> orders = fundingSpecialtyRepository.findBySpecialtyIdOrderByCreatedAtDesc(specialtyId);
        return orders.stream()
                .map(FundingSpecialtyDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FundingSpecialtyDTO> getOrdersByStatus(String orderStatus) {
        FundingSpecialty.OrderStatus status = FundingSpecialty.OrderStatus.valueOf(orderStatus.toUpperCase());
        List<FundingSpecialty> orders = fundingSpecialtyRepository.findByOrderStatusOrderByCreatedAtDesc(status);
        return orders.stream()
                .map(FundingSpecialtyDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FundingSpecialtyDTO> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<FundingSpecialty> orders = fundingSpecialtyRepository.findByCreatedAtBetween(startDate, endDate);
        return orders.stream()
                .map(FundingSpecialtyDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public FundingSpecialtyDTO updateOrderStatus(Long id, String newStatus) {
        log.info("주문 상태 변경: ID={}, newStatus={}", id, newStatus);

        FundingSpecialty order = fundingSpecialtyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다: " + id));

        FundingSpecialty.OrderStatus status = FundingSpecialty.OrderStatus.valueOf(newStatus.toUpperCase());
        order.setOrderStatus(status);

        FundingSpecialty updatedOrder = fundingSpecialtyRepository.save(order);
        log.info("주문 상태 변경 완료: ID={}, status={}", updatedOrder.getId(), updatedOrder.getOrderStatus());

        return FundingSpecialtyDTO.fromEntity(updatedOrder);
    }

    @Override
    public FundingSpecialtyDTO cancelOrder(Long id) {
        log.info("주문 취소: ID={}", id);
        return updateOrderStatus(id, "CANCELLED");
    }

    @Override
    public FundingSpecialtyDTO updateShippingStatus(Long id, String status) {
        log.info("배송 상태 업데이트: ID={}, status={}", id, status);
        return updateOrderStatus(id, status);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getTotalQuantityBySpecialtyId(String specialtyId) {
        Long totalQuantity = fundingSpecialtyRepository.getTotalQuantityBySpecialtyId(specialtyId);
        return totalQuantity != null ? totalQuantity : 0L;
    }

    @Override
    @Transactional(readOnly = true)
    public Long getTotalAmountBySpecialtyId(String specialtyId) {
        Long totalAmount = fundingSpecialtyRepository.getTotalAmountBySpecialtyId(specialtyId);
        return totalAmount != null ? totalAmount : 0L;
    }

    @Override
    @Transactional(readOnly = true)
    public Long getTotalAmountByMemberId(String memberId) {
        Long totalAmount = fundingSpecialtyRepository.getTotalAmountByMemberId(memberId);
        return totalAmount != null ? totalAmount : 0L;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FundingSpecialtyDTO> getAllOrders(Pageable pageable) {
        Page<FundingSpecialty> orders = fundingSpecialtyRepository.findAll(pageable);
        return orders.map(FundingSpecialtyDTO::fromEntity);
    }
} 