import React, { createContext, useContext, useState, useEffect } from "react";
import { setCookie, getCookie, removeCookie } from "../utils/cookieUtil";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 페이지 로드 시 로그인 상태 확인
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const memberCookie = getCookie("member");

    if (memberCookie && memberCookie.accessToken) {
      try {
        setIsLoggedIn(true);
        setUserInfo(memberCookie.member);
      } catch (error) {
        console.error("사용자 정보 파싱 오류:", error);
        logout();
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
    setIsLoading(false);
  };

  const login = (token, member) => {
    // 쿠키에 저장 (1일 유효)
    setCookie(
      "member",
      {
        accessToken: token,
        member: member,
      },
      1
    );

    setIsLoggedIn(true);
    setUserInfo(member);
  };

  const logout = () => {
    removeCookie("member");
    localStorage.removeItem("kakaoAccessToken"); // 카카오 토큰도 제거
    setIsLoggedIn(false);
    setUserInfo(null);
  };

  const value = {
    isLoggedIn,
    userInfo,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
