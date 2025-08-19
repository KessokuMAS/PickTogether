package com.backend.repository.member;

import com.backend.domain.member.Funding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FundingRepository extends JpaRepository<Funding, Long> {
    
    @Query("SELECT f FROM Funding f WHERE f.member.email = :memberId ORDER BY f.createdAt DESC")
    List<Funding> findByMemberIdOrderByCreatedAtDesc(@Param("memberId") String memberId);
    
    @Query("SELECT f FROM Funding f WHERE f.restaurant.id = :restaurantId ORDER BY f.createdAt DESC")
    List<Funding> findByRestaurantIdOrderByCreatedAtDesc(@Param("restaurantId") Long restaurantId);
} 