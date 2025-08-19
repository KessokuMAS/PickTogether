package com.backend.controller.member;

import com.backend.dto.member.FundingDTO;
import com.backend.dto.member.FundingCreateRequest;
import com.backend.domain.member.Funding;
import com.backend.service.member.FundingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funding")
@RequiredArgsConstructor
@Log4j2
public class FundingController {
    
    private final FundingService fundingService;
    
    @PostMapping
    public ResponseEntity<FundingDTO> createFunding(@RequestBody FundingCreateRequest request) {
        log.info("펀딩 생성 요청: {}", request);
        Funding funding = fundingService.createFunding(request);
        FundingDTO fundingDTO = fundingService.getFundingById(funding.getId());
        return ResponseEntity.ok(fundingDTO);
    }
    
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<FundingDTO>> getMemberFundings(@PathVariable String memberId) {
        log.info("회원 펀딩 목록 조회: memberId={}", memberId);
        List<FundingDTO> fundings = fundingService.getMemberFundings(memberId);
        return ResponseEntity.ok(fundings);
    }
    
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<FundingDTO>> getRestaurantFundings(@PathVariable Long restaurantId) {
        log.info("레스토랑 펀딩 목록 조회: restaurantId={}", restaurantId);
        List<FundingDTO> fundings = fundingService.getRestaurantFundings(restaurantId);
        return ResponseEntity.ok(fundings);
    }
    
    @GetMapping("/{fundingId}")
    public ResponseEntity<FundingDTO> getFundingById(@PathVariable Long fundingId) {
        log.info("펀딩 상세 조회: fundingId={}", fundingId);
        FundingDTO funding = fundingService.getFundingById(fundingId);
        return ResponseEntity.ok(funding);
    }
} 