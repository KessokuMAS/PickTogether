package com.backend.domain.restaurant;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "menu")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "restaurant")
public class Menu {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name; // 메뉴 이름
    
    @Column
    private String description; // 메뉴 설명
    
    @Column(nullable = false)
    private Integer price; // 메뉴 가격
    
    @Column
    private String imageUrl; // 메뉴 사진 URL
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;
} 