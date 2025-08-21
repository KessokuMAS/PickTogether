package com.backend.repository.restaurant;

import com.backend.domain.restaurant.RestaurantDescription;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantDescriptionRepository extends JpaRepository<RestaurantDescription, Long> {

    // 특정 음식점의 설명 가져오기
    RestaurantDescription findByRestaurantId(Long restaurantId);

    // 설명에 특정 키워드 포함된 음식점 찾기
    List<RestaurantDescription> findByDescriptionContaining(String keyword);
}
