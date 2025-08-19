package com.backend.controller.restaurant;

import com.backend.dto.forone.ForOneMenuNearbyView;
import com.backend.service.forone.ForOneMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/for-one")
@RequiredArgsConstructor
public class ForOneMenuController {

    private final ForOneMenuService service;

    @GetMapping("/nearby")
    public Page<ForOneMenuNearbyView> getNearbyForOneMenus(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "3000") double radius,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.getNearbyForOneMenus(lat, lng, radius, page, size);
    }
}
