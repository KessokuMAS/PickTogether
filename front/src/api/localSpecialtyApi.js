import axios from "axios";

const BASE_URL = "http://localhost:8080";

export const localSpecialtyApi = {
  // 전체 지역특산물 목록 조회
  getAllLocalSpecialties: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/local-specialties`);
      return response.data;
    } catch (error) {
      console.error("지역특산물 목록 조회 실패:", error);
      throw error;
    }
  },

  // ID로 지역특산물 조회
  getLocalSpecialtyById: async (id) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/local-specialties/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("지역특산물 상세 조회 실패:", error);
      throw error;
    }
  },

  // 콘텐츠 번호로 지역특산물 조회
  getLocalSpecialtyByCntntsNo: async (cntntsNo) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/local-specialties/content/${cntntsNo}`
      );
      return response.data;
    } catch (error) {
      console.error("지역특산물 상세 조회 실패:", error);
      throw error;
    }
  },

  // 시도별 지역특산물 조회
  getLocalSpecialtiesBySido: async (sidoNm) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/local-specialties/sido/${sidoNm}`
      );
      return response.data;
    } catch (error) {
      console.error("시도별 지역특산물 조회 실패:", error);
      throw error;
    }
  },

  // 시도와 시군구별 지역특산물 조회
  getLocalSpecialtiesBySidoAndSigungu: async (sidoNm, sigunguNm) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/local-specialties/sido/${sidoNm}/sigungu/${sigunguNm}`
      );
      return response.data;
    } catch (error) {
      console.error("시도/시군구별 지역특산물 조회 실패:", error);
      throw error;
    }
  },

  // 검색어로 지역특산물 조회
  searchLocalSpecialties: async (searchText) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/local-specialties/search?q=${searchText}`
      );
      return response.data;
    } catch (error) {
      console.error("지역특산물 검색 실패:", error);
      throw error;
    }
  },

  // 펀딩 진행률이 높은 순으로 조회
  getLocalSpecialtiesOrderByFundingProgress: async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/local-specialties/funding/progress`
      );
      return response.data;
    } catch (error) {
      console.error("펀딩 진행률별 지역특산물 조회 실패:", error);
      throw error;
    }
  },

  // 펀딩 달성률이 특정 퍼센트 이상인 것 조회
  getLocalSpecialtiesByFundingProgress: async (minPercent) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/local-specialties/funding/progress/${minPercent}`
      );
      return response.data;
    } catch (error) {
      console.error("펀딩 달성률별 지역특산물 조회 실패:", error);
      throw error;
    }
  },

  // 펀딩 금액 업데이트
  updateFundingAmount: async (id, newFundingAmount) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/local-specialties/${id}/funding`,
        newFundingAmount
      );
      return response.data;
    } catch (error) {
      console.error("펀딩 금액 업데이트 실패:", error);
      throw error;
    }
  },
};
