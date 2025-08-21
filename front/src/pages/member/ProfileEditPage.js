import React from "react";
import ProfileEditComponent from "../../components/member/ProfileEditComponent";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProfileEditPage() {
  const { isLoggedIn, isLoading } = useAuth();

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!isLoggedIn) {
    return <Navigate to="/member/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">회원 정보 수정</h1>
          <p className="text-gray-600 mt-2">회원 정보를 수정할 수 있습니다.</p>
        </div>

        <ProfileEditComponent />
      </div>
    </div>
  );
}
