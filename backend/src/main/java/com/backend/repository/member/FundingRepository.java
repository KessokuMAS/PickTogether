package com.backend.repository.member;

import com.backend.domain.member.Funding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FundingRepository extends JpaRepository<Funding, Long> {
    
    // JOIN FETCH를 사용하는 새로운 메서드들
    @Query("SELECT DISTINCT f FROM Funding f LEFT JOIN FETCH f.restaurant r WHERE f.member.email = :memberId ORDER BY f.createdAt DESC")
    List<Funding> findMemberFundingsWithRestaurant(@Param("memberId") String memberId);
    
    @Query("SELECT DISTINCT f FROM Funding f LEFT JOIN FETCH f.restaurant r WHERE f.restaurant.id = :restaurantId ORDER BY f.createdAt DESC")
    List<Funding> findRestaurantFundingsWithRestaurant(@Param("restaurantId") Long restaurantId);
    
    // 기존 메서드들은 제거 (JOIN FETCH가 적용되지 않는 문제 해결)
} 