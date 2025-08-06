import axios from "axios";
import { KAKAO_CONFIG, API_CONFIG } from "../config/constants";

export const getKakaoLoginLink = () => {
  const kakaoURL = `${KAKAO_CONFIG.AUTH_URL}?client_id=${
    KAKAO_CONFIG.REST_API_KEY
  }&redirect_uri=${encodeURIComponent(
    KAKAO_CONFIG.REDIRECT_URI
  )}&response_type=code`;

  return kakaoURL;
};

export const getAccessToken = async (authCode) => {
  const header = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("client_id", KAKAO_CONFIG.REST_API_KEY);
  params.append("redirect_uri", KAKAO_CONFIG.REDIRECT_URI);
  params.append("code", authCode);

  try {
    console.log("카카오 토큰 요청 파라미터:", {
      grant_type: "authorization_code",
      client_id: KAKAO_CONFIG.REST_API_KEY,
      redirect_uri: KAKAO_CONFIG.REDIRECT_URI,
      code: authCode,
    });

    const res = await axios.post(KAKAO_CONFIG.TOKEN_URL, params, header);

    console.log("카카오 토큰 응답:", res.data);

    if (!res.data.access_token) {
      console.error("응답에 access_token이 없습니다:", res.data);
      throw new Error("카카오 응답에 access_token이 없습니다");
    }

    const accessToken = res.data.access_token;
    console.log("받은 access_token:", accessToken);

    return accessToken;
  } catch (error) {
    console.error("카카오 토큰 요청 실패:", {
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
    `${API_CONFIG.BASE_URL}/member/kakao?accessToken=${accessToken}`
  );

  return res.data;
};
