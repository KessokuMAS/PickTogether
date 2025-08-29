// src/components/member/MyPageComponent.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getMyPageInfo } from "../../api/memberApi";
import { getMemberFundings } from "../../api/fundingApi";
import { fundingSpecialtyApi } from "../../api/fundingSpecialtyApi";
import { getCookie, removeCookie } from "../../utils/cookieUtil";
import { useNavigate } from "react-router-dom";
import MyPageHeader from "../../layouts/MyPageHeader";
import {
  FiMaximize2,
  FiDownload,
  FiSquare,
  FiBell,
  FiCheck,
  FiTrash2,
  FiX,
  FiUser,
  FiMail,
  FiDollarSign,
  FiCalendar,
  FiMapPin,
  FiShoppingCart,
  FiHeart,
  FiTrendingUp,
  FiMessageSquare,
  FiSettings,
  FiLogOut,
  FiClock,
  FiPackage,
  FiEye,
} from "react-icons/fi";
import QRCode from "qrcode";
import {
  getNotificationsByMember,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
} from "../../api/notificationApi";
import { logout } from "../../api/memberApi";
import { useAuth } from "../../context/AuthContext";
import { GiArtificialIntelligence } from "react-icons/gi";
import { IoRestaurantOutline, IoGiftOutline } from "react-icons/io5";

