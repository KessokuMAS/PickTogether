package com.backend.repository.specialty;

import com.backend.domain.specialty.LocalSpecialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocalSpecialtyRepository extends JpaRepository<LocalSpecialty, Long> {
    
    // 콘텐츠 번호로 조회
    Optional<LocalSpecialty> findByCntntsNo(String cntntsNo);
    
    // 시도별 조회
    List<LocalSpecialty> findBySidoNm(String sidoNm);
    
    // 시도와 시군구별 조회
    List<LocalSpecialty> findBySidoNmAndSigunguNm(String sidoNm, String sigunguNm);
    
    // 검색어로 조회 (제목, 지역명, 시도, 시군구에서 검색)
    @Query("SELECT l FROM LocalSpecialty l WHERE " +
           "LOWER(l.cntntsSj) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "LOWER(l.areaNm) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "LOWER(l.sidoNm) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "LOWER(l.sigunguNm) LIKE LOWER(CONCAT('%', :searchText, '%'))")
    List<LocalSpecialty> findBySearchText(@Param("searchText") String searchText);
    
    // 고유한 시도 목록 조회
    @Query("SELECT DISTINCT l.sidoNm FROM LocalSpecialty l WHERE l.sidoNm IS NOT NULL ORDER BY l.sidoNm")
    List<String> findDistinctSidoNm();
    
    // 특정 시도의 고유한 시군구 목록 조회
    @Query("SELECT DISTINCT l.sigunguNm FROM LocalSpecialty l WHERE l.sidoNm = :sidoNm AND l.sigunguNm IS NOT NULL ORDER BY l.sigunguNm")
    List<String> findDistinctSigunguNmBySidoNm(@Param("sidoNm") String sidoNm);
    
    // 펀딩 진행률이 높은 순으로 조회
    @Query("SELECT l FROM LocalSpecialty l ORDER BY (l.fundingAmount * 100.0 / l.fundingGoalAmount) DESC")
    List<LocalSpecialty> findAllOrderByFundingProgress();
    
    // 펀딩 목표 금액 대비 달성률이 특정 퍼센트 이상인 것 조회
    @Query("SELECT l FROM LocalSpecialty l WHERE (l.fundingAmount * 100.0 / l.fundingGoalAmount) >= :minPercent ORDER BY l.fundingAmount DESC")
    List<LocalSpecialty> findByFundingProgressGreaterThan(@Param("minPercent") Double minPercent);
    
    // 특정 지역특산물의 펀딩 테이블에서 결제 완료된 금액 합계 조회
    @Query(value = "SELECT COALESCE(SUM(fs.total_amount), 0) FROM funding_specialty fs WHERE fs.specialty_id = :cntntsNo AND fs.order_status = 'PAID'", nativeQuery = true)
    Long getTotalFundingAmountByCntntsNo(@Param("cntntsNo") String cntntsNo);
    
    // 모든 지역특산물과 펀딩 금액을 한 번에 조회 (성능 최적화)
    @Query(value = """
        SELECT 
            ls.id, ls.cntnts_no, ls.cntnts_sj, ls.area_nm, ls.img_url, ls.svc_dt,
            ls.link_url, ls.area_code, ls.sido_nm, ls.sigungu_nm, ls.created_at,
            ls.funding_goal_amount, ls.funding_amount,
            COALESCE(SUM(fs.total_amount), 0) as total_funding_amount
        FROM local_specialty ls
        LEFT JOIN funding_specialty fs ON fs.specialty_id = ls.cntnts_no AND fs.order_status = 'PAID'
        GROUP BY ls.id, ls.cntnts_no, ls.cntnts_sj, ls.area_nm, ls.img_url, ls.svc_dt,
                 ls.link_url, ls.area_code, ls.sido_nm, ls.sigungu_nm, ls.created_at,
                 ls.funding_goal_amount, ls.funding_amount
        ORDER BY ls.created_at DESC
        """, nativeQuery = true)
    List<Object[]> findAllWithFundingAmounts();
} 