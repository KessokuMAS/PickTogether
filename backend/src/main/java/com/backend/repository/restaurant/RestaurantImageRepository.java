// src/main/java/com/backend/repository/restaurant/RestaurantImageRepository.java
package com.backend.repository.restaurant;

import com.backend.domain.restaurant.RestaurantImage;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RestaurantImageRepository extends JpaRepository<RestaurantImage, Long> {

    List<RestaurantImage> findByRestaurantIdOrderBySortOrderAscIdAsc(Long restaurantId);

    Optional<RestaurantImage> findByIdAndRestaurantId(Long imageId, Long restaurantId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update RestaurantImage i set i.isMain = false where i.restaurant.id = :restaurantId")
    int clearMain(@Param("restaurantId") Long restaurantId);
}
