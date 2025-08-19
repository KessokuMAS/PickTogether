package com.backend.repository;

import com.backend.domain.restaurant.Menu;
import com.backend.domain.restaurant.Restaurant;
import com.backend.repository.restaurant.MenuRepository;
import com.backend.repository.restaurant.RestaurantRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.annotation.Commit;

import java.util.Arrays;
import java.util.List;

@SpringBootTest
public class MenuTests {
    @Autowired
    private MenuRepository menuRepository;
    @Autowired
    private RestaurantRepository restaurantRepository;

    @Test
    @Transactional
    @Commit
    public void insertSampleMenusForGivenRestaurants() {
        List<Long> restaurantIds = Arrays.asList(1L,2L,3L,4L,5L,6L,7L,8L,9L,10L,11L,12L,13L,14L,15L,16L,17L,18L,19L,20L,21L,22L,23L,24L,25L,26L,27L,28L,29L,30L,31L,32L,33L,34L,35L,36L,37L,38L,39L,40L,41L,42L,43L,44L,45L);

        List<Restaurant> existing = restaurantRepository.findAllById(restaurantIds);
        System.out.println("[INFO] Existing restaurants found: " + existing.size());
        if (existing.isEmpty()) {
            System.out.println("[WARN] No matching restaurants found in DB for given IDs");
            return;
        }

        for (Restaurant r : existing) {
            Long rid = r.getId();

            Menu m1 = Menu.builder()
                    .name("대표 메뉴 A")
                    .description("테스트임")
                    .price(12000)
                    .imageUrl("/images/menu-1.jpg")
                    .restaurant(r)
                    .build();

            Menu m2 = Menu.builder()
                    .name("대표 메뉴 B")
                    .description("테스트임")
                    .price(9800)
                    .imageUrl("/images/menu-2.jpg")
                    .restaurant(r)
                    .build();

            Menu m3 = Menu.builder()
                    .name("메뉴 C")
                    .description("테스트임")
                    .price(15000)
                    .imageUrl("/images/menu-3.jpg")
                    .restaurant(r)
                    .build();

            menuRepository.saveAll(Arrays.asList(m1, m2, m3));
            System.out.println("[OK] Seeded menus for restaurant: " + rid);
        }
    }
}
