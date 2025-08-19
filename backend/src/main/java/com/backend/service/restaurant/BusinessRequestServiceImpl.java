package com.backend.service.restaurant;

import com.backend.domain.member.Member;
import com.backend.domain.restaurant.BusinessRequest;
import com.backend.domain.restaurant.BusinessRequestStatus;
import com.backend.dto.restaurant.BusinessRequestCreateDTO;
import com.backend.dto.restaurant.BusinessRequestDTO;
import com.backend.dto.restaurant.BusinessRequestReviewDTO;
import com.backend.repository.member.MemberRepository;
import com.backend.repository.restaurant.BusinessRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class BusinessRequestServiceImpl implements BusinessRequestService {

    private final BusinessRequestRepository businessRequestRepository;
    private final MemberRepository memberRepository;
    
    // 이미지 저장 경로
    private static final String UPLOAD_DIR = "uploads/business-requests/";

    @Override
    public BusinessRequestDTO createBusinessRequest(BusinessRequestCreateDTO createDTO, MultipartFile image, String memberEmail) {
        // 회원 조회
        Member member = memberRepository.findById(memberEmail).orElse(null);
        
        // 이미지 저장
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        }
        
        // 비즈니스 요청 엔티티 생성
        BusinessRequest businessRequest = BusinessRequest.builder()
                .name(createDTO.getName())
                .categoryName(createDTO.getCategoryName())
                .phone(createDTO.getPhone())
                .roadAddressName(createDTO.getRoadAddressName())
                .x(createDTO.getX())
                .y(createDTO.getY())
                .placeUrl(createDTO.getPlaceUrl())
                .fundingGoalAmount(createDTO.getFundingGoalAmount())
                .fundingStartDate(createDTO.getFundingStartDate())
                .fundingEndDate(createDTO.getFundingEndDate())
                .imageUrl(imageUrl)
                .status(BusinessRequestStatus.PENDING)
                .requesterEmail(memberEmail)
                .requesterNickname(member != null ? member.getNickname() : null)
                .member(member)
                .build();
        
        BusinessRequest savedRequest = businessRequestRepository.save(businessRequest);
        return convertToDTO(savedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessRequestDTO> getBusinessRequestsByMember(String memberEmail) {
        List<BusinessRequest> requests = businessRequestRepository.findByMemberOrRequesterEmailOrderByCreatedAtDesc(memberEmail);
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BusinessRequestDTO> getAllBusinessRequests(Pageable pageable) {
        Page<BusinessRequest> requests = businessRequestRepository.findAllByOrderByCreatedAtDesc(pageable);
        return requests.map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BusinessRequestDTO> getBusinessRequestsByStatus(BusinessRequestStatus status, Pageable pageable) {
        Page<BusinessRequest> requests = businessRequestRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        return requests.map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessRequestDTO getBusinessRequestById(Long id) {
        BusinessRequest request = businessRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("비즈니스 요청을 찾을 수 없습니다."));
        return convertToDTO(request);
    }

    @Override
    public BusinessRequestDTO reviewBusinessRequest(BusinessRequestReviewDTO reviewDTO) {
        BusinessRequest request = businessRequestRepository.findById(reviewDTO.getId())
                .orElseThrow(() -> new RuntimeException("비즈니스 요청을 찾을 수 없습니다."));
        
        request.setStatus(reviewDTO.getStatus());
        request.setReviewComment(reviewDTO.getReviewComment());
        request.setReviewedAt(LocalDateTime.now());
        
        BusinessRequest updatedRequest = businessRequestRepository.save(request);
        return convertToDTO(updatedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public long getPendingRequestCount() {
        return businessRequestRepository.countByStatus(BusinessRequestStatus.PENDING);
    }

    // 이미지 저장 메서드
    private String saveImage(MultipartFile image) {
        try {
            // 업로드 디렉토리 생성
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // 파일명 생성 (UUID 사용)
            String originalFilename = image.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            
            // 파일 저장
            Path filePath = uploadPath.resolve(filename);
            Files.copy(image.getInputStream(), filePath);
            
            return UPLOAD_DIR + filename;
        } catch (IOException e) {
            log.error("이미지 저장 중 오류 발생", e);
            throw new RuntimeException("이미지 저장에 실패했습니다.", e);
        }
    }

    // 엔티티를 DTO로 변환
    private BusinessRequestDTO convertToDTO(BusinessRequest request) {
        return BusinessRequestDTO.builder()
                .id(request.getId())
                .name(request.getName())
                .categoryName(request.getCategoryName())
                .phone(request.getPhone())
                .roadAddressName(request.getRoadAddressName())
                .x(request.getX())
                .y(request.getY())
                .placeUrl(request.getPlaceUrl())
                .fundingGoalAmount(request.getFundingGoalAmount())
                .fundingStartDate(request.getFundingStartDate())
                .fundingEndDate(request.getFundingEndDate())
                .imageUrl(request.getImageUrl())
                .status(request.getStatus())
                .memberEmail(request.getMember() != null ? request.getMember().getEmail() : request.getRequesterEmail())
                .memberName(request.getMember() != null ? request.getMember().getNickname() : request.getRequesterNickname())
                .createdAt(request.getCreatedAt())
                .reviewedAt(request.getReviewedAt())
                .reviewComment(request.getReviewComment())
                .build();
    }
} 