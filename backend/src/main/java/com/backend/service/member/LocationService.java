package com.backend.service.member;

import com.backend.dto.member.LocationDTO;

import java.util.List;

public interface LocationService {
    LocationDTO create(String memberEmail, LocationDTO req);
    List<LocationDTO> list(String memberEmail);
    void delete(String memberEmail, Long id); // ✅ 삭제 메서드 추가
}
