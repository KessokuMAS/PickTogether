// src/main/java/com/backend/domain/restaurant/RestaurantImage.java
package com.backend.domain.restaurant;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurant_image",
indexes = {
@Index(name = "idx_restimg_restaurant", columnList = "restaurant_id"),
@Index(name = "idx_restimg_sort", columnList = "restaurant_id, sort_order")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 이미지 N : 1 음식점
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    @Column(name = "is_main", nullable = false)
    private Boolean isMain = false;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}
