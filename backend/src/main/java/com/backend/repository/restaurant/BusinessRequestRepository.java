package com.backend.repository.restaurant;

import com.backend.domain.restaurant.BusinessRequest;
import com.backend.domain.restaurant.BusinessRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessRequestRepository extends JpaRepository<BusinessRequest, Long> {
    
    // 특정 회원의 요청 목록 조회 (연관 또는 스냅샷 이메일 기준)
    @Query("SELECT b FROM BusinessRequest b WHERE (b.member.email = :email OR b.requesterEmail = :email) ORDER BY b.createdAt DESC")
    List<BusinessRequest> findByMemberOrRequesterEmailOrderByCreatedAtDesc(@Param("email") String memberEmail);
    
    // 상태별 요청 목록 조회 (페이징)
    Page<BusinessRequest> findByStatusOrderByCreatedAtDesc(BusinessRequestStatus status, Pageable pageable);
    
    // 모든 요청 목록 조회 (페이징)
    Page<BusinessRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // 특정 회원의 특정 상태 요청 조회
    List<BusinessRequest> findByMemberEmailAndStatusOrderByCreatedAtDesc(String memberEmail, BusinessRequestStatus status);
    
    // 대기중인 요청 개수 조회
    @Query("SELECT COUNT(b) FROM BusinessRequest b WHERE b.status = :status")
    long countByStatus(@Param("status") BusinessRequestStatus status);
} 