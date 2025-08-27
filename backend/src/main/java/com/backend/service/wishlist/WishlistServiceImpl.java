package com.backend.service.wishlist;

import com.backend.domain.restaurant.Restaurant;
import com.backend.domain.wishlist.Wishlist;
import com.backend.dto.wishlist.WishlistDTO;
import com.backend.repository.restaurant.RestaurantRepository;
import com.backend.repository.wishlist.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistDTO> getUserWishlist(String memberEmail) {
        List<Wishlist> wishlists = wishlistRepository.findByMemberEmail(memberEmail);
        return wishlists.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public WishlistDTO addToWishlist(String memberEmail, Long restaurantId) {
        // 이미 찜되어 있는지 확인
        if (isWishlisted(memberEmail, restaurantId)) {
            throw new RuntimeException("이미 찜한 레스토랑입니다.");
        }

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("레스토랑을 찾을 수 없습니다."));

        Wishlist wishlist = Wishlist.builder()
                .memberEmail(memberEmail)
                .restaurant(restaurant)
                .build();

        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        return convertToDTO(savedWishlist);
    }

    @Override
    public void removeFromWishlist(String memberEmail, Long restaurantId) {
        Wishlist wishlist = wishlistRepository.findByMemberEmailAndRestaurantId(memberEmail, restaurantId)
                .orElseThrow(() -> new RuntimeException("찜 목록에서 찾을 수 없습니다."));

        wishlistRepository.delete(wishlist);
    }

    @Override
    public boolean toggleWishlist(String memberEmail, Long restaurantId) {
        if (isWishlisted(memberEmail, restaurantId)) {
            removeFromWishlist(memberEmail, restaurantId);
            return false; // 찜 해제됨
        } else {
            addToWishlist(memberEmail, restaurantId);
            return true; // 찜 추가됨
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isWishlisted(String memberEmail, Long restaurantId) {
        return wishlistRepository.findByMemberEmailAndRestaurantId(memberEmail, restaurantId).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUserWishlistCount(String memberEmail) {
        return wishlistRepository.countByMemberEmail(memberEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUserWishlistWithDetails(String memberEmail) {
        List<Wishlist> wishlists = wishlistRepository.findByMemberEmail(memberEmail);
        
        return wishlists.stream()
                .map(wishlist -> {
                    Restaurant restaurant = wishlist.getRestaurant();
                    Map<String, Object> wishlistDetail = new java.util.HashMap<>();
                    
                    // 찜 정보
                    wishlistDetail.put("id", wishlist.getId());
                    wishlistDetail.put("createdAt", wishlist.getCreatedAt());
                    
                    // 레스토랑 기본 정보
                    wishlistDetail.put("restaurantId", restaurant.getId());
                    wishlistDetail.put("name", restaurant.getName());
                    wishlistDetail.put("categoryName", restaurant.getCategoryName());
                    wishlistDetail.put("roadAddressName", restaurant.getRoadAddressName());
                    wishlistDetail.put("phone", restaurant.getPhone());
                    wishlistDetail.put("placeUrl", restaurant.getPlaceUrl());
                    wishlistDetail.put("x", restaurant.getX());
                    wishlistDetail.put("y", restaurant.getY());
                    wishlistDetail.put("distance", restaurant.getDistance());
                    
                    // 펀딩 정보
                    wishlistDetail.put("fundingAmount", restaurant.getFundingAmount());
                    wishlistDetail.put("fundingGoalAmount", restaurant.getFundingGoalAmount());
                    wishlistDetail.put("fundingStartDate", restaurant.getFundingStartDate());
                    wishlistDetail.put("fundingEndDate", restaurant.getFundingEndDate());
                    
                    return wishlistDetail;
                })
                .collect(Collectors.toList());
    }

    private WishlistDTO convertToDTO(Wishlist wishlist) {
        return WishlistDTO.builder()
                .id(wishlist.getId())
                .memberEmail(wishlist.getMemberEmail())
                .restaurantId(wishlist.getRestaurant().getId())
                .createdAt(wishlist.getCreatedAt())
                .build();
    }
} 