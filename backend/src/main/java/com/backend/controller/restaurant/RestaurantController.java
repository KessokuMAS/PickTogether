package com.backend.controller.restaurant;

import com.backend.dto.restaurant.RestaurantDTO;  // ✅ 상세 DTO
import com.backend.dto.restaurant.RestaurantThumbView;  // ✅ 프로젝션 DTO
import com.backend.service.restaurant.RestaurantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import com.backend.dto.restaurant.MenuDTO;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@Log4j2
public class RestaurantController {

	private final RestaurantService restaurantService;

	/**
	 * 예: GET /api/restaurants/nearby?lat=37.5027&lng=127.0352&radius=2000&page=0&size=24
	 */
	@GetMapping("/nearby")
	public Page<RestaurantThumbView> getNearby(
			@RequestParam double lat,
			@RequestParam double lng,
			@RequestParam(defaultValue = "2000") double radius,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "24") int size
	) {
		log.info("nearby lat={}, lng={}, radius={}m, page={}, size={}", lat, lng, radius, page, size);
		return restaurantService.getNearby(lat, lng, radius, page, size);
	}

	/**
	 * 예: GET /api/restaurants/{id}
	 */
	@GetMapping("/{id}")
	public RestaurantDTO getDetail(@PathVariable Long id) {
		log.info("detail id={}", id);
		return restaurantService.getDetail(id);
	}

	/**
	 * 예: GET /api/restaurants/{id}/menus
	 */
	@GetMapping("/{id}/menus")
	public List<MenuDTO> getMenus(@PathVariable Long id) {
		log.info("menus id={}", id);
		return restaurantService.getMenus(id);
	}
}
