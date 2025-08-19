package com.backend.dto.restaurant;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessRequestCreateDTO {
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
} 