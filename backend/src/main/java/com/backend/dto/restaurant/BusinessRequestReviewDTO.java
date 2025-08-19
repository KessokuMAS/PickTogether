package com.backend.dto.restaurant;

import com.backend.domain.restaurant.BusinessRequestStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessRequestReviewDTO {
    private Long id;
    private BusinessRequestStatus status;
    private String reviewComment;
} 