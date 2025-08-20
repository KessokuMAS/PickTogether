package com.backend.service.restaurant;

import com.backend.domain.member.Member;
import com.backend.domain.restaurant.BusinessRequest;
import com.backend.domain.restaurant.BusinessRequestStatus;
import com.backend.dto.restaurant.BusinessRequestCreateDTO;
import com.backend.dto.restaurant.BusinessRequestDTO;
import com.backend.dto.restaurant.BusinessRequestReviewDTO;
import com.backend.repository.member.MemberRepository;
import com.backend.repository.restaurant.BusinessRequestRepository;
import com.backend.repository.restaurant.RestaurantRepository;
import com.backend.repository.restaurant.RestaurantImageRepository;
import com.backend.domain.restaurant.Restaurant;
import com.backend.domain.restaurant.RestaurantImage;
import com.backend.service.notification.NotificationService;
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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
    private final RestaurantRepository restaurantRepository;
    private final RestaurantImageRepository restaurantImageRepository;
    private final NotificationService notificationService;
    
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
        
        // 승인된 경우 restaurant과 restaurant_image 테이블에 데이터 저장
        if (reviewDTO.getStatus() == BusinessRequestStatus.APPROVED) {
            createRestaurantFromBusinessRequest(updatedRequest);
            
            // 승인 알림 생성
            try {
                notificationService.createBusinessRequestApprovedNotification(
                    updatedRequest.getRequesterEmail(), 
                    updatedRequest.getName()
                );
                log.info("가게요청 승인 알림 생성 완료: {}", updatedRequest.getRequesterEmail());
            } catch (Exception e) {
                log.error("가게요청 승인 알림 생성 실패: {}", e.getMessage(), e);
                // 알림 생성 실패는 전체 프로세스에 영향을 주지 않도록 함
            }
        } else if (reviewDTO.getStatus() == BusinessRequestStatus.REJECTED) {
            // 거부 알림 생성
            try {
                notificationService.createBusinessRequestRejectedNotification(
                    updatedRequest.getRequesterEmail(), 
                    updatedRequest.getName(),
                    reviewDTO.getReviewComment() != null ? reviewDTO.getReviewComment() : "사유 없음"
                );
                log.info("가게요청 거부 알림 생성 완료: {}", updatedRequest.getRequesterEmail());
            } catch (Exception e) {
                log.error("가게요청 거부 알림 생성 실패: {}", e.getMessage(), e);
                // 알림 생성 실패는 전체 프로세스에 영향을 주지 않도록 함
            }
        }
        
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

    // 가게 요청 이미지를 가게용 폴더로 복사하는 메서드
    private String copyImageToRestaurantFolder(String businessRequestImageUrl) {
        try {
            // 가게용 이미지 디렉토리
            String restaurantImageDir = "uploads/restaurants/";
            Path restaurantPath = Paths.get(restaurantImageDir);
            if (!Files.exists(restaurantPath)) {
                Files.createDirectories(restaurantPath);
            }
            
            // 원본 파일 경로
            Path sourcePath = Paths.get(businessRequestImageUrl);
            if (!Files.exists(sourcePath)) {
                log.warn("원본 이미지 파일을 찾을 수 없습니다: {}", businessRequestImageUrl);
                return businessRequestImageUrl; // 원본 경로 반환
            }
            
            // 새 파일명 생성 (UUID 사용)
            String extension = businessRequestImageUrl.substring(businessRequestImageUrl.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            
            // 가게용 폴더로 복사
            Path targetPath = restaurantPath.resolve(filename);
            Files.copy(sourcePath, targetPath);
            
            log.info("이미지 복사 완료: {} -> {}", businessRequestImageUrl, restaurantImageDir + filename);
            return restaurantImageDir + filename;
            
        } catch (IOException e) {
            log.error("이미지 복사 중 오류 발생: {}", businessRequestImageUrl, e);
            return businessRequestImageUrl; // 오류 시 원본 경로 반환
        }
    }

    // String을 LocalDate로 변환하는 헬퍼 메서드
    private LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            log.warn("날짜 파싱 실패: {}", dateString, e);
            return null;
        }
    }

    // BusinessRequest를 Restaurant과 RestaurantImage로 변환하여 저장
    private void createRestaurantFromBusinessRequest(BusinessRequest businessRequest) {
        try {
            // Restaurant 엔티티 생성
            Restaurant restaurant = Restaurant.builder()
                    // .id(businessRequest.getId()) // ID는 자동 증가로 설정됨
                    .name(businessRequest.getName())
                    .categoryName(businessRequest.getCategoryName())
                    .phone(businessRequest.getPhone())
                    .roadAddressName(businessRequest.getRoadAddressName())
                    .x(businessRequest.getX())
                    .y(businessRequest.getY())
                    .placeUrl(businessRequest.getPlaceUrl())
                    .fundingAmount(0L) // 초기 펀딩 금액은 0
                    .fundingGoalAmount(businessRequest.getFundingGoalAmount())
                    .fundingStartDate(parseDate(businessRequest.getFundingStartDate()))
                    .fundingEndDate(parseDate(businessRequest.getFundingEndDate()))
                    .build();
            
            // Restaurant 저장
            Restaurant savedRestaurant = restaurantRepository.save(restaurant);
            
            // 이미지가 있는 경우 가게용 경로로 복사하고 RestaurantImage 엔티티 생성
            if (businessRequest.getImageUrl() != null && !businessRequest.getImageUrl().isEmpty()) {
                String restaurantImageUrl = copyImageToRestaurantFolder(businessRequest.getImageUrl());
                
                RestaurantImage restaurantImage = RestaurantImage.builder()
                        .restaurant(savedRestaurant)
                        .imageUrl(restaurantImageUrl)
                        .isMain(true) // 메인 이미지로 설정
                        .sortOrder(0) // 첫 번째 이미지
                        .build();
                
                restaurantImageRepository.save(restaurantImage);
            }
            
            log.info("BusinessRequest ID: {} 승인 완료. Restaurant ID: {} 생성됨", 
                    businessRequest.getId(), savedRestaurant.getId());
                    
        } catch (Exception e) {
            log.error("Restaurant 생성 중 오류 발생: BusinessRequest ID: {}", businessRequest.getId(), e);
            throw new RuntimeException("Restaurant 생성에 실패했습니다.", e);
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