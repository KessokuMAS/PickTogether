package com.backend.dto.restaurant;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class MenuDTO {
    
    private Long id;
    private String name; // 메뉴 이름
    private String description; // 메뉴 설명
    private Integer price; // 메뉴 가격
    private String imageUrl; // 메뉴 사진 URL
} 