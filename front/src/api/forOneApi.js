import api from "../utils/jwtAxios";

export async function createForOneFunding(fundingData) {
  try {
    const response = await api.post("/api/for-one/funding", fundingData);
    return response;
  } catch (error) {
    console.error("한그릇 펀딩 생성 실패:", error);
    throw error;
  }
}

export async function getForOneFundings(memberId) {
  try {
    const { data } = await api.get(`/api/for-one/funding/member/${memberId}`);
    return data;
  } catch (error) {
    console.error("한그릇 펀딩 목록 조회 실패:", error);
    throw error;
  }
}

export async function getForOneFundingById(fundingId) {
  try {
    const { data } = await api.get(`/api/for-one/funding/${fundingId}`);
    return data;
  } catch (error) {
    console.error("한그릇 펀딩 상세 조회 실패:", error);
    throw error;
  }
}
