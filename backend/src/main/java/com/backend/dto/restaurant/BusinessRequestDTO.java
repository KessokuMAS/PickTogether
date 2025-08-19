package com.backend.dto.restaurant;

import com.backend.domain.restaurant.BusinessRequestStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessRequestDTO {
    private Long id;
    private String name;
    private String categoryName;
    private String phone;
    private String roadAddressName;
    private Double x;
    private Double y;
    private String placeUrl;
    private Long fundingGoalAmount;
    private String fundingStartDate;
    private String fundingEndDate;
    private String imageUrl;
    private BusinessRequestStatus status;
    private String memberEmail;
    private String memberName;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private String reviewComment;
} 