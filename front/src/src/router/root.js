import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense } from "react";
import MainPage from "../pages/main/MainPage";
import LoginPage from "../pages/member/LoginPage";
import RegisterPage from "../pages/member/RegisterPage";
import KakaoCallbackPage from "../pages/member/KakaoCallbackPage";
import LoadingSpinner from "../components/LoadingSpinner";

const root = createBrowserRouter([
  {
    index: true, // 진입 시
    element: <Navigate to="/main" replace />,
  },
  {
    path: "main",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <MainPage />
      </Suspense>
    ),
  },
  {
    path: "member/login",
    element: <LoginPage />,
  },
  {
    path: "member/register",
    element: <RegisterPage />,
  },
  {
    path: "member/kakao",
    element: <KakaoCallbackPage />,
  },
]);

export default root;
