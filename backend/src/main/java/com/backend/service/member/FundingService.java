package com.backend.service.member;

import com.backend.dto.member.FundingDTO;
import com.backend.dto.member.FundingCreateRequest;
import com.backend.domain.member.Funding;

import java.util.List;

public interface FundingService {
    
    Funding saveFunding(Funding funding);
    
    Funding createFunding(FundingCreateRequest request);
    
    List<FundingDTO> getMemberFundings(String memberId);
    
    List<FundingDTO> getRestaurantFundings(Long restaurantId);
    
    FundingDTO getFundingById(Long fundingId);
} 