package com.backend.service.forone;

import com.backend.dto.forone.ForOneMenuNearbyView;
import com.backend.repository.restaurant.ForOneMenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ForOneMenuService {

    private final ForOneMenuRepository repository;

    public Page<ForOneMenuNearbyView> getNearbyForOneMenus(double lat, double lng, double radius, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.findNearbyForOneMenus(lat, lng, radius, pageable);
    }
}
