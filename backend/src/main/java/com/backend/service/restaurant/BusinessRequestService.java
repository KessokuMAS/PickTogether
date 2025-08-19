package com.backend.service.restaurant;

import com.backend.domain.restaurant.BusinessRequestStatus;
import com.backend.dto.restaurant.BusinessRequestCreateDTO;
import com.backend.dto.restaurant.BusinessRequestDTO;
import com.backend.dto.restaurant.BusinessRequestReviewDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BusinessRequestService {
    
    // 비즈니스 요청 생성
    BusinessRequestDTO createBusinessRequest(BusinessRequestCreateDTO createDTO, MultipartFile image, String memberEmail);
    
    // 특정 회원의 요청 목록 조회
    List<BusinessRequestDTO> getBusinessRequestsByMember(String memberEmail);
    
    // 모든 요청 목록 조회 (관리자용)
    Page<BusinessRequestDTO> getAllBusinessRequests(Pageable pageable);
    
    // 상태별 요청 목록 조회 (관리자용)
    Page<BusinessRequestDTO> getBusinessRequestsByStatus(BusinessRequestStatus status, Pageable pageable);
    
    // 특정 요청 상세 조회
    BusinessRequestDTO getBusinessRequestById(Long id);
    
    // 요청 검토 (승인/거부)
    BusinessRequestDTO reviewBusinessRequest(BusinessRequestReviewDTO reviewDTO);
    
    // 대기중인 요청 개수 조회
    long getPendingRequestCount();
} 