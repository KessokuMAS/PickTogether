// 키값 설정

// API 설정
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api",
};

// 카카오 로그인 설정
export const KAKAO_CONFIG = {
  REST_API_KEY: process.env.REACT_APP_KAKAO_REST_API_KEY,
  REDIRECT_URI: process.env.REACT_APP_KAKAO_REDIRECT_URI,
  AUTH_URL: "https://kauth.kakao.com/oauth/authorize",
  TOKEN_URL: "https://kauth.kakao.com/oauth/token",
  USER_INFO_URL: "https://kapi.kakao.com/v2/user/me",
};

// 구글 로그인 설정
export const GOOGLE_CONFIG = {
  CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
  REDIRECT_URI: process.env.REACT_APP_GOOGLE_REDIRECT_URI,
  AUTH_URL: "https://accounts.google.com/o/oauth2/v2/auth",
  TOKEN_URL: "https://oauth2.googleapis.com/token",
  USER_INFO_URL: "https://www.googleapis.com/oauth2/v2/userinfo",
};

// 네이버 로그인 설정
export const NAVER_CONFIG = {
  CLIENT_ID: process.env.REACT_APP_NAVER_CLIENT_ID,
  CLIENT_SECRET: process.env.REACT_APP_NAVER_CLIENT_SECRET,
  REDIRECT_URI: process.env.REACT_APP_NAVER_REDIRECT_URI,
  AUTH_URL: "https://nid.naver.com/oauth2.0/authorize",
  TOKEN_URL: "https://nid.naver.com/oauth2.0/token",
  USER_INFO_URL: "https://openapi.naver.com/v1/nid/me",
};
