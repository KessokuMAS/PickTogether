import jwtAxios from "../utils/jwtAxios";

const BASE_URL = "http://localhost:8080";

export const localSpecialtyApi = {
  // 전체 지역특산물 목록 조회
  getAllLocalSpecialties: async () => {
    try {
      const response = await jwtAxios.get(`${BASE_URL}/api/local-specialty`);
      return response.data;
    } catch (error) {
      console.error("지역특산물 목록 조회 실패:", error);
      throw error;
    }
  },

  // 지역별 지역특산물 조회
  getLocalSpecialtiesByArea: async (sidoNm, sigunguNm) => {
    try {
      const response = await jwtAxios.get(
        `${BASE_URL}/api/local-specialty/area`,
        {
          params: { sidoNm, sigunguNm },
        }
      );
      return response.data;
    } catch (error) {
      console.error("지역별 지역특산물 조회 실패:", error);
      throw error;
    }
  },

  // 검색어로 지역특산물 조회
  searchLocalSpecialties: async (searchText) => {
    try {
      const response = await jwtAxios.get(
        `${BASE_URL}/api/local-specialty/search`,
        {
          params: { searchText },
        }
      );
      return response.data;
    } catch (error) {
      console.error("지역특산물 검색 실패:", error);
      throw error;
    }
  },

  // 콘텐츠 번호로 특정 지역특산물 조회
  getLocalSpecialtyById: async (cntntsNo) => {
    try {
      const response = await jwtAxios.get(
        `${BASE_URL}/api/local-specialty/${cntntsNo}`
      );
      return response.data;
    } catch (error) {
      console.error("지역특산물 상세 조회 실패:", error);
      throw error;
    }
  },
};
