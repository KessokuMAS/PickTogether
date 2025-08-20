// src/api/memberApi.js
import axios from "axios";
import { setCookie, getCookie, removeCookie } from "../utils/cookieUtil";

// API 기본 주소
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// 요청 인터셉터 - 쿠키 토큰 → Authorization
apiClient.interceptors.request.use(
  (config) => {
    const memberCookie = getCookie("member");
    if (memberCookie) {
      const data =
        typeof memberCookie === "string"
          ? JSON.parse(memberCookie)
          : memberCookie;
      if (data?.accessToken) {
        config.headers.Authorization = `Bearer ${data.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 인증 만료/거부 처리
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    if (status === 401) {
      removeCookie("member");
      window.location.href = "/member/login";
    }
    return Promise.reject(error);
  }
);

// -----------------------------
// Auth / Member
// -----------------------------
const login = async (credentials) => {
  const res = await apiClient.post("/member/login", credentials);
  if (res.data?.accessToken) {
    setCookie(
      "member",
      {
        accessToken: res.data.accessToken,
        member: res.data.member,
      },
      1
    );
  }
  return res.data;
};

const register = async (userData) => {
  const res = await apiClient.post("/member/register", userData);
  return res.data;
};

export const getMyPageInfo = async () => {
  const res = await apiClient.get("/member/mypage");
  return res.data;
};

export const logout = async () => {
  try {
    const res = await apiClient.post("/member/logout");
    return res.data;
  } catch (error) {
    console.error("로그아웃 API 호출 실패:", error);
    // API 호출 실패해도 로컬 로그아웃은 진행
    return { message: "로그아웃되었습니다." };
  }
};

// -----------------------------
// Member Locations (로컬 DB)
// -----------------------------
export async function createMemberLocation(payload) {
  // payload: { name, lat, lng, address, roadAddress, kakaoPlaceId }
  const { data } = await apiClient.post("/member/locations", payload);
  return data;
}

export async function listMemberLocations() {
  const { data } = await apiClient.get("/member/locations");
  return data;
}

// 필요 시 업데이트/삭제도 준비
export async function updateMemberLocation(id, payload) {
  const { data } = await apiClient.put(`/member/locations/${id}`, payload);
  return data;
}

export async function deleteMemberLocation(id) {
  const { data } = await apiClient.delete(`/member/locations/${id}`);
  return data;
}

// 객체 export + 기본 export
export const memberApi = {
  login,
  register,
  getMyPageInfo,
  createMemberLocation,
  listMemberLocations,
  updateMemberLocation,
  deleteMemberLocation,
};

export const isAuthenticated = () => {
  const cookie = getCookie("member");
  const data = typeof cookie === "string" ? JSON.parse(cookie) : cookie;
  return !!(data && data.accessToken);
};

export default memberApi;
