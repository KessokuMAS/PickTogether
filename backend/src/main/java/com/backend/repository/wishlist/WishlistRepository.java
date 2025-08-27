package com.backend.repository.wishlist;

import com.backend.domain.wishlist.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    // 사용자의 찜 목록 조회
    @Query("SELECT w FROM Wishlist w WHERE w.memberEmail = :memberEmail ORDER BY w.createdAt DESC")
    List<Wishlist> findByMemberEmail(@Param("memberEmail") String memberEmail);

    // 특정 레스토랑이 찜되어 있는지 확인
    @Query("SELECT w FROM Wishlist w WHERE w.memberEmail = :memberEmail AND w.restaurant.id = :restaurantId")
    Optional<Wishlist> findByMemberEmailAndRestaurantId(@Param("memberEmail") String memberEmail, @Param("restaurantId") Long restaurantId);

    // 사용자의 찜 개수 조회
    @Query("SELECT COUNT(w) FROM Wishlist w WHERE w.memberEmail = :memberEmail")
    long countByMemberEmail(@Param("memberEmail") String memberEmail);

    // 특정 레스토랑의 찜 개수 조회
    @Query("SELECT COUNT(w) FROM Wishlist w WHERE w.restaurant.id = :restaurantId")
    long countByRestaurantId(@Param("restaurantId") Long restaurantId);
} 