import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import LocationPage from "../pages/location/LocationPage";

// Lazy imports for all pages
const MainPage = lazy(() => import("../pages/main/MainPage"));
const LoginPage = lazy(() => import("../pages/member/LoginPage"));
const RegisterPage = lazy(() => import("../pages/member/RegisterPage"));
const BoardPage = lazy(() => import("../pages/board/BoardPage"));
const KakaoCallbackPage = lazy(() =>
  import("../pages/member/KakaoCallbackPage")
);
const NaverCallbackPage = lazy(() =>
  import("../pages/member/NaverCallbackPage")
);
const GoogleCallbackPage = lazy(() =>
  import("../pages/member/GoogleCallbackPage")
);

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
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "member/register",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: "member/kakao",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <KakaoCallbackPage />
      </Suspense>
    ),
  },
  {
    path: "member/naver",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <NaverCallbackPage />
      </Suspense>
    ),
  },
  {
    path: "member/google",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <GoogleCallbackPage />
      </Suspense>
    ),
  },
  {
    path: "/location",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <LocationPage />
      </Suspense>
    ),
  },
]);

export default root;
