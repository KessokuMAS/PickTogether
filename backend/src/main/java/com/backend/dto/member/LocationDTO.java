package com.backend.dto.member;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationDTO {
    private Long id;
    private String name;
    private Double lat;
    private Double lng;
    private String address;
    private String roadAddress;
    private String kakaoPlaceId;
}
