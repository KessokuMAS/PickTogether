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
} 