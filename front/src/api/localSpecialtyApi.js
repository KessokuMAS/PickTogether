import axios from "axios";

const BASE_URL = "http://localhost:8080";

export const localSpecialtyApi = {
  // 전체 지역특산물 목록 조회
  getAllLocalSpecialties: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/local-specialty`);
      return response.data;
    } catch (error) {
      console.error("지역특산물 목록 조회 실패:", error);
      throw error;
    }
  },

  // ID로 지역특산물 조회 (콘텐츠 번호로 조회)
  getLocalSpecialtyById: async (cntntsNo) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/local-specialty/${cntntsNo}`
      );
      return response.data;
    } catch (error) {
      console.error("지역특산물 상세 조회 실패:", error);
      throw error;
    }
  },

  // 콘텐츠 번호로 지역특산물 조회 (위와 동일한 기능)
  getLocalSpecialtyByCntntsNo: async (cntntsNo) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/local-specialty/${cntntsNo}`
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
        `${BASE_URL}/api/local-specialty/area?sidoNm=${sidoNm}`
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
        `${BASE_URL}/api/local-specialty/area?sidoNm=${sidoNm}&sigunguNm=${sigunguNm}`
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
        `${BASE_URL}/api/local-specialty/search?searchText=${searchText}`
      );
      return response.data;
    } catch (error) {
      console.error("지역특산물 검색 실패:", error);
      throw error;
    }
  },

  // 시도 목록 조회
  getSidoList: async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/local-specialty/sido-list`
      );
      return response.data;
    } catch (error) {
      console.error("시도 목록 조회 실패:", error);
      throw error;
    }
  },

  // 특정 시도의 시군구 목록 조회
  getSigunguList: async (sidoNm) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/local-specialty/sigungu-list?sidoNm=${sidoNm}`
      );
      return response.data;
    } catch (error) {
      console.error("시군구 목록 조회 실패:", error);
      throw error;
    }
  },

  // 펀딩 진행률이 높은 순으로 조회 (백엔드에 해당 엔드포인트가 없으므로 임시로 전체 조회)
  getLocalSpecialtiesOrderByFundingProgress: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/local-specialty`);
      return response.data;
    } catch (error) {
      console.error("펀딩 진행률별 지역특산물 조회 실패:", error);
      throw error;
    }
  },

  // 펀딩 달성률이 특정 퍼센트 이상인 것 조회 (백엔드에 해당 엔드포인트가 없으므로 임시로 전체 조회)
  getLocalSpecialtiesByFundingProgress: async (minPercent) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/local-specialty`);
      return response.data;
    } catch (error) {
      console.error("펀딩 달성률별 지역특산물 조회 실패:", error);
      throw error;
    }
  },

  // 펀딩 금액 업데이트 (백엔드에 해당 엔드포인트가 없으므로 에러 처리)
  updateFundingAmount: async (id, newFundingAmount) => {
    try {
      // 현재 백엔드에 해당 엔드포인트가 없음
      throw new Error(
        "펀딩 금액 업데이트 기능이 백엔드에 구현되지 않았습니다."
      );
    } catch (error) {
      console.error("펀딩 금액 업데이트 실패:", error);
      throw error;
    }
  },
};
