package com.backend.repository.restaurant;

import com.backend.domain.restaurant.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, Long> {
	List<Menu> findByRestaurant_Id(Long restaurantId);
} 