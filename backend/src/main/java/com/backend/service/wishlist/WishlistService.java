package com.backend.service.wishlist;

import com.backend.dto.wishlist.WishlistDTO;
import java.util.List;
import java.util.Map;

public interface WishlistService {

    // 사용자의 찜 목록 조회
    List<WishlistDTO> getUserWishlist(String memberEmail);

    // 찜 추가
    WishlistDTO addToWishlist(String memberEmail, Long restaurantId);

    // 찜 제거
    void removeFromWishlist(String memberEmail, Long restaurantId);

    // 찜 토글 (추가/제거)
    boolean toggleWishlist(String memberEmail, Long restaurantId);

    // 찜 상태 확인
    boolean isWishlisted(String memberEmail, Long restaurantId);

    // 사용자의 찜 개수 조회
    long getUserWishlistCount(String memberEmail);
    
    // 찜 목록과 레스토랑 상세 정보 함께 조회 (프론트엔드 최적화용)
    List<Map<String, Object>> getUserWishlistWithDetails(String memberEmail);
} 