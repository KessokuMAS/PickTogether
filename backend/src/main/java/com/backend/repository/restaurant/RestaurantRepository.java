// src/main/java/com/backend/repository/restaurant/RestaurantRepository.java
package com.backend.repository.restaurant;

import com.backend.domain.restaurant.Restaurant;
import com.backend.dto.restaurant.RestaurantThumbView;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

	// ✅ 기존 findNearbyPage(...)는 놔둬도 되지만, 프론트엔 이걸 쓰는 걸 추천
	@Query(value = """
		SELECT
		  r.id                                        AS restaurantId,
		  r.name                                      AS name,
		  r.road_address_name                         AS roadAddressName,
		  r.place_url                                 AS placeUrl,
		  r.funding_amount                            AS fundingAmount,
		  r.funding_goal_amount                       AS fundingGoalAmount,
		  LEAST(100, GREATEST(0,
			   ROUND((r.funding_amount * 100.0) / NULLIF(r.funding_goal_amount, 0))
		  ))                                          AS fundingPercent,
		  ST_Distance_Sphere(POINT(r.x, r.y), POINT(:lng, :lat)) AS distance,

		  i.id                                        AS imageId,
		  i.image_url                                 AS imageUrl,
		  i.is_main                                   AS isMain,
		  i.sort_order                                AS sortOrder,

		  r.funding_start_date                        AS fundingStartDate,
		  r.funding_end_date                          AS fundingEndDate,
		  
		  COALESCE(SUM(f.total_amount), 0)           AS totalFundingAmount
		FROM restaurant r
		LEFT JOIN (
			SELECT *
			FROM (
				SELECT ri.*,
				       ROW_NUMBER() OVER (
					 PARTITION BY ri.restaurant_id
					 ORDER BY ri.is_main DESC, ri.sort_order ASC, ri.id ASC
				       ) AS rn
				FROM restaurant_image ri
			) t
			WHERE t.rn = 1
		) i ON i.restaurant_id = r.id
		LEFT JOIN funding f ON f.restaurant_id = r.id AND f.status = 'COMPLETED'
		WHERE ST_Distance_Sphere(POINT(r.x, r.y), POINT(:lng, :lat)) <= :radius
		GROUP BY r.id, r.name, r.road_address_name, r.place_url, r.funding_amount, 
		         r.funding_goal_amount, r.funding_start_date, r.funding_end_date,
		         i.id, i.image_url, i.is_main, i.sort_order
		ORDER BY distance ASC
		""",
		countQuery = """
		SELECT COUNT(1)
		FROM restaurant r
		WHERE ST_Distance_Sphere(POINT(r.x, r.y), POINT(:lng, :lat)) <= :radius
		""",
		nativeQuery = true)
	Page<RestaurantThumbView> findNearbyThumbs(
			@Param("lat") double lat,
			@Param("lng") double lng,
			@Param("radius") double radius,
			Pageable pageable
	);

	@Query(value = """
		SELECT r.id, r.name, r.category_name, r.phone, r.road_address_name, r.x, r.y, r.place_url,
		       r.funding_amount, r.funding_goal_amount,
		       i.image_url AS imageUrl
		FROM restaurant r
		LEFT JOIN (
			SELECT * FROM (
				SELECT ri.*,
				       ROW_NUMBER() OVER (
				         PARTITION BY ri.restaurant_id
				         ORDER BY ri.is_main DESC, ri.sort_order ASC, ri.id ASC
				       ) AS rn
				FROM restaurant_image ri
			) t WHERE t.rn = 1
		) i ON i.restaurant_id = r.id
		WHERE r.id = :id
	""",
		nativeQuery = true)
	Object findDetailRow(@Param("id") Long id);

	default Optional<Object[]> findDetailRowAsArray(Long id) {
		Object row = findDetailRow(id);
		if (row == null) return Optional.empty();
		return Optional.of((Object[]) row);
	}
}
