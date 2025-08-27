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
        try {
            log.info("비즈니스 요청 검토 시작: ID={}, Status={}", reviewDTO.getId(), reviewDTO.getStatus());
            
            // 입력 데이터 검증
            if (reviewDTO.getId() == null) {
                throw new IllegalArgumentException("비즈니스 요청 ID가 필요합니다.");
            }
            if (reviewDTO.getStatus() == null) {
                throw new IllegalArgumentException("검토 상태가 필요합니다.");
            }
            
            BusinessRequest request = businessRequestRepository.findById(reviewDTO.getId())
                    .orElseThrow(() -> new RuntimeException("비즈니스 요청을 찾을 수 없습니다. ID: " + reviewDTO.getId()));
            
            log.info("비즈니스 요청 조회 완료: {}", request.getName());
            
            // 상태 업데이트
            request.setStatus(reviewDTO.getStatus());
            request.setReviewComment(reviewDTO.getReviewComment());
            request.setReviewedAt(LocalDateTime.now());
            
            BusinessRequest updatedRequest = businessRequestRepository.save(request);
            log.info("비즈니스 요청 상태 업데이트 완료: {} -> {}", request.getStatus(), updatedRequest.getStatus());
            
            // 승인된 경우 restaurant과 restaurant_image 테이블에 데이터 저장
            if (reviewDTO.getStatus() == BusinessRequestStatus.APPROVED) {
                try {
                    createRestaurantFromBusinessRequest(updatedRequest);
                    log.info("Restaurant 생성 완료: {}", updatedRequest.getName());
                } catch (Exception e) {
                    log.error("Restaurant 생성 실패: {}", e.getMessage(), e);
                    // Restaurant 생성 실패 시에도 비즈니스 요청 상태는 업데이트된 상태로 유지
                    // 필요시 상태를 ROLLBACK할 수 있음
                }
                
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
            
            log.info("비즈니스 요청 검토 완료: ID={}, Status={}", updatedRequest.getId(), updatedRequest.getStatus());
            return convertToDTO(updatedRequest);
            
        } catch (Exception e) {
            log.error("비즈니스 요청 검토 중 오류 발생: reviewDTO={}", reviewDTO, e);
            throw new RuntimeException("비즈니스 요청 검토에 실패했습니다: " + e.getMessage(), e);
        }
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
        
        String trimmedDate = dateString.trim();
        
        try {
            // ISO 형식 (YYYY-MM-DD) 시도
            return LocalDate.parse(trimmedDate, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e1) {
            try {
                // 다른 일반적인 형식들 시도
                if (trimmedDate.matches("\\d{4}-\\d{1,2}-\\d{1,2}")) {
                    // YYYY-M-D 형식
                    String[] parts = trimmedDate.split("-");
                    int year = Integer.parseInt(parts[0]);
                    int month = Integer.parseInt(parts[1]);
                    int day = Integer.parseInt(parts[2]);
                    return LocalDate.of(year, month, day);
                } else if (trimmedDate.matches("\\d{8}")) {
                    // YYYYMMDD 형식
                    int year = Integer.parseInt(trimmedDate.substring(0, 4));
                    int month = Integer.parseInt(trimmedDate.substring(4, 6));
                    int day = Integer.parseInt(trimmedDate.substring(6, 8));
                    return LocalDate.of(year, month, day);
                } else {
                    log.warn("지원하지 않는 날짜 형식: {}", trimmedDate);
                    return null;
                }
            } catch (Exception e2) {
                log.warn("날짜 파싱 실패: {} (ISO 형식 실패: {}, 대체 형식 실패: {})", 
                        trimmedDate, e1.getMessage(), e2.getMessage());
                return null;
            }
        }
    }

    // BusinessRequest를 Restaurant과 RestaurantImage로 변환하여 저장
    private void createRestaurantFromBusinessRequest(BusinessRequest businessRequest) {
        try {
            log.info("Restaurant 생성 시작: BusinessRequest ID={}, Name={}", businessRequest.getId(), businessRequest.getName());
            
            // 필수 데이터 검증
            if (businessRequest.getName() == null || businessRequest.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("가게명이 필요합니다.");
            }
            if (businessRequest.getCategoryName() == null || businessRequest.getCategoryName().trim().isEmpty()) {
                throw new IllegalArgumentException("카테고리가 필요합니다.");
            }
            if (businessRequest.getRoadAddressName() == null || businessRequest.getRoadAddressName().trim().isEmpty()) {
                throw new IllegalArgumentException("주소가 필요합니다.");
            }
            
            // Restaurant 엔티티 생성
            Restaurant restaurant = Restaurant.builder()
                    // .id(businessRequest.getId()) // ID는 자동 증가로 설정됨
                    .name(businessRequest.getName().trim())
                    .categoryName(businessRequest.getCategoryName().trim())
                    .phone(businessRequest.getPhone() != null ? businessRequest.getPhone().trim() : null)
                    .roadAddressName(businessRequest.getRoadAddressName().trim())
                    .x(businessRequest.getX())
                    .y(businessRequest.getY())
                    .placeUrl(businessRequest.getPlaceUrl())
                    .fundingAmount(0L) // 초기 펀딩 금액은 0
                    .fundingGoalAmount(businessRequest.getFundingGoalAmount() != null ? businessRequest.getFundingGoalAmount() : 0L)
                    .fundingStartDate(parseDate(businessRequest.getFundingStartDate()))
                    .fundingEndDate(parseDate(businessRequest.getFundingEndDate()))
                    .build();
            
            log.info("Restaurant 엔티티 생성 완료: {}", restaurant.getName());
            
            // Restaurant 저장
            Restaurant savedRestaurant = restaurantRepository.save(restaurant);
            log.info("Restaurant 저장 완료: ID={}", savedRestaurant.getId());
            
            // 이미지가 있는 경우 가게용 경로로 복사하고 RestaurantImage 엔티티 생성
            if (businessRequest.getImageUrl() != null && !businessRequest.getImageUrl().trim().isEmpty()) {
                try {
                    String restaurantImageUrl = copyImageToRestaurantFolder(businessRequest.getImageUrl());
                    
                    RestaurantImage restaurantImage = RestaurantImage.builder()
                            .restaurant(savedRestaurant)
                            .imageUrl(restaurantImageUrl)
                            .isMain(true) // 메인 이미지로 설정
                            .sortOrder(0) // 첫 번째 이미지
                            .build();
                    
                    restaurantImageRepository.save(restaurantImage);
                    log.info("RestaurantImage 저장 완료: {}", restaurantImageUrl);
                } catch (Exception e) {
                    log.error("이미지 처리 중 오류 발생: {}", e.getMessage(), e);
                    // 이미지 처리 실패는 Restaurant 생성에 영향을 주지 않도록 함
                }
            } else {
                log.info("이미지가 없어 RestaurantImage 생성을 건너뜁니다.");
            }
            
            log.info("BusinessRequest ID: {} 승인 완료. Restaurant ID: {} 생성됨", 
                    businessRequest.getId(), savedRestaurant.getId());
                    
        } catch (Exception e) {
            log.error("Restaurant 생성 중 오류 발생: BusinessRequest ID: {}, Name: {}", 
                    businessRequest.getId(), businessRequest.getName(), e);
            throw new RuntimeException("Restaurant 생성에 실패했습니다: " + e.getMessage(), e);
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