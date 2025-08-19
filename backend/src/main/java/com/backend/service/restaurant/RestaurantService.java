package com.backend.service.restaurant;

import com.backend.dto.restaurant.RestaurantDTO;
import com.backend.dto.restaurant.RestaurantThumbView;
import org.springframework.data.domain.Page;
import com.backend.dto.restaurant.MenuDTO;
import java.util.List;

public interface RestaurantService {
	Page<RestaurantThumbView> getNearby(double lat, double lng, double radius, int page, int size);

	RestaurantDTO getDetail(Long id);

	List<MenuDTO> getMenus(Long restaurantId);
}
