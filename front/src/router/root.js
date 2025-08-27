import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingSpinner from "../components/member/LoadingSpinner";
import ScrollToTop from "../components/common/ScrollToTop";
import LocationPage from "../pages/location/LocationPage";
import MemberLayout from "../layouts/MemberLayout";
import SearchResultPage from "../pages/search/SearchResultPage";
import ImageSearchResultPage from "../pages/search/ImageSearchResultPage";
import Test from "../components/test/Test";

// Lazy imports for all pages
const MainPage = lazy(() => import("../pages/main/MainPage"));
const LoginPage = lazy(() => import("../pages/member/LoginPage"));
const RegisterPage = lazy(() => import("../pages/member/RegisterPage"));
const BoardPage = lazy(() => import("../pages/board/BoardPage"));
const MyPage = lazy(() => import("../pages/member/MyPage"));
const CommunityPage = lazy(() => import("../pages/community/CommunityPage"));
const CommunityPostDetailPage = lazy(() =>
  import("../pages/community/CommunityPostDetailPage")
);
const WritePostPage = lazy(() => import("../pages/community/WritePostPage"));
const PostDetailPage = lazy(() => import("../pages/community/PostDetailPage"));

const KakaoCallbackPage = lazy(() =>
  import("../pages/member/KakaoCallbackPage")
);
const NaverCallbackPage = lazy(() =>
  import("../pages/member/NaverCallbackPage")
);
const GoogleCallbackPage = lazy(() =>
  import("../pages/member/GoogleCallbackPage")
);
const RestaurantDetailPage = lazy(() =>
  import("../pages/restaurant/RestaurantDetailPage")
);
const PaymentPage = lazy(() => import("../pages/payment/PaymentPage"));
const QRCodePage = lazy(() => import("../pages/member/QRCodePage"));
const ForOneIndexPage = lazy(() => import("../pages/forone/ForOneIndexPage"));
const TrendingFundingPage = lazy(() =>
  import("../pages/trending/TrendingFundingPage")
);
const LocalSpecialtyPage = lazy(() =>
  import("../pages/localSpecialty/LocalSpecialtyPage")
);
const LocalSpecialtyDetailPage = lazy(() =>
  import("../pages/localSpecialty/LocalSpecialtyDetailPage")
);
const WishlistPage = lazy(() => import("../pages/wishlist/WishlistPage"));
const AiRecommendPage = lazy(() => import("../pages/ai/AiRecommendPage"));

// 마이페이지 관련 페이지들
const BusinessRequestsPage = lazy(() =>
  import("../pages/business/BusinessRequestPage")
);
const AdminSettingsPage = lazy(() =>
  import("../pages/admin/AdminSettingsPage")
);
const BusinessRequestManagementPage = lazy(() =>
  import("../pages/admin/BusinessRequestManagementPage")
);
const BusinessLocationPage = lazy(() =>
  import("../pages/business/BusinessLocationPage")
);
const ProfileEditPage = lazy(() => import("../pages/member/ProfileEditPage"));
const DeleteAccountPage = lazy(() =>
  import("../pages/member/DeleteAccountPage")
);

const root = createBrowserRouter([
  {
    index: true, // 진입 시
    element: <Navigate to="/main" replace />,
  },
  {
    path: "main",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <MainPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "member",
    element: <MemberLayout />, // 현재는 빈 껍데기
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "kakao", element: <KakaoCallbackPage /> },
      { path: "naver", element: <NaverCallbackPage /> },
      { path: "google", element: <GoogleCallbackPage /> },
      { path: "delete-account", element: <DeleteAccountPage /> },
    ],
  },
  {
    path: "/location",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <LocationPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/mypage",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <MyPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/restaurant/:id",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <RestaurantDetailPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/payment",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <PaymentPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/qrcode/:fundingId",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <QRCodePage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/community",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <CommunityPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/community/post/:postId",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <CommunityPostDetailPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/community/write",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <WritePostPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/for-one",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <ForOneIndexPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/trending",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <TrendingFundingPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/local-specialty",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <LocalSpecialtyPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/local-specialty/:id",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <LocalSpecialtyDetailPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/ai-recommend",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <AiRecommendPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/wishlist",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <WishlistPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/local-specialty/:id/purchase",
    lazy: () => import("../pages/localSpecialty/LocalSpecialtyPurchasePage"),
  },
  {
    path: "/mypage/business/requests",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <BusinessRequestsPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/mypage/admin/settings",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <AdminSettingsPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/mypage/edit",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <ProfileEditPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/mypage/admin/business-requests",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <BusinessRequestManagementPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/mypage/delete-account",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <DeleteAccountPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/search",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <SearchResultPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/business-location",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <BusinessLocationPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/image-search",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <ImageSearchResultPage />
        </Suspense>
      </>
    ),
  },
  {
    path: "/test",
    element: (
      <>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <Test />
        </Suspense>
      </>
    ),
  },
]);

export default root;
