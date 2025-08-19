package com.backend.controller.restaurant;

import com.backend.domain.restaurant.BusinessRequestStatus;
import com.backend.dto.restaurant.BusinessRequestCreateDTO;
import com.backend.dto.restaurant.BusinessRequestDTO;
import com.backend.dto.restaurant.BusinessRequestPageDTO;
import com.backend.dto.restaurant.BusinessRequestReviewDTO;
import com.backend.service.restaurant.BusinessRequestService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/business-requests")
@RequiredArgsConstructor
@Log4j2
public class BusinessRequestController {

    private final BusinessRequestService businessRequestService;

    // 비즈니스 요청 생성
    @PostMapping
    public ResponseEntity<BusinessRequestDTO> createBusinessRequest(
            @RequestParam("data") String dataJson,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal com.backend.dto.member.MemberDTO authMember) {
        
        try {
            // JSON 문자열을 DTO로 변환
            ObjectMapper objectMapper = new ObjectMapper();
            BusinessRequestCreateDTO createDTO = objectMapper.readValue(dataJson, BusinessRequestCreateDTO.class);
            
            String memberEmail = authMember != null ? authMember.getEmail() : null;
            BusinessRequestDTO createdRequest = businessRequestService.createBusinessRequest(createDTO, image, memberEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
        } catch (Exception e) {
            log.error("비즈니스 요청 생성 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 특정 회원의 요청 목록 조회
    @GetMapping("/member/{memberEmail}")
    public ResponseEntity<List<BusinessRequestDTO>> getBusinessRequestsByMember(@PathVariable String memberEmail) {
        try {
            List<BusinessRequestDTO> requests = businessRequestService.getBusinessRequestsByMember(memberEmail);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            log.error("회원별 비즈니스 요청 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 모든 요청 목록 조회 (관리자용)
    @GetMapping("/admin")
    public ResponseEntity<BusinessRequestPageDTO> getAllBusinessRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<BusinessRequestDTO> requests = businessRequestService.getAllBusinessRequests(pageable);
            return ResponseEntity.ok(BusinessRequestPageDTO.fromPage(requests));
        } catch (Exception e) {
            log.error("전체 비즈니스 요청 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 상태별 요청 목록 조회 (관리자용)
    @GetMapping("/admin/status/{status}")
    public ResponseEntity<BusinessRequestPageDTO> getBusinessRequestsByStatus(
            @PathVariable BusinessRequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<BusinessRequestDTO> requests = businessRequestService.getBusinessRequestsByStatus(status, pageable);
            return ResponseEntity.ok(BusinessRequestPageDTO.fromPage(requests));
        } catch (Exception e) {
            log.error("상태별 비즈니스 요청 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 특정 요청 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<BusinessRequestDTO> getBusinessRequestById(@PathVariable Long id) {
        try {
            BusinessRequestDTO request = businessRequestService.getBusinessRequestById(id);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            log.error("비즈니스 요청 상세 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 요청 검토 (승인/거부) - 관리자용
    @PutMapping("/admin/review")
    public ResponseEntity<BusinessRequestDTO> reviewBusinessRequest(@RequestBody BusinessRequestReviewDTO reviewDTO) {
        try {
            BusinessRequestDTO reviewedRequest = businessRequestService.reviewBusinessRequest(reviewDTO);
            return ResponseEntity.ok(reviewedRequest);
        } catch (Exception e) {
            log.error("비즈니스 요청 검토 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 대기중인 요청 개수 조회
    @GetMapping("/admin/pending-count")
    public ResponseEntity<Long> getPendingRequestCount() {
        try {
            long count = businessRequestService.getPendingRequestCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("대기중인 요청 개수 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 