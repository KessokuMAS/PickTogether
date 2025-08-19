import jwtAxios from "../utils/jwtAxios";

const BASE_URL = "/api/business-requests";

// 비즈니스 요청 생성
export const createBusinessRequest = async (formData, image, memberEmail) => {
  try {
    const data = new FormData();

    // JSON 데이터를 문자열로 추가
    data.append("data", JSON.stringify(formData));

    // 이미지 추가
    if (image) {
      data.append("image", image);
    }

    // 서버에서 인증 사용자 이메일을 사용하므로 전송 불필요
    if (memberEmail) {
      data.append("memberEmail", memberEmail);
    }

    const response = await jwtAxios.post(BASE_URL, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("비즈니스 요청 생성 오류:", error);
    throw error;
  }
};

// 특정 회원의 요청 목록 조회
export const getBusinessRequestsByMember = async (memberEmail) => {
  try {
    const response = await jwtAxios.get(`${BASE_URL}/member/${memberEmail}`);
    return response.data;
  } catch (error) {
    console.error("회원별 비즈니스 요청 조회 오류:", error);
    throw error;
  }
};

// 모든 요청 목록 조회 (관리자용)
export const getAllBusinessRequests = async (page = 0, size = 10) => {
  try {
    const response = await jwtAxios.get(`${BASE_URL}/admin`, {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    console.error("전체 비즈니스 요청 조회 오류:", error);
    throw error;
  }
};

// 상태별 요청 목록 조회 (관리자용)
export const getBusinessRequestsByStatus = async (
  status,
  page = 0,
  size = 10
) => {
  try {
    const response = await jwtAxios.get(`${BASE_URL}/admin/status/${status}`, {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    console.error("상태별 비즈니스 요청 조회 오류:", error);
    throw error;
  }
};

// 특정 요청 상세 조회
export const getBusinessRequestById = async (id) => {
  try {
    const response = await jwtAxios.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("비즈니스 요청 상세 조회 오류:", error);
    throw error;
  }
};

// 요청 검토 (승인/거부) - 관리자용
export const reviewBusinessRequest = async (reviewData) => {
  try {
    const response = await jwtAxios.put(`${BASE_URL}/admin/review`, reviewData);
    return response.data;
  } catch (error) {
    console.error("비즈니스 요청 검토 오류:", error);
    throw error;
  }
};

// 대기중인 요청 개수 조회
export const getPendingRequestCount = async () => {
  try {
    const response = await jwtAxios.get(`${BASE_URL}/admin/pending-count`);
    return response.data;
  } catch (error) {
    console.error("대기중인 요청 개수 조회 오류:", error);
    throw error;
  }
};
