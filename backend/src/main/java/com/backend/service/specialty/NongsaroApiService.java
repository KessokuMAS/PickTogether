package com.backend.service.specialty;

import com.backend.dto.specialty.NongsaroApiResponse;

import java.util.List;

public interface NongsaroApiService {
    
    /**
     * 시도 데이터 목록 조회
     */
    List<NongsaroApiResponse.Item> getSidoList();
    
    /**
     * 시군구 데이터 목록 조회
     */
    List<NongsaroApiResponse.Item> getSigunguList(String sidoNm);
    
    /**
     * 지역특산물 목록 조회
     */
    List<NongsaroApiResponse.Item> getLocalSpecialtyList(String searchText, String areaNm, 
                                                        String areaCode, int pageNo, int numOfRows);
} 