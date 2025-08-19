// src/main/java/com/backend/dto/restaurant/RestaurantThumbView.java
package com.backend.dto.restaurant;

import java.sql.Date;

public interface RestaurantThumbView {
    Long getRestaurantId();
    String getName();
    String getRoadAddressName();
    String getPlaceUrl();

    Double getDistance();           // m (동적 계산)
    Long getFundingAmount();
    Long getFundingGoalAmount();
    Integer getFundingPercent();    // 0~100 (SQL에서 계산)

    Long getImageId();
    String getImageUrl();
    Integer getIsMain();
    Integer getSortOrder();

    // 펀딩 기간
    Date getFundingStartDate();
    Date getFundingEndDate();
    
    // 펀딩 테이블의 total_amount 합계
    Long getTotalFundingAmount();
}
