// com.backend.controller.member.LocationController
package com.backend.controller.member;

import com.backend.dto.member.LocationDTO;
import com.backend.service.member.LocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2
@RestController
@RequestMapping("/api/member/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping
    public ResponseEntity<LocationDTO> create(Authentication authentication,
                                              @RequestBody LocationDTO req) {
        String email = authentication.getName(); 
        LocationDTO saved = locationService.create(email, req);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<LocationDTO>> list(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(locationService.list(email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication,
                                       @PathVariable Long id) {
        String email = authentication.getName();
        locationService.delete(email, id);
        return ResponseEntity.noContent().build();
    }
}
