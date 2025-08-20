package com.backend.controller;

import com.backend.dto.specialty.LocalSpecialtyDTO;
import com.backend.service.specialty.LocalSpecialtyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/local-specialties")
@RequiredArgsConstructor
@Log4j2
public class LocalSpecialtyController {
    
    private final LocalSpecialtyService localSpecialtyService;
    
    // 모든 지역특산물 조회
    @GetMapping
    public ResponseEntity<List<LocalSpecialtyDTO>> getAllLocalSpecialties() {
        try {
            List<LocalSpecialtyDTO> specialties = localSpecialtyService.getAllLocalSpecialties();
            return ResponseEntity.ok(specialties);
        } catch (Exception e) {
            log.error("지역특산물 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // ID로 지역특산물 조회
    @GetMapping("/{id}")
    public ResponseEntity<LocalSpecialtyDTO> getLocalSpecialtyById(@PathVariable Long id) {
        try {
            LocalSpecialtyDTO specialty = localSpecialtyService.getLocalSpecialtyById(id);
            return ResponseEntity.ok(specialty);
        } catch (RuntimeException e) {
            log.warn("지역특산물을 찾을 수 없습니다. ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("지역특산물 조회 실패. ID: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 콘텐츠 번호로 지역특산물 조회
    @GetMapping("/content/{cntntsNo}")
    public ResponseEntity<LocalSpecialtyDTO> getLocalSpecialtyByCntntsNo(@PathVariable String cntntsNo) {
        try {
            LocalSpecialtyDTO specialty = localSpecialtyService.getLocalSpecialtyByCntntsNo(cntntsNo);
            return ResponseEntity.ok(specialty);
        } catch (RuntimeException e) {
            log.warn("지역특산물을 찾을 수 없습니다. 콘텐츠 번호: {}", cntntsNo);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("지역특산물 조회 실패. 콘텐츠 번호: {}", cntntsNo, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 시도별 지역특산물 조회
    @GetMapping("/sido/{sidoNm}")
    public ResponseEntity<List<LocalSpecialtyDTO>> getLocalSpecialtiesBySido(@PathVariable String sidoNm) {
        try {
            List<LocalSpecialtyDTO> specialties = localSpecialtyService.getLocalSpecialtiesBySido(sidoNm);
            return ResponseEntity.ok(specialties);
        } catch (Exception e) {
            log.error("시도별 지역특산물 조회 실패. 시도: {}", sidoNm, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 시도와 시군구별 지역특산물 조회
    @GetMapping("/sido/{sidoNm}/sigungu/{sigunguNm}")
    public ResponseEntity<List<LocalSpecialtyDTO>> getLocalSpecialtiesBySidoAndSigungu(
            @PathVariable String sidoNm, 
            @PathVariable String sigunguNm) {
        try {
            List<LocalSpecialtyDTO> specialties = localSpecialtyService.getLocalSpecialtiesBySidoAndSigungu(sidoNm, sigunguNm);
            return ResponseEntity.ok(specialties);
        } catch (Exception e) {
            log.error("시도/시군구별 지역특산물 조회 실패. 시도: {}, 시군구: {}", sidoNm, sigunguNm, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 검색어로 지역특산물 조회
    @GetMapping("/search")
    public ResponseEntity<List<LocalSpecialtyDTO>> searchLocalSpecialties(@RequestParam String q) {
        try {
            List<LocalSpecialtyDTO> specialties = localSpecialtyService.searchLocalSpecialties(q);
            return ResponseEntity.ok(specialties);
        } catch (Exception e) {
            log.error("지역특산물 검색 실패. 검색어: {}", q, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 펀딩 진행률이 높은 순으로 조회
    @GetMapping("/funding/progress")
    public ResponseEntity<List<LocalSpecialtyDTO>> getLocalSpecialtiesOrderByFundingProgress() {
        try {
            List<LocalSpecialtyDTO> specialties = localSpecialtyService.getLocalSpecialtiesOrderByFundingProgress();
            return ResponseEntity.ok(specialties);
        } catch (Exception e) {
            log.error("펀딩 진행률별 지역특산물 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 펀딩 달성률이 특정 퍼센트 이상인 것 조회
    @GetMapping("/funding/progress/{minPercent}")
    public ResponseEntity<List<LocalSpecialtyDTO>> getLocalSpecialtiesByFundingProgress(@PathVariable Double minPercent) {
        try {
            List<LocalSpecialtyDTO> specialties = localSpecialtyService.getLocalSpecialtiesByFundingProgress(minPercent);
            return ResponseEntity.ok(specialties);
        } catch (Exception e) {
            log.error("펀딩 달성률별 지역특산물 조회 실패. 최소 달성률: {}", minPercent, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 펀딩 금액 업데이트
    @PutMapping("/{id}/funding")
    public ResponseEntity<LocalSpecialtyDTO> updateFundingAmount(
            @PathVariable Long id, 
            @RequestBody Long newFundingAmount) {
        try {
            LocalSpecialtyDTO updatedSpecialty = localSpecialtyService.updateFundingAmount(id, newFundingAmount);
            return ResponseEntity.ok(updatedSpecialty);
        } catch (RuntimeException e) {
            log.warn("지역특산물을 찾을 수 없습니다. ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("펀딩 금액 업데이트 실패. ID: {}, 새 금액: {}", id, newFundingAmount, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 