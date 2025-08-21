package com.backend.domain.restaurant;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurant_description")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantDescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;  

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;
}
