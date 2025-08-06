import axios from "axios";
import { NAVER_CONFIG, API_CONFIG } from "../config/constants";

export const getNaverLoginLink = () => {
  const naverURL = `${NAVER_CONFIG.AUTH_URL}?client_id=${
    NAVER_CONFIG.CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    NAVER_CONFIG.REDIRECT_URI
  )}&response_type=code&state=naver`;

  return naverURL;
};

export const getAccessToken = async (authCode, state) => {
  try {
    console.log("네이버 토큰 요청 파라미터:", {
      code: authCode,
      state: state,
    });

    // 백엔드를 통해 토큰 교환
    const res = await axios.get(
      `${API_CONFIG.BASE_URL}/member/naver/token?code=${authCode}&state=${state}`
    );

    console.log("네이버 토큰 응답:", res.data);

    if (!res.data.access_token) {
      console.error("응답에 access_token이 없습니다:", res.data);
      throw new Error("네이버 응답에 access_token이 없습니다");
    }

    const accessToken = res.data.access_token;
    console.log("받은 access_token:", accessToken);

    return accessToken;
  } catch (error) {
    console.error("네이버 토큰 요청 실패:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const getMemberWithAccessToken = async (accessToken) => {
  const res = await axios.get(
    `${API_CONFIG.BASE_URL}/member/naver?accessToken=${accessToken}`
  );

  return res.data;
};
