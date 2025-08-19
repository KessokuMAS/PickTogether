package com.backend.repository.restaurant;

import com.backend.domain.restaurant.ForOneMenu;
import com.backend.dto.forone.ForOneMenuNearbyView;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface ForOneMenuRepository extends JpaRepository<ForOneMenu, Long> {

  @Query(value = """
    SELECT
      f.id                         AS slotId,
      m.id                         AS menuId,
      m.name                       AS menuName,
      f.original_price             AS originalPrice,
      f.funding_price              AS fundingPrice,
      f.discount_percent           AS discountPercent,
      f.current_participants       AS currentParticipants,
      f.min_participants           AS minParticipants,
      f.max_participants           AS maxParticipants,
      f.ends_at                    AS endsAt,

      r.id                         AS restaurantId,
      r.name                       AS restaurantName,
      r.road_address_name          AS roadAddressName,
      ST_Distance_Sphere(POINT(r.x, r.y), POINT(:lng, :lat)) AS distance,

      m.image_url                  AS imageUrl   -- ✅ menu 테이블에서 직접 가져오기

    FROM for_one_menu f
    JOIN menu m ON f.menu_id = m.id
    JOIN restaurant r ON m.restaurant_id = r.id

    WHERE f.status = 'ACTIVE'
      AND NOW() BETWEEN f.starts_at AND f.ends_at
      AND ST_Distance_Sphere(POINT(r.x, r.y), POINT(:lng, :lat)) <= :radius

    ORDER BY distance ASC
    """,
    countQuery = """
    SELECT COUNT(*)
    FROM for_one_menu f
    JOIN menu m ON f.menu_id = m.id
    JOIN restaurant r ON m.restaurant_id = r.id
    WHERE f.status = 'ACTIVE'
      AND NOW() BETWEEN f.starts_at AND f.ends_at
      AND ST_Distance_Sphere(POINT(r.x, r.y), POINT(:lng, :lat)) <= :radius
    """,
    nativeQuery = true)
Page<ForOneMenuNearbyView> findNearbyForOneMenus(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radius") double radius,
        Pageable pageable
);

}
