// com.backend.service.member.LocationServiceImpl
package com.backend.service.member;

import com.backend.domain.member.Member;
import com.backend.domain.member.MemberLocation;
import com.backend.dto.member.LocationDTO;
import com.backend.repository.member.MemberLocationRepository;
import com.backend.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

    private final MemberRepository memberRepository;
    private final MemberLocationRepository locationRepository;

    @Override
    public LocationDTO create(String memberEmail, LocationDTO req) {
        Member member = memberRepository.findById(memberEmail)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음: " + memberEmail));

        MemberLocation entity = MemberLocation.builder()
                .member(member)
                .name(req.getName() == null ? "기본 주소" : req.getName())
                .latitude(req.getLat())
                .longitude(req.getLng())
                .address(req.getAddress())
                .roadAddress(req.getRoadAddress())
                .kakaoPlaceId(req.getKakaoPlaceId())
                .build();

        entity = locationRepository.save(entity);

        return LocationDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .lat(entity.getLatitude())
                .lng(entity.getLongitude())
                .address(entity.getAddress())
                .roadAddress(entity.getRoadAddress())
                .kakaoPlaceId(entity.getKakaoPlaceId())
                .build();
    }

    @Override
    public List<LocationDTO> list(String memberEmail) {
        return locationRepository.findByMember_Email(memberEmail).stream()
                .map(e -> LocationDTO.builder()
                        .id(e.getId())
                        .name(e.getName())
                        .lat(e.getLatitude())
                        .lng(e.getLongitude())
                        .address(e.getAddress())
                        .roadAddress(e.getRoadAddress())
                        .kakaoPlaceId(e.getKakaoPlaceId())
                        .build())
                .toList();
    }
    @Override
    public void delete(String memberEmail, Long id) {
        MemberLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 위치가 존재하지 않습니다."));

        if (!location.getMember().getEmail().equals(memberEmail)) {
        }

        locationRepository.delete(location);
    }
}
