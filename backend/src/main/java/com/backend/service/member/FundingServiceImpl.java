package com.backend.service.member;

import com.backend.domain.member.Funding;
import com.backend.dto.member.FundingDTO;
import com.backend.dto.member.FundingCreateRequest;
import com.backend.repository.member.FundingRepository;
import com.backend.repository.member.MemberRepository;
import com.backend.repository.restaurant.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class FundingServiceImpl implements FundingService {
    
    private final FundingRepository fundingRepository;
    private final MemberRepository memberRepository;
    private final RestaurantRepository restaurantRepository;
    
    @Override
    @Transactional
    public Funding saveFunding(Funding funding) {
        log.info("펀딩 저장: {}", funding);
        return fundingRepository.save(funding);
    }
    
    @Override
    @Transactional
    public Funding createFunding(FundingCreateRequest request) {
        log.info("펀딩 생성: {}", request);
        
        // Member와 Restaurant 엔티티 조회
        var member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다: " + request.getMemberId()));
        
        var restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("레스토랑을 찾을 수 없습니다: " + request.getRestaurantId()));
        
        // Funding 엔티티 생성
        Funding funding = Funding.builder()
                .member(member)
                .restaurant(restaurant)
                .restaurantName(request.getRestaurantName())
                .menuInfo(request.getMenuInfo())
                .totalAmount(request.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .impUid(request.getImpUid())
                .merchantUid(request.getMerchantUid())
                .agreeSMS(request.getAgreeSMS())
                .agreeEmail(request.getAgreeEmail())
                .status(Funding.FundingStatus.COMPLETED)
                .build();
        
        return fundingRepository.save(funding);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FundingDTO> getMemberFundings(String memberId) {
        log.info("회원 펀딩 목록 조회: memberId={}", memberId);
        // JOIN FETCH를 사용하여 레스토랑 정보를 함께 조회
        List<Funding> fundings = fundingRepository.findMemberFundingsWithRestaurant(memberId);
        return fundings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FundingDTO> getRestaurantFundings(Long restaurantId) {
        log.info("레스토랑 펀딩 목록 조회: restaurantId={}", restaurantId);
        // JOIN FETCH를 사용하여 레스토랑 정보를 함께 조회
        List<Funding> fundings = fundingRepository.findRestaurantFundingsWithRestaurant(restaurantId);
        return fundings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public FundingDTO getFundingById(Long fundingId) {
        log.info("펀딩 상세 조회: fundingId={}", fundingId);
        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(() -> new RuntimeException("펀딩을 찾을 수 없습니다: " + fundingId));
        return convertToDTO(funding);
    }
    
    private FundingDTO convertToDTO(Funding funding) {
        // 레스토랑 정보를 직접 조회하여 마감일 가져오기
        LocalDate fundingEndDate = null;
        try {
            // funding에서 restaurant_id를 가져와서 직접 조회
            if (funding.getRestaurant() != null && funding.getRestaurant().getId() != null) {
                var restaurant = restaurantRepository.findById(funding.getRestaurant().getId()).orElse(null);
                if (restaurant != null) {
                    fundingEndDate = restaurant.getFundingEndDate();
                    log.info("레스토랑 마감일 조회 성공: fundingId={}, restaurantId={}, endDate={}", 
                            funding.getId(), funding.getRestaurant().getId(), fundingEndDate);
                }
            }
        } catch (Exception e) {
            log.warn("레스토랑 마감일 조회 실패: fundingId={}", funding.getId(), e);
        }
        
        return FundingDTO.builder()
                .id(funding.getId())
                .restaurantName(funding.getRestaurantName())
                .menuInfo(funding.getMenuInfo())
                .totalAmount(funding.getTotalAmount())
                .paymentMethod(funding.getPaymentMethod())
                .impUid(funding.getImpUid())
                .merchantUid(funding.getMerchantUid())
                .agreeSMS(funding.getAgreeSMS())
                .agreeEmail(funding.getAgreeEmail())
                .status(funding.getStatus().name())
                .createdAt(funding.getCreatedAt())
                .fundingEndDate(fundingEndDate)
                .build();
    }
} 