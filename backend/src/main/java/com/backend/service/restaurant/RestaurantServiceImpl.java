package com.backend.service.restaurant;

import com.backend.dto.restaurant.RestaurantDTO;
import com.backend.dto.restaurant.RestaurantThumbView;
import com.backend.repository.restaurant.RestaurantDetailRepository;
import com.backend.repository.restaurant.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import com.backend.repository.restaurant.MenuRepository;
import com.backend.dto.restaurant.MenuDTO;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

	private final RestaurantRepository restaurantRepository;
	private final RestaurantDetailRepository restaurantDetailRepository;
	private final MenuRepository menuRepository;

	@Override
	public Page<RestaurantThumbView> getNearby(double lat, double lng, double radius, int page, int size) {
		validate(lat, lng, radius);
		log.debug("Searching restaurants near lat={}, lng={}, radius={}m, page={}, size={}",
				lat, lng, radius, page, size);

		return restaurantRepository.findNearbyThumbs(
				lat, lng, radius, PageRequest.of(page, size)
		);
	}

	@Override
	public RestaurantDTO getDetail(Long id) {
		return restaurantRepository.findDetailRowAsArray(id)
				.map(cols -> {
					Long rid = ((Number) cols[0]).longValue();
					String name = (String) cols[1];
					String categoryName = (String) cols[2];
					String phone = (String) cols[3];
					String roadAddressName = (String) cols[4];
					Double x = cols[5] == null ? null : ((Number) cols[5]).doubleValue();
					Double y = cols[6] == null ? null : ((Number) cols[6]).doubleValue();
					String placeUrl = (String) cols[7];
					Long fundingAmount = cols[8] == null ? null : ((Number) cols[8]).longValue();
					Long fundingGoalAmount = cols[9] == null ? null : ((Number) cols[9]).longValue();
					String imageUrl = (String) cols[10];
					Long totalFundingAmount = cols[11] == null ? null : ((Number) cols[11]).longValue();

					Integer percent = null;
					if (fundingGoalAmount != null && fundingGoalAmount > 0) {
						// 실제 펀딩된 총 금액 (기본 fundingAmount + 결제 완료된 금액)
						Long actualFundingAmount = (fundingAmount != null ? fundingAmount : 0L) +
							(totalFundingAmount != null ? totalFundingAmount : 0L);
						
						long p = Math.round((actualFundingAmount * 100.0) / fundingGoalAmount);
						if (p < 0) p = 0;
						if (p > 100) p = 100;
						percent = (int) p;
					}

					var extended = restaurantDetailRepository.findById(id).orElse(null);
					var restaurant = restaurantRepository.findById(id).orElse(null);

					return RestaurantDTO.builder()
							.id(rid)
							.name(name)
							.categoryName(categoryName)
							.phone(phone)
							.roadAddressName(roadAddressName)
							.x(x)
							.y(y)
							.placeUrl(placeUrl)
							.fundingAmount(fundingAmount)
							.totalFundingAmount(totalFundingAmount)
							.fundingGoalAmount(fundingGoalAmount)
							.fundingPercent(percent)
							.imageUrl(imageUrl)
							.description(extended != null ? extended.getDescription() : null)
							.businessHours(extended != null ? extended.getBusinessHours() : null)
							.priceRange(extended != null ? extended.getPriceRange() : null)
							.tags(extended != null ? extended.getTags() : null)
							.homepageUrl(extended != null ? extended.getHomepageUrl() : null)
							.instagramUrl(extended != null ? extended.getInstagramUrl() : null)
							.notice(extended != null ? extended.getNotice() : null)
							.fundingStartDate(restaurant != null && restaurant.getFundingStartDate() != null ? restaurant.getFundingStartDate().toString() : null)
							.fundingEndDate(restaurant != null && restaurant.getFundingEndDate() != null ? restaurant.getFundingEndDate().toString() : null)
							.build();
				})
				.orElseThrow(() -> new IllegalArgumentException("Restaurant not found: " + id));
	}

	@Override
	public List<MenuDTO> getMenus(Long restaurantId) {
		return menuRepository.findByRestaurant_Id(restaurantId).stream()
				.map(m -> MenuDTO.builder()
						.id(m.getId())
						.name(m.getName())
						.description(m.getDescription())
						.price(m.getPrice())
						.imageUrl(m.getImageUrl())
						.build())
				.collect(Collectors.toList());
	}

	private void validate(double lat, double lng, double radius) {
		if (radius <= 0) {
			throw new IllegalArgumentException("radius must be > 0 (meters)");
		}
		if (lat < -90 || lat > 90) {
			throw new IllegalArgumentException("lat out of range [-90, 90]");
		}
		if (lng < -180 || lng > 180) {
			throw new IllegalArgumentException("lng out of range [-180, 180]");
		}
	}
}
