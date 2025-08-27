package com.backend.controller;

import com.backend.dto.wishlist.WishlistDTO;
import com.backend.service.wishlist.WishlistService;    
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Slf4j
public class WishlistController {
    
    private final WishlistService wishlistService;
    
    // 찜 목록 조회
    @GetMapping
    public ResponseEntity<List<WishlistDTO>> getUserWishlist() {
        try {
            String userEmail = getCurrentUserEmail();
            List<WishlistDTO> wishlist = wishlistService.getUserWishlist(userEmail);
            return ResponseEntity.ok(wishlist);
        } catch (RuntimeException e) {
            log.error("찜 목록 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            log.error("찜 목록 조회 중 예상치 못한 오류 발생", e);
            return ResponseEntity.internalServerError().body(null);
        }
    }
    
    // 찜 추가
    @PostMapping
    public ResponseEntity<WishlistDTO> addToWishlist(@RequestBody Map<String, Long> request) {
        try {
            String userEmail = getCurrentUserEmail();
            Long restaurantId = request.get("restaurantId");
            
            if (restaurantId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            WishlistDTO wishlist = wishlistService.addToWishlist(userEmail, restaurantId);
            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            log.error("찜 추가 실패", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 찜 제거
    @DeleteMapping("/{restaurantId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long restaurantId) {
        try {
            String userEmail = getCurrentUserEmail();
            wishlistService.removeFromWishlist(userEmail, restaurantId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("찜 제거 실패", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 찜 토글
    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleWishlist(@RequestBody Map<String, Long> request) {
        try {
            String userEmail = getCurrentUserEmail();
            Long restaurantId = request.get("restaurantId");
            
            if (restaurantId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            boolean isWishlisted = wishlistService.toggleWishlist(userEmail, restaurantId);
            return ResponseEntity.ok(Map.of(
                "isWishlisted", isWishlisted,
                "message", isWishlisted ? "찜 추가되었습니다." : "찜이 해제되었습니다."
            ));
        } catch (Exception e) {
            log.error("찜 토글 실패", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 찜 상태 확인
    @GetMapping("/check/{restaurantId}")
    public ResponseEntity<Map<String, Boolean>> checkWishlistStatus(@PathVariable Long restaurantId) {
        try {
            String userEmail = getCurrentUserEmail();
            boolean isWishlisted = wishlistService.isWishlisted(userEmail, restaurantId);
            return ResponseEntity.ok(Map.of("isWishlisted", isWishlisted));
        } catch (Exception e) {
            log.error("찜 상태 확인 실패", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 찜 개수 조회
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUserWishlistCount() {
        try {
            String userEmail = getCurrentUserEmail();
            long count = wishlistService.getUserWishlistCount(userEmail);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            log.error("찜 개수 조회 실패", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 찜 목록과 레스토랑 상세 정보 함께 조회 (프론트엔드 최적화용)
    @GetMapping("/with-details")
    public ResponseEntity<List<Map<String, Object>>> getUserWishlistWithDetails() {
        try {
            String userEmail = getCurrentUserEmail();
            List<Map<String, Object>> wishlistWithDetails = wishlistService.getUserWishlistWithDetails(userEmail);
            return ResponseEntity.ok(wishlistWithDetails);
        } catch (Exception e) {
            log.error("찜 목록 상세 조회 실패", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 현재 로그인한 사용자 ID 가져오기
// 현재 로그인한 사용자 이메일 가져오기
private String getCurrentUserEmail() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
        throw new RuntimeException("로그인이 필요합니다.");
    }

    Object principal = authentication.getPrincipal();

    if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
        return userDetails.getUsername(); // 일반적으로 username = email
    }

    // JWT 토큰 기반이라면 principal이 email 문자열일 가능성이 큼
    if (principal instanceof String) {
        return (String) principal;
    }

    throw new RuntimeException("사용자 이메일을 가져올 수 없습니다.");
}

} 