package com.backend.repository.specialty;

import com.backend.domain.specialty.FundingSpecialty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FundingSpecialtyRepository extends JpaRepository<FundingSpecialty, Long> {

    // 회원별 주문 조회
    List<FundingSpecialty> findByMemberIdOrderByCreatedAtDesc(String memberId);

    // 회원별 주문 조회 (페이징)
    Page<FundingSpecialty> findByMemberIdOrderByCreatedAtDesc(String memberId, Pageable pageable);

    // 특산품별 주문 조회
    List<FundingSpecialty> findBySpecialtyIdOrderByCreatedAtDesc(String specialtyId);

    // 주문 상태별 조회
    List<FundingSpecialty> findByOrderStatusOrderByCreatedAtDesc(FundingSpecialty.OrderStatus orderStatus);

    // 결제 고유번호로 조회
    Optional<FundingSpecialty> findByImpUid(String impUid);

    // 주문번호로 조회
    Optional<FundingSpecialty> findByMerchantUid(String merchantUid);

    // 회원의 특정 특산품 주문 조회
    List<FundingSpecialty> findByMemberIdAndSpecialtyIdOrderByCreatedAtDesc(String memberId, String specialtyId);

    // 기간별 주문 조회
    @Query("SELECT fs FROM FundingSpecialty fs WHERE fs.createdAt BETWEEN :startDate AND :endDate ORDER BY fs.createdAt DESC")
    List<FundingSpecialty> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate);

    // 특산품별 총 주문 수량
    @Query("SELECT SUM(fs.quantity) FROM FundingSpecialty fs WHERE fs.specialtyId = :specialtyId AND fs.orderStatus = 'PAID'")
    Long getTotalQuantityBySpecialtyId(@Param("specialtyId") String specialtyId);

    // 특산품별 총 매출
    @Query("SELECT SUM(fs.totalAmount) FROM FundingSpecialty fs WHERE fs.specialtyId = :specialtyId AND fs.orderStatus = 'PAID'")
    Long getTotalAmountBySpecialtyId(@Param("specialtyId") String specialtyId);

    // 회원의 총 구매 금액
    @Query("SELECT SUM(fs.totalAmount) FROM FundingSpecialty fs WHERE fs.memberId = :memberId AND fs.orderStatus = 'PAID'")
    Long getTotalAmountByMemberId(@Param("memberId") String memberId);
} 