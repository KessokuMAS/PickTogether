package com.backend.config;

import com.backend.domain.restaurant.Restaurant;
import com.backend.repository.restaurant.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Log4j2
public class StartupInitializer {

	private final RestaurantRepository restaurantRepository;

	@EventListener(ApplicationReadyEvent.class)
	@Transactional
	public void seedFundingPeriodsIfMissing() {
		List<Restaurant> restaurants = restaurantRepository.findAll();
		int updated = 0;
		for (Restaurant r : restaurants) {
			if (r.getFundingStartDate() != null && r.getFundingEndDate() != null) continue;
			int addDays = 7 + (int)(r.getId() % 8);
			LocalDate start = LocalDate.now();
			LocalDate end = start.plusDays(addDays);
			r.setFundingStartDate(start);
			r.setFundingEndDate(end);
			updated++;
		}
		log.info("Initialized funding periods on Restaurant: {} records", updated);
	}
} 