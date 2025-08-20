package com.backend.service.specialty;

import com.backend.dto.specialty.LocalSpecialtyDTO;
import com.backend.domain.specialty.LocalSpecialty;

import java.util.List;

public interface LocalSpecialtyService {
    
    // 모든 지역특산물 조회
    List<LocalSpecialtyDTO> getAllLocalSpecialties();
    
    // ID로 지역특산물 조회
    LocalSpecialtyDTO getLocalSpecialtyById(Long id);
    
    // 콘텐츠 번호로 지역특산물 조회
    LocalSpecialtyDTO getLocalSpecialtyByCntntsNo(String cntntsNo);
    
    // 시도별 지역특산물 조회
    List<LocalSpecialtyDTO> getLocalSpecialtiesBySido(String sidoNm);
    
    // 시도와 시군구별 지역특산물 조회
    List<LocalSpecialtyDTO> getLocalSpecialtiesBySidoAndSigungu(String sidoNm, String sigunguNm);
    
    // 검색어로 지역특산물 조회
    List<LocalSpecialtyDTO> searchLocalSpecialties(String searchText);
    
    // 펀딩 진행률이 높은 순으로 조회
    List<LocalSpecialtyDTO> getLocalSpecialtiesOrderByFundingProgress();
    
    // 펀딩 달성률이 특정 퍼센트 이상인 것 조회
    List<LocalSpecialtyDTO> getLocalSpecialtiesByFundingProgress(Double minPercent);
    
    // 펀딩 정보 업데이트
    LocalSpecialtyDTO updateFundingAmount(Long id, Long newFundingAmount);
} 