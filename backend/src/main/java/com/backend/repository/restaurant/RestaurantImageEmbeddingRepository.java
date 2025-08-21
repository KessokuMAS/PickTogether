package com.backend.repository.restaurant;

import com.backend.domain.restaurant.RestaurantImageEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RestaurantImageEmbeddingRepository extends JpaRepository<RestaurantImageEmbedding, Long> {
    List<RestaurantImageEmbedding> findByRestaurantId(Long restaurantId);
}
