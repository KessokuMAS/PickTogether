package com.backend.domain.restaurant;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurant_detail")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantDetail {
	@Id
	@Column(name = "id", nullable = false)
	private Long id; // restaurant.id와 동일 (공유 PK)

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@MapsId
	@JoinColumn(name = "id", nullable = false)
	private Restaurant restaurant;

	@Lob
	@Column(name = "description")
	private String description; // 소개문

	@Column(name = "business_hours", length = 500)
	private String businessHours; // 영업시간 (간단 텍스트)

	@Column(name = "price_range", length = 50)
	private String priceRange; // 가격대 표시

	@Column(name = "tags", length = 255)
	private String tags; // 콤마 구분 태그

	@Column(name = "homepage_url", length = 255)
	private String homepageUrl;

	@Column(name = "instagram_url", length = 255)
	private String instagramUrl;

	@Lob
	@Column(name = "notice")
	private String notice; // 공지사항
} 