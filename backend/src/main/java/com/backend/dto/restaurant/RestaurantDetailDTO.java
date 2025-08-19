package com.backend.dto.restaurant;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantDetailDTO {
	private Long id;
	private String description;
	private String businessHours;
	private String priceRange;
	private String tags;
	private String homepageUrl;
	private String instagramUrl;
	private String notice;
} 