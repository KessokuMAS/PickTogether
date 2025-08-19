package com.backend.dto.forone;

import java.time.LocalDateTime;

public interface ForOneMenuNearbyView {
    Long getSlotId();
    Long getMenuId();
    String getMenuName();
    Integer getOriginalPrice();
    Integer getFundingPrice();
    Integer getDiscountPercent();
    Integer getCurrentParticipants();
    Integer getMinParticipants();
    Integer getMaxParticipants();
    LocalDateTime getEndsAt();

    Long getRestaurantId();
    String getRestaurantName();
    String getRoadAddressName();
    Double getDistance();
    String getImageUrl();
}