export default function MyPageComponent() {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const [member, setMember] = useState(null);
  const [fundings, setFundings] = useState([]);
  const [specialtyOrders, setSpecialtyOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("funding"); // "funding" | "specialty"
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendarModal, setShowCalendarModal] = useState(false); // 달력 모달 상태
  const [showFundingDetailModal, setShowFundingDetailModal] = useState(false); // 펀딩 상세 모달 상태
  const [selectedFunding, setSelectedFunding] = useState(null); // 선택된 펀딩 정보

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);
        const data = await getMyPageInfo();
        setMember(data);
      } catch (error) {
        console.error("회원 정보 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (member?.email) {
      loadFundings();
      loadSpecialtyOrders();
      loadNotifications();
    }
  }, [member?.email]);

  const loadFundings = async () => {
    const memberCookie = getCookie("member");
    if (memberCookie?.member?.email) {
      try {
        const fundingData = await getMemberFundings(memberCookie.member.email);
        setFundings(fundingData);
      } catch (fundingError) {
        console.error("결제 내역 로드 실패:", fundingError);
        // 펀딩 로드 실패는 전체 마이페이지에 영향을 주지 않도록 함
      }
    }
  };

  const loadSpecialtyOrders = async () => {
    const memberCookie = getCookie("member");
    if (memberCookie?.member?.email) {
      try {
        console.log("특산품 주문 내역 요청 시작:", memberCookie.member.email);
        const specialtyData = await fundingSpecialtyApi.getMemberOrders(
          memberCookie.member.email
        );
        console.log("특산품 주문 내역 응답:", specialtyData);
        setSpecialtyOrders(specialtyData);
      } catch (specialtyError) {
        console.error("특산품 구매 내역 로드 실패:", specialtyError);
      }
    } else {
      console.log("memberCookie 정보 없음:", memberCookie);
    }
  };

  const loadNotifications = async () => {
    const memberCookie = getCookie("member");
    if (memberCookie?.member?.email) {
      try {
        const [notificationData, unreadCountData] = await Promise.all([
          getNotificationsByMember(memberCookie.member.email),
          getUnreadNotificationCount(memberCookie.member.email),
        ]);
        setNotifications(notificationData.content || []);
        setUnreadCount(unreadCountData || 0);
      } catch (notificationError) {
        console.error("알림 데이터 로드 실패:", notificationError);
        // 알림 로드 실패는 전체 마이페이지에 영향을 주지 않도록 함
      }
    }
  };

  // 알림 읽음 처리
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      const memberCookie = getCookie("member");
      if (memberCookie?.member?.email) {
        await markAllNotificationsAsRead(memberCookie.member.email);
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("모든 알림 읽음 처리 실패:", error);
    }
  };

  // 읽은 알림 전체 삭제
  const handleDeleteAllRead = async () => {
    try {
      const memberCookie = getCookie("member");
      if (memberCookie?.member?.email) {
        await deleteAllReadNotifications(memberCookie.member.email);
        setNotifications((prev) => prev.filter((notif) => !notif.isRead));
      }
    } catch (error) {
      console.error("읽은 알림 전체 삭제 실패:", error);
    }
  };

  // 개별 알림 삭제
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
      // 읽지 않은 알림이었다면 카운트도 감소
      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("알림 삭제 실패:", error);
    }
  };

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      // 백엔드 로그아웃 API 호출
      await logout();

      // AuthContext를 통한 로그아웃 상태 업데이트
      authLogout();

      // 메인 페이지로 리다이렉트
      navigate("/main");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      // 에러가 발생해도 로컬 로그아웃은 진행
      authLogout();
      navigate("/main");
    }
  };

  // 회원 역할 표시 텍스트 변환
  const getRoleDisplayText = useMemo(() => {
    if (!member?.roleNames || member.roleNames.length === 0) {
      return "일반 사용자";
    }

    const roleMap = {
      USER: "일반 사용자",
      BUSINESS_OWNER: "자영업자",
      ADMIN: "관리자",
    };

    const displayRoles = member.roleNames.map((role) => roleMap[role] || role);
    return displayRoles.join(", ");
  }, [member?.roleNames]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">회원 정보를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate("/member/login")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = member?.roleNames?.includes("ADMIN");
  const isBusinessOwner = member?.roleNames?.includes("BUSINESS_OWNER");

  return (
    <>
      {/* 고정 헤더 */}
      <MyPageHeader
        isAdmin={isAdmin}
        isBusinessOwner={isBusinessOwner}
        onLogout={handleLogout}
      />

      {/* 상단바 높이만큼 패딩 주기 */}
      <div className="pt-[120px] min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽 컬럼 - 계정 정보 및 통계 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 계정 정보 카드 */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FiUser className="text-emerald-600" size={20} />
                  계정 정보
                </h3>
                <div className="space-y-3">
                  <Row label="이메일" value={member.email} />
                  <Row label="닉네임" value={member.nickname || "미설정"} />
                  <Row label="회원 역할" value={getRoleDisplayText} />
                </div>

                {/* 기능 버튼들 */}
                <div className="mt-6 space-y-3 flex flex-col items-center">
                  <a
                    href="/mypage/edit"
                    className="w-3/4 px-8 py-4 bg-white text-slate-700 rounded-lg border-2 border-slate-300 hover:bg-slate-50 transition-colors font-medium text-center block flex items-center justify-center gap-2 h-12"
                  >
                    <FiSettings size={16} />
                    회원 정보 수정
                  </a>
                  <button
                    onClick={() => navigate("/member/delete-account")}
                    className="w-3/4 px-8 py-4 bg-white text-red-600 rounded-lg border-2 border-red-500 hover:bg-red-50 transition-colors font-medium text-center flex items-center justify-center gap-2 h-12"
                  >
                    <FiTrash2 size={16} className="text-red-500" />
                    회원 탈퇴
                  </button>
                </div>
              </div>

              {/* 통계 카드 */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FiTrendingUp className="text-emerald-600" size={20} />
                  활동 통계
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center gap-2">
                      <FiDollarSign className="text-blue-500" size={16} />
                      포인트
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {member.points ?? 0}P
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center gap-2">
                      <FiUser className="text-purple-500" size={16} />
                      등급
                    </span>
                    <span className="text-xl font-bold text-purple-600">
                      {member.grade ?? "없음"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center gap-2">
                      <FiShoppingCart className="text-green-500" size={16} />
                      참여한 펀딩
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {fundings.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center gap-2">
                      <FiHeart className="text-pink-500" size={16} />
                      특산품 구매
                    </span>
                    <span className="text-2xl font-bold text-pink-600">
                      {specialtyOrders.length}
                    </span>
                  </div>
                  {/* 알림 통계는 소상공인만 표시 */}
                  {member?.roleNames?.includes("BUSINESS_OWNER") && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <FiBell className="text-orange-500" size={16} />
                          받은 알림
                        </span>
                        <span className="text-2xl font-bold text-orange-600">
                          {notifications.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <FiMail className="text-red-500" size={16} />
                          읽지 않은 알림
                        </span>
                        <span className="text-2xl font-bold text-red-600">
                          {unreadCount}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽 컬럼 - 수신함 및 펀딩 내역 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 수신함 카드 - 소상공인만 */}
              {member?.roleNames?.includes("BUSINESS_OWNER") && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <FiMail className="text-emerald-600" size={20} />
                      수신함
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleMarkAllAsRead}
                        className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1"
                      >
                        <FiCheck size={14} />
                        모두 읽음
                      </button>
                      <button
                        onClick={handleDeleteAllRead}
                        className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                      >
                        <FiTrash2 size={14} />
                        읽은 알림 삭제
                      </button>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiMail className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 mb-2">
                        수신된 알림이 없습니다
                      </p>
                      <p className="text-sm text-slate-400">
                        가게 요청 관련 알림을 받아보세요
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <NotificationRow
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          onDelete={handleDeleteNotification}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 펀딩 내역 카드 */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <FiShoppingCart className="text-emerald-600" size={20} />
                      펀딩 내역
                    </h3>
                    {/* 달력 버튼 추가 */}
                    <button
                      onClick={() => setShowCalendarModal(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                      title="펀딩 마감일 달력 보기"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      펀딩 현황
                    </button>
                  </div>
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab("funding")}
                      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                        activeTab === "funding"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      식당 펀딩 ({fundings.length})
                    </button>
                    <button
                      onClick={() => {
                        console.log(
                          "특산품 탭 클릭됨, 현재 데이터:",
                          specialtyOrders
                        );
                        setActiveTab("specialty");
                      }}
                      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                        activeTab === "specialty"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      특산품 펀딩 ({specialtyOrders.length})
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  {activeTab === "funding" ? (
                    // 식당 펀딩 내역
                    fundings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiShoppingCart className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 mb-2">
                          아직 참여한 펀딩이 없습니다
                        </p>
                        <p className="text-sm text-slate-400">
                          첫 번째 펀딩에 참여해보세요!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {fundings.map((funding) => (
                          <FundingRow key={funding.id} funding={funding} />
                        ))}
                      </div>
                    )
                  ) : // 지역특산품 구매 내역
                  specialtyOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiHeart className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 mb-2">
                        아직 구매한 특산품이 없습니다
                      </p>
                      <p className="text-sm text-slate-400">
                        지역특산품을 펀딩해보세요!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {specialtyOrders.map((order) => (
                        <SpecialtyOrderRow key={order.id} order={order} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 펀딩 마감일 달력 모달 */}
      {showCalendarModal && (
        <FundingCalendarModal
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          fundings={fundings}
          specialtyOrders={specialtyOrders}
          setSelectedFunding={setSelectedFunding}
          setShowFundingDetailModal={setShowFundingDetailModal}
        />
      )}

      {/* 펀딩 상세 모달 */}
      {showFundingDetailModal && selectedFunding && (
        <FundingDetailModal
          isOpen={showFundingDetailModal}
          onClose={() => setShowFundingDetailModal(false)}
          funding={selectedFunding}
        />
      )}
    </>
  );
}

// Row 컴포넌트
const Row = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
    <span className="text-slate-600 flex items-center gap-2">
      {label === "이메일" && <FiMail className="text-blue-500" size={16} />}
      {label === "닉네임" && <FiUser className="text-green-500" size={16} />}
      {label === "회원 역할" && (
        <FiSettings className="text-orange-500" size={16} />
      )}
      {label}
    </span>
    <span className="font-medium text-slate-800">{value}</span>
  </div>
);

// FundingRow 컴포넌트
function FundingRow({ funding }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [showLargeQR, setShowLargeQR] = useState(false);
  const [isUsed, setIsUsed] = useState(false); // 사용완료 상태 추가

  // QR 코드 사용 마감일 계산 함수 (펀딩 마감일 + 14일)
  const calculateQRExpiryDate = (fundingEndDate) => {
    if (!fundingEndDate) return null;

    const endDate = new Date(fundingEndDate);
    const expiryDate = new Date(endDate);
    expiryDate.setDate(endDate.getDate() + 14);

    return expiryDate;
  };

  // QR 코드 사용기한 만료 여부 확인
  const isQRExpired = (fundingEndDate) => {
    if (!fundingEndDate) return false;

    const expiryDate = calculateQRExpiryDate(fundingEndDate);
    const now = new Date();

    return now > expiryDate;
  };

  // QR 코드 사용기한 임박 여부 확인 (3일 이내)
  const isQRExpiringSoon = (fundingEndDate) => {
    if (!fundingEndDate) return false;

    const expiryDate = calculateQRExpiryDate(fundingEndDate);
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);

    return now <= expiryDate && expiryDate <= threeDaysFromNow;
  };

  // 디버깅을 위해 funding 데이터 출력
  useEffect(() => {
    console.log("=== Funding Debug Info ===");
    console.log("Funding data:", funding);
    console.log("Funding end date:", funding.fundingEndDate);
    console.log("Funding end date type:", typeof funding.fundingEndDate);
    console.log("Restaurant info:", funding.restaurant);
    console.log("Restaurant ID:", funding.restaurantId);
    console.log("All funding properties:", Object.keys(funding));
    console.log("==========================");
  }, [funding]);

  // 실시간으로 사용기한 상태 체크 (1분마다)
  useEffect(() => {
    if (!funding.fundingEndDate) return;

    const checkExpiryInterval = setInterval(() => {
      // 강제로 리렌더링을 위해 상태 업데이트
      setQrLoading((prev) => !prev);
      setQrLoading((prev) => !prev);
    }, 60000); // 1분마다

    return () => clearInterval(checkExpiryInterval);
  }, [funding.fundingEndDate]);

  // QR 코드 생성
  useEffect(() => {
    if (funding.status === "COMPLETED") {
      generateQRCode();
    }
  }, [funding]);

  // Ctrl+Q 키보드 이벤트 처리 - 특정 펀딩에만 적용
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "q") {
        // 마지막으로 클릭된 펀딩 카드 확인
        const lastClickedCard = document.querySelector(
          "[data-funding-id].last-clicked"
        );
        if (
          lastClickedCard &&
          lastClickedCard.dataset.fundingId === funding.id.toString()
        ) {
          setIsUsed(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [funding.id]);

  // 클릭 이벤트 처리
  const handleCardClick = () => {
    // 다른 모든 카드에서 last-clicked 클래스 제거
    document.querySelectorAll("[data-funding-id]").forEach((card) => {
      card.classList.remove("last-clicked");
    });
    // 현재 카드에 last-clicked 클래스 추가
    const currentCard = document.querySelector(
      `[data-funding-id="${funding.id}"]`
    );
    if (currentCard) {
      currentCard.classList.add("last-clicked");
    }
  };

  const generateQRCode = async () => {
    try {
      setQrLoading(true);
      // QR 코드에 포함할 데이터 (펀딩 ID, 레스토랑명, 결제번호 등)
      const qrData = JSON.stringify({
        fundingId: funding.id,
        restaurantName: funding.restaurantName,
        impUid: funding.impUid,
        totalAmount: funding.totalAmount,
        createdAt: funding.createdAt,
      });

      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: "#1f2937",
          light: "#ffffff",
        },
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error("QR 코드 생성 실패:", error);
    } finally {
      setQrLoading(false);
    }
  };

  const downloadQRCode = async () => {
    try {
      if (qrCodeUrl) {
        const link = document.createElement("a");
        link.download = `QR_${funding.restaurantName}_${funding.id}.png`;
        link.href = qrCodeUrl;
        link.click();
      }
    } catch (error) {
      console.error("QR 코드 다운로드 실패:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "kakaopay":
        return "카카오페이";
      case "tosspay":
        return "토스페이";
      case "card":
        return "일반결제";
      default:
        return method;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "COMPLETED":
        return "완료";
      case "CANCELLED":
        return "취소";
      case "REFUNDED":
        return "환불";
      default:
        return status;
    }
  };

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer"
      data-funding-id={funding.id}
      onClick={handleCardClick}
    >
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-slate-900">
                {funding.restaurantName}
              </h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  funding.status === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : funding.status === "CANCELLED"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {getStatusText(funding.status)}
              </span>
            </div>

            <div className="text-sm text-slate-600">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  결제수단: {getPaymentMethodText(funding.paymentMethod)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  참여일: {formatDate(funding.createdAt)}
                </span>
                {funding.fundingEndDate ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    마감일: {formatDate(funding.fundingEndDate)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    마감일: 정보 없음
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-pink-600">
              {funding.totalAmount?.toLocaleString()}원
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {funding.agreeSMS && "SMS "}
              {funding.agreeEmail && "이메일 "}
              {(funding.agreeSMS || funding.agreeEmail) && "수신동의"}
            </div>
          </div>
        </div>

        {/* 메뉴 정보 */}
        {funding.menuInfo && (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <div className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-4 h-4 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
              </span>
              선택한 메뉴
            </div>
            {(() => {
              try {
                const menus = JSON.parse(funding.menuInfo);
                return (
                  <div className="space-y-2">
                    {menus.map((menu, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 px-3 bg-white rounded border border-slate-100"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-slate-800">
                            {menu.name}
                          </span>
                          <span className="text-slate-500 ml-2">
                            × {menu.quantity}개
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">
                            {(menu.price * menu.quantity).toLocaleString()}원
                          </div>
                          <div className="text-xs text-slate-500">
                            {menu.price.toLocaleString()}원/개
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              } catch (e) {
                return (
                  <div className="text-slate-500 text-sm">
                    {funding.menuInfo}
                  </div>
                );
              }
            })()}
          </div>
        )}

        {/* QR 코드 영역 - 결제 완료된 경우에만 표시 */}
        {funding.status === "COMPLETED" &&
          funding.fundingEndDate &&
          new Date() >= new Date(funding.fundingEndDate) && (
            <div
              className={`rounded-lg p-4 border ${
                isUsed
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"
                  : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`font-semibold flex items-center gap-2 ${
                    isUsed ? "text-green-800" : "text-blue-800"
                  }`}
                >
                  <FiCheck className="w-5 h-5 text-green-600" />
                  {isUsed ? "사용완료된 QR 코드" : "사용 QR 코드"}
                </div>
                {qrCodeUrl && (
                  <button
                    onClick={downloadQRCode}
                    disabled={
                      funding.fundingEndDate &&
                      isQRExpired(funding.fundingEndDate)
                    }
                    className={`flex items-center gap-2 px-3 py-1 text-xs rounded-lg transition-colors ${
                      funding.fundingEndDate &&
                      isQRExpired(funding.fundingEndDate)
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    title={
                      funding.fundingEndDate &&
                      isQRExpired(funding.fundingEndDate)
                        ? "사용기한이 만료되어 다운로드할 수 없습니다"
                        : "QR 코드 다운로드"
                    }
                  >
                    <FiDownload className="w-4 h-4" />
                    다운로드
                  </button>
                )}
              </div>

              {/* 펀딩 마감일 이전 안내 메시지 */}
              {funding.fundingEndDate &&
                new Date() < new Date(funding.fundingEndDate) && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-blue-800">
                        펀딩 진행 중
                      </span>
                    </div>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div className="flex justify-between">
                        <span>펀딩 마감일:</span>
                        <span className="font-medium">
                          {formatDate(funding.fundingEndDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>남은 일수:</span>
                        <span className="font-medium">
                          {Math.ceil(
                            (new Date(funding.fundingEndDate) - new Date()) /
                              (1000 * 60 * 60 * 24)
                          )}
                          일
                        </span>
                      </div>
                      <div className="mt-2 p-2 bg-blue-100 rounded text-blue-800 font-medium">
                        📅 펀딩이 마감된 후에 QR 코드를 사용할 수 있습니다.
                      </div>
                    </div>
                  </div>
                )}

              {/* QR 코드 사용기한 정보 추가 */}
              {funding.fundingEndDate && (
                <div
                  className={`mb-3 p-3 border rounded-lg ${
                    isQRExpired(funding.fundingEndDate)
                      ? "bg-red-50 border-red-200"
                      : isQRExpiringSoon(funding.fundingEndDate)
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-orange-50 border-orange-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className={`w-4 h-4 ${
                        isQRExpired(funding.fundingEndDate)
                          ? "text-red-600"
                          : isQRExpiringSoon(funding.fundingEndDate)
                          ? "text-yellow-600"
                          : "text-orange-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span
                      className={`text-sm font-semibold ${
                        isQRExpired(funding.fundingEndDate)
                          ? "text-red-800"
                          : isQRExpiringSoon(funding.fundingEndDate)
                          ? "text-yellow-800"
                          : "text-orange-800"
                      }`}
                    >
                      {isQRExpired(funding.fundingEndDate)
                        ? "QR 코드 사용기한 만료"
                        : isQRExpiringSoon(funding.fundingEndDate)
                        ? "QR 코드 사용기한 임박"
                        : "QR 코드 사용기한"}
                    </span>
                  </div>
                  <div
                    className={`text-xs space-y-1 ${
                      isQRExpired(funding.fundingEndDate)
                        ? "text-red-700"
                        : isQRExpiringSoon(funding.fundingEndDate)
                        ? "text-yellow-700"
                        : "text-orange-700"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>QR 사용 가능 기간:</span>
                      <span className="font-medium">
                        {formatDate(funding.fundingEndDate)} ~{" "}
                        {formatDate(
                          calculateQRExpiryDate(funding.fundingEndDate)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>사용 가능 일수:</span>
                      <span className="font-medium">14일</span>
                    </div>
                    {/* 상태별 메시지 */}
                    {isQRExpired(funding.fundingEndDate) && (
                      <div className="mt-2 p-2 bg-red-100 rounded text-red-800 font-medium">
                        ⚠️ 사용기한이 만료되었습니다. QR 코드를 사용할 수
                        없습니다.
                      </div>
                    )}
                    {isQRExpiringSoon(funding.fundingEndDate) && (
                      <div className="mt-2 p-2 bg-yellow-100 rounded text-yellow-800 font-medium">
                        ⚠️ 사용기한이 곧 만료됩니다. 빠른 시일 내에
                        사용해주세요.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {qrLoading ? (
                    <div className="w-32 h-32 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : qrCodeUrl ? (
                    <div className="relative">
                      <div
                        onClick={() =>
                          !(
                            funding.fundingEndDate &&
                            isQRExpired(funding.fundingEndDate)
                          ) && setShowLargeQR(true)
                        }
                        className={`transition-transform ${
                          funding.fundingEndDate &&
                          isQRExpired(funding.fundingEndDate)
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer hover:scale-105"
                        }`}
                      >
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className={`w-32 h-32 rounded-lg border-2 ${
                            funding.fundingEndDate &&
                            isQRExpired(funding.fundingEndDate)
                              ? "border-gray-300"
                              : "border-blue-200 hover:border-blue-400"
                          }`}
                        />
                        <div
                          className={`text-center mt-2 text-xs ${
                            funding.fundingEndDate &&
                            isQRExpired(funding.fundingEndDate)
                              ? "text-gray-500"
                              : "text-blue-600"
                          }`}
                        >
                          {funding.fundingEndDate &&
                          isQRExpired(funding.fundingEndDate)
                            ? "사용기한 만료"
                            : "클릭하여 확대보기"}
                        </div>
                      </div>
                      {/* 사용완료 표시 */}
                      {isUsed && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                          사용완료
                        </div>
                      )}
                      {/* 사용기한 만료 표시 */}
                      {funding.fundingEndDate &&
                        isQRExpired(funding.fundingEndDate) && (
                          <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            만료
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-500">QR 생성 중</span>
                    </div>
                  )}
                </div>

                <div
                  className={`flex-1 text-sm ${
                    isUsed ? "text-green-700" : "text-blue-700"
                  }`}
                >
                  <p className="font-medium mb-1">
                    {isUsed
                      ? "QR 코드가 사용완료되었습니다"
                      : "레스토랑에서 이 QR 코드를 스캔하세요"}
                  </p>
                  <p className="text-xs opacity-80">
                    • 펀딩 ID: {funding.id}
                    <br />• 레스토랑: {funding.restaurantName}
                    <br />• 결제 금액: {funding.totalAmount?.toLocaleString()}원
                    {funding.fundingEndDate && (
                      <>
                        <br />• QR 사용 마감일:{" "}
                        {formatDate(
                          calculateQRExpiryDate(funding.fundingEndDate)
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* 결제 정보 요약 */}
        <div className="border-t border-slate-200 pt-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">결제 상태</span>
            <span
              className={`font-medium ${
                funding.status === "COMPLETED"
                  ? "text-green-600"
                  : funding.status === "CANCELLED"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {getStatusText(funding.status)}
            </span>
          </div>
          {funding.impUid && (
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-slate-600">결제 번호</span>
              <span className="text-slate-500 font-mono text-xs">
                {funding.impUid}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* QR 코드 확대 보기 모달 */}
      {showLargeQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                QR 코드 확대보기
              </h3>
              <button
                onClick={() => setShowLargeQR(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* 사용기한 정보 추가 */}
            {funding.fundingEndDate && (
              <div
                className={`mb-4 p-3 border rounded-lg ${
                  isQRExpired(funding.fundingEndDate)
                    ? "bg-red-50 border-red-200"
                    : isQRExpiringSoon(funding.fundingEndDate)
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className={`w-4 h-4 ${
                      isQRExpired(funding.fundingEndDate)
                        ? "text-red-600"
                        : isQRExpiringSoon(funding.fundingEndDate)
                        ? "text-yellow-600"
                        : "text-orange-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span
                    className={`text-sm font-semibold ${
                      isQRExpired(funding.fundingEndDate)
                        ? "text-red-800"
                        : isQRExpiringSoon(funding.fundingEndDate)
                        ? "text-yellow-800"
                        : "text-orange-800"
                    }`}
                  >
                    {isQRExpired(funding.fundingEndDate)
                      ? "QR 코드 사용기한 만료"
                      : isQRExpiringSoon(funding.fundingEndDate)
                      ? "QR 코드 사용기한 임박"
                      : "QR 코드 사용기한"}
                  </span>
                </div>
                <div
                  className={`text-xs space-y-1 ${
                    isQRExpired(funding.fundingEndDate)
                      ? "text-red-700"
                      : isQRExpiringSoon(funding.fundingEndDate)
                      ? "text-yellow-700"
                      : "text-orange-700"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>QR 사용 가능 기간:</span>
                    <span className="font-medium">
                      {formatDate(funding.fundingEndDate)} ~{" "}
                      {formatDate(
                        calculateQRExpiryDate(funding.fundingEndDate)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>사용 가능 일수:</span>
                    <span className="font-medium">14일</span>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={qrCodeUrl}
                  alt="QR Code Large"
                  className="w-80 h-80 mx-auto rounded-lg border-2 border-blue-200"
                />
                {/* 확대보기에서도 사용완료 표시 */}
                {isUsed && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    사용완료
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium mb-2">{funding.restaurantName}</p>
                <p>펀딩 ID: {funding.id}</p>
                <p>결제 금액: {funding.totalAmount?.toLocaleString()}원</p>
                {funding.fundingEndDate && (
                  <p>
                    QR 사용 마감일:{" "}
                    {formatDate(calculateQRExpiryDate(funding.fundingEndDate))}
                  </p>
                )}
              </div>

              <div className="mt-6 flex gap-3 justify-center">
                <button
                  onClick={downloadQRCode}
                  disabled={
                    funding.fundingEndDate &&
                    isQRExpired(funding.fundingEndDate)
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    funding.fundingEndDate &&
                    isQRExpired(funding.fundingEndDate)
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  title={
                    funding.fundingEndDate &&
                    isQRExpired(funding.fundingEndDate)
                      ? "사용기한이 만료되어 다운로드할 수 없습니다"
                      : "QR 코드 다운로드"
                  }
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {funding.fundingEndDate && isQRExpired(funding.fundingEndDate)
                    ? "만료됨"
                    : "다운로드"}
                </button>
                <button
                  onClick={() => setShowLargeQR(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 특산품 주문 행 컴포넌트
function SpecialtyOrderRow({ order }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "kakaopay":
        return "카카오페이";
      case "tosspay":
        return "토스페이";
      case "card":
        return "일반결제";
      default:
        return method;
    }
  };

  const getOrderStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "결제 대기";
      case "PAID":
        return "결제 완료";
      case "SHIPPED":
        return "배송 중";
      case "DELIVERED":
        return "배송 완료";
      case "CANCELLED":
        return "주문 취소";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-yellow-100 text-yellow-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-all">
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-slate-900">
                {order.specialtyName}
              </h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  order.orderStatus
                )}`}
              >
                {getOrderStatusText(order.orderStatus)}
              </span>
            </div>

            <div className="text-sm text-slate-600">
              <div className="flex items-center gap-6 mb-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  결제수단: {getPaymentMethodText(order.paymentMethod)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  주문일: {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  수량: {order.quantity}개
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  단가: {order.unitPrice?.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-pink-600">
              {order.totalAmount?.toLocaleString()}원
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {order.agreeSms && "SMS "}
              {order.agreeEmail && "이메일 "}
              {(order.agreeSms || order.agreeEmail) && "수신동의"}
            </div>
          </div>
        </div>

        {/* 배송 정보 */}
        {order.orderStatus !== "CANCELLED" && order.address && (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <div className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              </span>
              배송 정보
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">받는 분:</span>
                <span className="text-slate-900 font-medium">
                  {order.buyerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">연락처:</span>
                <span className="text-slate-900 font-medium">
                  {order.buyerPhone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">우편번호:</span>
                <span className="text-slate-900 font-mono">
                  {order.zipCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">주소:</span>
                <span className="text-slate-900">{order.address}</span>
              </div>
              {order.detailAddress && (
                <div className="flex justify-between">
                  <span className="text-slate-600">상세주소:</span>
                  <span className="text-slate-900">{order.detailAddress}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 지역 정보 */}
        {(order.sidoNm || order.sigunguNm) && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <span className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </span>
              원산지 정보
            </div>
            <div className="text-sm text-green-700">
              {order.sidoNm} {order.sigunguNm}
            </div>
          </div>
        )}

        {/* 주문 정보 요약 */}
        <div className="border-t border-slate-200 pt-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">주문 상태</span>
            <span
              className={`font-medium ${
                order.orderStatus === "DELIVERED"
                  ? "text-green-600"
                  : order.orderStatus === "CANCELLED"
                  ? "text-red-600"
                  : order.orderStatus === "SHIPPED"
                  ? "text-yellow-600"
                  : "text-blue-600"
              }`}
            >
              {getOrderStatusText(order.orderStatus)}
            </span>
          </div>
          {order.merchantUid && (
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-slate-600">주문 번호</span>
              <span className="text-slate-500 font-mono text-xs">
                {order.merchantUid}
              </span>
            </div>
          )}
          {order.impUid && (
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-slate-600">결제 번호</span>
              <span className="text-slate-500 font-mono text-xs">
                {order.impUid}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 알림 행 컴포넌트
function NotificationRow({ notification, onMarkAsRead, onDelete }) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all hover:shadow-md ${
        notification.isRead
          ? "bg-slate-50 border-slate-200"
          : "bg-white border-blue-300 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-2 h-2 rounded-full ${
                notification.isRead ? "bg-slate-300" : "bg-blue-500"
              }`}
            ></div>
            <h4
              className={`font-medium ${
                notification.isRead ? "text-slate-600" : "text-slate-800"
              }`}
            >
              {notification.title}
            </h4>
          </div>
          <p
            className={`text-sm ${
              notification.isRead ? "text-slate-500" : "text-slate-600"
            }`}
          >
            {notification.content}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {new Date(notification.createdAt).toLocaleString("ko-KR")}
          </p>
        </div>

        <div className="flex gap-2 ml-4">
          {!notification.isRead && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="읽음 처리"
            >
              <FiCheck className="text-sm" />
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            title="삭제"
          >
            <FiTrash2 className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 펀딩 마감일 달력 모달 컴포넌트
function FundingCalendarModal({
  isOpen,
  onClose,
  fundings,
  specialtyOrders,
  setSelectedFunding,
  setShowFundingDetailModal,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!isOpen) return null;

  // 현재 월의 첫째 날과 마지막 날 계산
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  // 달력에 표시할 날짜들 생성
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

  const calendarDays = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    calendarDays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 특정 날짜의 펀딩 마감일들 가져오기
  const getFundingDeadlinesForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    const deadlines = [];

    // 식당 펀딩 마감일
    fundings.forEach((funding) => {
      if (funding.fundingEndDate && funding.fundingEndDate === dateStr) {
        deadlines.push({
          type: "restaurant",
          name: funding.restaurantName,
          amount: funding.totalAmount,
          id: funding.id,
          menuInfo: funding.menuInfo,
          paymentMethod: funding.paymentMethod,
          createdAt: funding.createdAt,
          fundingEndDate: funding.fundingEndDate, // 이 부분이 누락되었음!
        });
      }
    });

    // 특산품 펀딩 마감일
    specialtyOrders.forEach((order) => {
      if (order.fundingEndDate && order.fundingEndDate === dateStr) {
        deadlines.push({
          type: "specialty",
          name: order.specialtyName,
          amount: order.totalAmount,
          id: order.id,
          quantity: order.quantity,
          address: order.address,
          sidoNm: order.sidoNm,
          sigunguNm: order.sigunguNm,
          fundingEndDate: order.fundingEndDate, // 이 부분도 누락되었음!
        });
      }
    });

    return deadlines;
  };

  // 이전/다음 월 이동
  const goToPreviousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // 날짜가 오늘인지 확인
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 날짜가 현재 월에 속하는지 확인
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">
            펀딩 마감일 달력
          </h2>
          <div className="flex items-center gap-4">
            {/* 간단한 범례 */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                <span className="text-slate-600">식당</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                <span className="text-slate-600">특산품</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-600">사용가능</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-600">마감일</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-slate-600">사용불가</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between p-4 bg-slate-50">
          <button
            onClick={goToPreviousMonth}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold text-slate-800">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </h3>
            <button
              onClick={goToCurrentMonth}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              오늘
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-px bg-slate-200">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="bg-slate-50 p-3 text-center">
              <span className="text-sm font-semibold text-slate-600">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-px bg-slate-200">
          {calendarDays.map((date, index) => {
            const deadlines = getFundingDeadlinesForDate(date);
            const isCurrentMonthDate = isCurrentMonth(date);
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={`min-h-[120px] bg-white p-2 ${
                  !isCurrentMonthDate ? "opacity-40" : ""
                }`}
              >
                {/* 날짜 */}
                <div
                  className={`text-right mb-2 ${
                    isTodayDate
                      ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mx-auto"
                      : "text-slate-700"
                  }`}
                >
                  {date.getDate()}
                </div>

                {/* 펀딩 마감일들 */}
                {deadlines.map((deadline, idx) => {
                  // QR 사용 상태 확인 - 날짜만 비교 (시간 제거)
                  const now = new Date();
                  const today = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate()
                  );

                  // fundingEndDate가 유효한지 확인
                  let fundingEndDay = null;
                  let qrExpiryDate = null;

                  if (deadline.fundingEndDate) {
                    try {
                      const fundingEndDate = new Date(deadline.fundingEndDate);
                      if (!isNaN(fundingEndDate.getTime())) {
                        fundingEndDay = new Date(
                          fundingEndDate.getFullYear(),
                          fundingEndDate.getMonth(),
                          fundingEndDate.getDate()
                        );
                        qrExpiryDate = new Date(fundingEndDay);
                        qrExpiryDate.setDate(qrExpiryDate.getDate() + 14); // 펀딩 마감일 + 14일
                      }
                    } catch (error) {
                      console.error(
                        "Invalid funding end date:",
                        deadline.fundingEndDate
                      );
                    }
                  }

                  const isQRExpired =
                    fundingEndDay && qrExpiryDate
                      ? today > qrExpiryDate
                      : false;
                  const isBeforeFundingEnd = fundingEndDay
                    ? today < fundingEndDay
                    : false; // fundingEndDay가 없으면 false로 설정
                  const isQRUsable =
                    fundingEndDay && qrExpiryDate
                      ? today >= fundingEndDay && today <= qrExpiryDate
                      : false;

                  // 디버깅용 로그 (임시)
                  console.log(`${deadline.name}:`, {
                    today: today.toISOString().split("T")[0],
                    fundingEndDay: fundingEndDay
                      ? fundingEndDay.toISOString().split("T")[0]
                      : "null",
                    qrExpiryDate: qrExpiryDate
                      ? qrExpiryDate.toISOString().split("T")[0]
                      : "null",
                    isBeforeFundingEnd,
                    isQRExpired,
                    isQRUsable,
                    status: isBeforeFundingEnd
                      ? "마감일"
                      : isQRExpired
                      ? "사용불가"
                      : "사용가능",
                  });

                  return (
                    <div
                      key={idx}
                      className={`text-xs p-2 mb-2 rounded-lg border transition-all ${
                        deadline.type === "restaurant"
                          ? "bg-blue-50 border-blue-200"
                          : "bg-green-50 border-green-200"
                      } ${isQRExpired ? "" : "cursor-pointer hover:shadow-md"}`}
                      title={`${
                        deadline.name
                      } - ${deadline.amount?.toLocaleString()}원`}
                      onClick={() => {
                        if (!isQRExpired) {
                          // 사용 불가가 아닐 때만 클릭 가능
                          setSelectedFunding(deadline);
                          setShowFundingDetailModal(true);
                        }
                      }}
                    >
                      {/* 헤더 - 이름과 타입만 */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-800 truncate mb-1">
                            {deadline.name}
                          </div>
                          {deadline.type === "specialty" && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              🛍️ 특산품
                            </span>
                          )}
                        </div>
                      </div>

                      {/* QR 사용 상태만 표시 */}
                      <div className="flex items-center gap-2 text-xs">
                        {isBeforeFundingEnd ? (
                          <>
                            <svg
                              className="w-3 h-3 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="font-medium text-blue-600">
                              마감일
                            </span>
                          </>
                        ) : isQRExpired ? (
                          <>
                            <svg
                              className="w-3 h-3 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span className="font-medium text-red-600">
                              사용 불가
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="font-medium text-green-600">
                              사용 가능
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 펀딩 상세 모달 컴포넌트
function FundingDetailModal({ isOpen, onClose, funding }) {
  const [qrLoading, setQrLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  if (!isOpen || !funding) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "kakaopay":
        return "카카오페이";
      case "tosspay":
        return "토스페이";
      case "card":
        return "일반결제";
      default:
        return method;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                funding.type === "restaurant"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {funding.type === "restaurant" ? (
                <IoRestaurantOutline className="w-5 h-5" />
              ) : (
                <IoGiftOutline className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {funding.name}
              </h2>
              <p className="text-slate-600">
                {funding.type === "restaurant" ? "식당 펀딩" : "특산품 펀딩"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* QR 사용 상태 및 버튼 */}
          {(() => {
            const now = new Date();
            const today = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );
            const fundingEndDate = new Date(funding.fundingEndDate);
            const fundingEndDay = new Date(
              fundingEndDate.getFullYear(),
              fundingEndDate.getMonth(),
              fundingEndDate.getDate()
            );
            const qrExpiryDate = new Date(fundingEndDay);
            qrExpiryDate.setDate(qrExpiryDate.getDate() + 14);

            const isQRExpired = today > qrExpiryDate;
            const isBeforeFundingEnd = today < fundingEndDay;
            const isQRUsable = today >= fundingEndDay && today <= qrExpiryDate;

            if (isQRUsable) {
              return (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-green-600" />
                    QR 코드 사용 가능
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">
                        QR 발급일:
                      </span>
                      <span className="font-bold text-green-800 text-lg">
                        {formatDate(funding.fundingEndDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">
                        QR 마감일:
                      </span>
                      <span className="font-bold text-green-800 text-lg">
                        {formatDate(qrExpiryDate)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={async () => {
                          try {
                            // QR 코드에 포함할 데이터
                            const qrData = JSON.stringify({
                              fundingId: funding.id,
                              restaurantName:
                                funding.restaurantName || funding.name,
                              impUid: funding.impUid,
                              totalAmount:
                                funding.totalAmount || funding.amount,
                              createdAt: funding.createdAt,
                            });

                            const qrUrl = await QRCode.toDataURL(qrData, {
                              width: 300,
                              margin: 2,
                              color: {
                                dark: "#1f2937",
                                light: "#ffffff",
                              },
                            });

                            setQrCodeUrl(qrUrl);
                            setShowQRModal(true);
                          } catch (error) {
                            console.error("QR 코드 생성 실패:", error);
                            alert("QR 코드 생성에 실패했습니다.");
                          }
                        }}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                        disabled={qrLoading}
                      >
                        {qrLoading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            QR 생성 중...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            QR 보기
                          </>
                        )}
                      </button>
                      <p className="text-xs text-slate-500 text-center">
                        버튼을 클릭하면 QR 코드를 확인할 수 있습니다
                      </p>
                    </div>
                    <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
                      <p className="text-green-800 text-sm font-medium text-center">
                        ✅ QR 코드를 사용할 수 있습니다
                      </p>
                    </div>
                  </div>
                </div>
              );
            } else if (isBeforeFundingEnd) {
              return (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-blue-600" />
                    펀딩 진행 중
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">
                        펀딩 마감일:
                      </span>
                      <span className="font-bold text-blue-800 text-lg">
                        {formatDate(funding.fundingEndDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">
                        QR 발급 예정일:
                      </span>
                      <span className="font-bold text-blue-800 text-lg">
                        {formatDate(funding.fundingEndDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">
                        QR 사용 기간:
                      </span>
                      <span className="font-bold text-blue-800 text-lg">
                        {formatDate(funding.fundingEndDate)} ~{" "}
                        {formatDate(qrExpiryDate)}
                      </span>
                    </div>
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
                      <p className="text-blue-800 text-sm font-medium text-center">
                        ⏰ 펀딩이 마감되면 QR 코드를 사용할 수 있습니다
                      </p>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <FiX className="w-5 h-5 text-red-600" />
                    QR 사용 기간 만료
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">
                        펀딩 마감일:
                      </span>
                      <span className="font-bold text-red-800 text-lg">
                        {formatDate(funding.fundingEndDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">
                        QR 만료일:
                      </span>
                      <span className="font-bold text-red-800 text-lg">
                        {formatDate(qrExpiryDate)}
                      </span>
                    </div>
                    <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-300">
                      <p className="text-red-800 text-sm font-medium text-center">
                        ❌ QR 코드 사용 기간이 만료되었습니다
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          })()}

          {/* 기본 정보 */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <FiEye className="w-5 h-5 text-slate-600" />
              기본 정보
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span className="text-slate-600">펀딩 금액:</span>
                <span className="font-semibold text-slate-800">
                  {funding.amount?.toLocaleString()}원
                </span>
              </div>
              {funding.type === "restaurant" && funding.paymentMethod && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span className="text-slate-600">결제 방법:</span>
                  <span className="font-semibold text-slate-800">
                    {getPaymentMethodText(funding.paymentMethod)}
                  </span>
                </div>
              )}
              {funding.type === "specialty" && funding.quantity && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="text-slate-600">수량:</span>
                  <span className="font-semibold text-slate-800">
                    {funding.quantity}개
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 식당 펀딩 상세 정보 */}
          {funding.type === "restaurant" && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <FiPackage className="w-5 h-5 text-blue-600" />
                메뉴 정보
              </h3>
              {funding.menuInfo && (
                <div className="space-y-2">
                  {(() => {
                    try {
                      const menus = JSON.parse(funding.menuInfo);
                      return menus.map((menu, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 border border-blue-200"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-blue-800">
                              {menu.name}
                            </span>
                            <span className="text-sm text-blue-600">
                              {menu.quantity}개
                            </span>
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            {menu.price?.toLocaleString()}원/개
                          </div>
                        </div>
                      ));
                    } catch (e) {
                      return (
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <span className="text-blue-800">
                            {funding.menuInfo}
                          </span>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          )}

          {/* 특산품 펀딩 상세 정보 */}
          {funding.type === "specialty" && (
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                <FiMapPin className="w-5 h-5 text-green-600" />
                배송 정보
              </h3>
              <div className="space-y-3">
                {funding.address && (
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span className="text-sm font-medium text-green-800">
                        배송 주소
                      </span>
                    </div>
                    <p className="text-green-700">{funding.address}</p>
                  </div>
                )}
                {(funding.sidoNm || funding.sigunguNm) && (
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span className="text-sm font-medium text-green-800">
                        원산지
                      </span>
                    </div>
                    <p className="text-green-700">
                      {funding.sidoNm} {funding.sigunguNm}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      {/* QR 코드 보기 모달 */}
      {showQRModal && qrCodeUrl && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          qrCodeUrl={qrCodeUrl}
          funding={funding}
        />
      )}
    </div>
  );
}

// QR 코드 보기 모달 컴포넌트
function QRCodeModal({ isOpen, onClose, qrCodeUrl, funding }) {
  if (!isOpen || !qrCodeUrl || !funding) return null;

  const downloadQRCode = async () => {
    try {
      const link = document.createElement("a");
      link.download = `QR_${funding.restaurantName || funding.name}_${
        funding.id
      }.png`;
      link.href = qrCodeUrl;
      link.click();
    } catch (error) {
      console.error("QR 코드 다운로드 실패:", error);
      alert("QR 코드 다운로드에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <FiEye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">QR 코드</h2>
              <p className="text-slate-600 text-sm">
                {funding.restaurantName || funding.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* QR 코드 이미지 */}
        <div className="p-6 text-center">
          <div className="bg-slate-50 rounded-xl p-6 inline-block">
            <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
          </div>
          <p className="text-sm text-slate-600 mt-4">
            이 QR 코드를 스캔하여 사용하세요
          </p>
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <button
              onClick={downloadQRCode}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              다운로드
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
