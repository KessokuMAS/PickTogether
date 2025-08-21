package com.backend.domain.restaurant;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "restaurant_image_embedding")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantImageEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long restaurantId;

    private String imageUrl;

    /**
     * PostgreSQL array(float8[]) 를 매핑하려면 Hibernate-types 라이브러리 사용
     * (com.vladmihalcea:hibernate-types-60)
     */
    @Column(columnDefinition = "JSON")
    private String embedding;
}
