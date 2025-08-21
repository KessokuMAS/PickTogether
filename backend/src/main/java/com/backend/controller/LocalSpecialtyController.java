package com.backend.controller;

import com.backend.domain.specialty.LocalSpecialty;
import com.backend.repository.specialty.LocalSpecialtyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/local-specialty")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class LocalSpecialtyController {

    private final LocalSpecialtyRepository localSpecialtyRepository;

    // 전체 지역특산물 목록 조회
    @GetMapping
    public ResponseEntity<List<LocalSpecialty>> getAllLocalSpecialties() {
        List<LocalSpecialty> specialties = localSpecialtyRepository.findAll();
        return ResponseEntity.ok(specialties);
    }

    // 콘텐츠 번호로 특정 지역특산물 조회
    @GetMapping("/{cntntsNo}")
    public ResponseEntity<LocalSpecialty> getLocalSpecialtyById(@PathVariable String cntntsNo) {
        return localSpecialtyRepository.findByCntntsNo(cntntsNo)
                .map(specialty -> {
                    // 조회수 증가 (선택사항)
                    // specialty.setRdcnt(specialty.getRdcnt() + 1);
                    // localSpecialtyRepository.save(specialty);
                    return ResponseEntity.ok(specialty);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 지역별 지역특산물 조회
    @GetMapping("/area")
    public ResponseEntity<List<LocalSpecialty>> getLocalSpecialtiesByArea(
            @RequestParam(required = false) String sidoNm,
            @RequestParam(required = false) String sigunguNm) {
        
        List<LocalSpecialty> specialties;
        
        if (sidoNm != null && sigunguNm != null) {
            // 시도와 시군구 모두 지정된 경우
            specialties = localSpecialtyRepository.findBySidoNmAndSigunguNm(sidoNm, sigunguNm);
        } else if (sidoNm != null) {
            // 시도만 지정된 경우
            specialties = localSpecialtyRepository.findBySidoNm(sidoNm);
        } else {
            // 지역 미지정인 경우 전체 조회
            specialties = localSpecialtyRepository.findAll();
        }
        
        return ResponseEntity.ok(specialties);
    }

    // 검색어로 지역특산물 조회
    @GetMapping("/search")
    public ResponseEntity<List<LocalSpecialty>> searchLocalSpecialties(
            @RequestParam String searchText) {
        
        List<LocalSpecialty> specialties = localSpecialtyRepository.findBySearchText(searchText);
        return ResponseEntity.ok(specialties);
    }

    // 시도 목록 조회
    @GetMapping("/sido-list")
    public ResponseEntity<List<String>> getSidoList() {
        List<String> sidoList = localSpecialtyRepository.findDistinctSidoNm();
        return ResponseEntity.ok(sidoList);
    }

    // 특정 시도의 시군구 목록 조회
    @GetMapping("/sigungu-list")
    public ResponseEntity<List<String>> getSigunguList(@RequestParam String sidoNm) {
        List<String> sigunguList = localSpecialtyRepository.findDistinctSigunguNmBySidoNm(sidoNm);
        return ResponseEntity.ok(sigunguList);
    }
} 