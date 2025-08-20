package com.backend.service.specialty;

import com.backend.domain.specialty.LocalSpecialty;
import com.backend.dto.specialty.LocalSpecialtyDTO;
import com.backend.repository.specialty.LocalSpecialtyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class LocalSpecialtyServiceImpl implements LocalSpecialtyService {
    
    private final LocalSpecialtyRepository localSpecialtyRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<LocalSpecialtyDTO> getAllLocalSpecialties() {
        // 최적화된 쿼리로 한 번에 모든 데이터 조회
        List<Object[]> results = localSpecialtyRepository.findAllWithFundingAmounts();
        
        return results.stream()
                .map(this::convertObjectArrayToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public LocalSpecialtyDTO getLocalSpecialtyById(Long id) {
        LocalSpecialty specialty = localSpecialtyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("지역특산물을 찾을 수 없습니다. ID: " + id));
        return convertToDTO(specialty);
    }
    
    @Override
    @Transactional(readOnly = true)
    public LocalSpecialtyDTO getLocalSpecialtyByCntntsNo(String cntntsNo) {
        LocalSpecialty specialty = localSpecialtyRepository.findByCntntsNo(cntntsNo)
                .orElseThrow(() -> new RuntimeException("지역특산물을 찾을 수 없습니다. 콘텐츠 번호: " + cntntsNo));
        return convertToDTO(specialty);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<LocalSpecialtyDTO> getLocalSpecialtiesBySido(String sidoNm) {
        List<LocalSpecialty> specialties = localSpecialtyRepository.findBySidoNm(sidoNm);
        return specialties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<LocalSpecialtyDTO> getLocalSpecialtiesBySidoAndSigungu(String sidoNm, String sigunguNm) {
        List<LocalSpecialty> specialties = localSpecialtyRepository.findBySidoNmAndSigunguNm(sidoNm, sigunguNm);
        return specialties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<LocalSpecialtyDTO> searchLocalSpecialties(String searchText) {
        List<LocalSpecialty> specialties = localSpecialtyRepository.findBySearchText(searchText);
        return specialties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<LocalSpecialtyDTO> getLocalSpecialtiesOrderByFundingProgress() {
        List<LocalSpecialty> specialties = localSpecialtyRepository.findAllOrderByFundingProgress();
        return specialties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<LocalSpecialtyDTO> getLocalSpecialtiesByFundingProgress(Double minPercent) {
        List<LocalSpecialty> specialties = localSpecialtyRepository.findByFundingProgressGreaterThan(minPercent);
        return specialties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public LocalSpecialtyDTO updateFundingAmount(Long id, Long newFundingAmount) {
        LocalSpecialty specialty = localSpecialtyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("지역특산물을 찾을 수 없습니다. ID: " + id));
        
        specialty.setFundingAmount(newFundingAmount);
        LocalSpecialty updatedSpecialty = localSpecialtyRepository.save(specialty);
        return convertToDTO(updatedSpecialty);
    }
    
    // 엔티티를 DTO로 변환
    private LocalSpecialtyDTO convertToDTO(LocalSpecialty specialty) {
        // 펀딩 테이블에서 결제 완료된 금액 합계 조회 (cntntsNo로 조회)
        Long totalFundingAmount = localSpecialtyRepository.getTotalFundingAmountByCntntsNo(specialty.getCntntsNo());
        
        // 실제 펀딩된 총 금액 (기본 fundingAmount + 결제 완료된 금액)
        Long actualFundingAmount = (specialty.getFundingAmount() != null ? specialty.getFundingAmount() : 0L) + 
                                  (totalFundingAmount != null ? totalFundingAmount : 0L);
        
        // 펀딩 달성률 계산 (실제 펀딩된 총 금액 기준)
        Integer fundingPercent = 0;
        if (specialty.getFundingGoalAmount() != null && specialty.getFundingGoalAmount() > 0) {
            fundingPercent = (int) Math.round((actualFundingAmount * 100.0) / specialty.getFundingGoalAmount());
        }
        
        return LocalSpecialtyDTO.builder()
                .id(specialty.getId())
                .cntntsNo(specialty.getCntntsNo())
                .cntntsSj(specialty.getCntntsSj())
                .areaNm(specialty.getAreaNm())
                .imgUrl(specialty.getImgUrl())
                .svcDt(specialty.getSvcDt())
                .linkUrl(specialty.getLinkUrl())
                .areaCode(specialty.getAreaCode())
                .sidoNm(specialty.getSidoNm())
                .sigunguNm(specialty.getSigunguNm())
                .createdAt(specialty.getCreatedAt())
                .fundingGoalAmount(specialty.getFundingGoalAmount())
                .fundingAmount(specialty.getFundingAmount())
                .fundingPercent(fundingPercent)
                .totalFundingAmount(totalFundingAmount)
                .build();
    }
    
    // Object[] 배열을 DTO로 변환 (최적화된 쿼리용)
    private LocalSpecialtyDTO convertObjectArrayToDTO(Object[] row) {
        Long id = ((Number) row[0]).longValue();
        String cntntsNo = (String) row[1];
        String cntntsSj = (String) row[2];
        String areaNm = (String) row[3];
        String imgUrl = (String) row[4];
        java.sql.Date svcDtSql = (java.sql.Date) row[5];
        String linkUrl = (String) row[6];
        String areaCode = (String) row[7];
        String sidoNm = (String) row[8];
        String sigunguNm = (String) row[9];
        java.sql.Date createdAtSql = (java.sql.Date) row[10];
        Long fundingGoalAmount = ((Number) row[11]).longValue();
        Long fundingAmount = ((Number) row[12]).longValue();
        Long totalFundingAmount = ((Number) row[13]).longValue();
        
        // SQL Date를 LocalDate로 변환
        java.time.LocalDate svcDt = svcDtSql != null ? svcDtSql.toLocalDate() : null;
        java.time.LocalDate createdAt = createdAtSql != null ? createdAtSql.toLocalDate() : null;
        
        // 실제 펀딩된 총 금액 (기본 fundingAmount + 결제 완료된 금액)
        Long actualFundingAmount = (fundingAmount != null ? fundingAmount : 0L) + 
                                  (totalFundingAmount != null ? totalFundingAmount : 0L);
        
        // 펀딩 달성률 계산 (실제 펀딩된 총 금액 기준)
        Integer fundingPercent = 0;
        if (fundingGoalAmount != null && fundingGoalAmount > 0) {
            fundingPercent = (int) Math.round((actualFundingAmount * 100.0) / fundingGoalAmount);
        }
        
        return LocalSpecialtyDTO.builder()
                .id(id)
                .cntntsNo(cntntsNo)
                .cntntsSj(cntntsSj)
                .areaNm(areaNm)
                .imgUrl(imgUrl)
                .svcDt(svcDt)
                .linkUrl(linkUrl)
                .areaCode(areaCode)
                .sidoNm(sidoNm)
                .sigunguNm(sigunguNm)
                .createdAt(createdAt)
                .fundingGoalAmount(fundingGoalAmount)
                .fundingAmount(fundingAmount)
                .fundingPercent(fundingPercent)
                .totalFundingAmount(totalFundingAmount)
                .build();
    }
} 