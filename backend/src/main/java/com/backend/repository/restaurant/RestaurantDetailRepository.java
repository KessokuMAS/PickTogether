package com.backend.repository.restaurant;

import com.backend.domain.restaurant.RestaurantDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantDetailRepository extends JpaRepository<RestaurantDetail, Long> {
} 