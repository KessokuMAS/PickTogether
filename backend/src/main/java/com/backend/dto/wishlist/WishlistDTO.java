package com.backend.dto.wishlist;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistDTO {

    private Long id;
    private String memberEmail;
    private Long restaurantId;
    private LocalDateTime createdAt;
} 