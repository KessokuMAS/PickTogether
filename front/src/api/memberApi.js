import axios from "axios";
import { setCookie, getCookie, removeCookie } from "../utils/cookieUtil";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터 - 쿠키에서 토큰 가져오기
apiClient.interceptors.request.use(
  (config) => {
    const memberCookie = getCookie("member");
    if (memberCookie && memberCookie.accessToken) {
      config.headers.Authorization = `Bearer ${memberCookie.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      removeCookie("member");
      window.location.href = "/member/login";
    }
    return Promise.reject(error);
  }
);

export const memberApi = {
  // 로그인
  login: async (credentials) => {
    const response = await apiClient.post("/member/login", credentials);
    if (response.data.accessToken) {
      // 쿠키에 저장 (1일 유효)
      setCookie(
        "member",
        {
          accessToken: response.data.accessToken,
          member: response.data.member,
        },
        1
      );
    }
    return response.data;
  },

  // 회원가입
  register: async (userData) => {
    const response = await apiClient.post("/member/register", userData);
    return response.data;
  },
};

// 인증 상태 확인 (쿠키 기반)
export const isAuthenticated = () => {
  const memberCookie = getCookie("member");
  return !!(memberCookie && memberCookie.accessToken);
};

export default memberApi;
