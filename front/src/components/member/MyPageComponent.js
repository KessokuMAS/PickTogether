// src/components/member/MyPageComponent.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getMyPageInfo } from "../../api/memberApi";
import { getMemberFundings } from "../../api/fundingApi";
import { fundingSpecialtyApi } from "../../api/fundingSpecialtyApi";
import { getCookie, removeCookie } from "../../utils/cookieUtil";
import { useNavigate } from "react-router-dom";
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
      BUSINESS_OWNER: "소상공인",
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
            onClick={() => navigate("/login")}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">마이페이지</h1>
          <p className="text-slate-600 text-lg">
            내 정보와 활동을 한눈에 확인하세요
          </p>
        </div>

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
              <div className="mt-6 space-y-2 flex flex-col items-center">
                <a
                  href="/main"
                  className="w-1/2 px-1.5 py-2 bg-white text-blue-600 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors font-medium text-center block flex items-center justify-center gap-2"
                >
                  <FiMapPin size={16} />
                  메인으로 가기
                </a>

                <a
                  href="/mypage/edit"
                  className="w-1/2 px-1.5 py-2 bg-white text-slate-700 rounded-lg border-2 border-slate-300 hover:bg-slate-50 transition-colors font-medium text-center block flex items-center justify-center gap-2"
                >
                  <FiSettings size={16} />
                  회원 정보 수정
                </a>

                {isAdmin && (
                  <a
                    href="/mypage/admin/settings"
                    className="w-1/2 px-1.5 py-2 bg-white text-yellow-600 rounded-lg border-2 border-yellow-500 hover:bg-yellow-50 transition-colors font-medium text-center block flex items-center justify-center gap-2"
                  >
                    <FiSettings size={16} />
                    관리자 설정
                  </a>
                )}

                {isBusinessOwner && (
                  <a
                    href="/mypage/business/requests"
                    className="w-1/2 px-1.5 py-2 bg-white text-green-600 rounded-lg border-2 border-green-500 hover:bg-green-50 transition-colors font-medium text-center block flex items-center justify-center gap-2"
                  >
                    <FiShoppingCart size={16} />
                    가게 요청
                  </a>
                )}

                {/* 로그아웃 버튼 */}
                <button
                  onClick={handleLogout}
                  className="w-1/2 px-1.5 py-2 bg-white text-red-600 rounded-lg border-2 border-red-500 hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FiLogOut size={16} />
                  로그아웃
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
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FiShoppingCart className="text-emerald-600" size={20} />
                  펀딩 내역
                </h3>
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

  // QR 코드 생성
  useEffect(() => {
    if (funding.status === "COMPLETED") {
      generateQRCode();
    }
  }, [funding]);

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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-all">
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
        {funding.status === "COMPLETED" && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-blue-800 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                  />
                </svg>
                사용 QR 코드
              </div>
              {qrCodeUrl && (
                <button
                  onClick={downloadQRCode}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
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
                  다운로드
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {qrLoading ? (
                  <div className="w-32 h-32 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : qrCodeUrl ? (
                  <div
                    onClick={() => setShowLargeQR(true)}
                    className="cursor-pointer hover:scale-105 transition-transform"
                  >
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-32 h-32 rounded-lg border-2 border-blue-200 hover:border-blue-400"
                    />
                    <div className="text-center mt-2 text-xs text-blue-600">
                      클릭하여 확대보기
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-500">QR 생성 중</span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-sm text-blue-700">
                <p className="font-medium mb-1">
                  레스토랑에서 이 QR 코드를 스캔하세요
                </p>
                <p className="text-xs opacity-80">
                  • 펀딩 ID: {funding.id}
                  <br />• 레스토랑: {funding.restaurantName}
                  <br />• 결제 금액: {funding.totalAmount?.toLocaleString()}원
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

            <div className="text-center">
              <img
                src={qrCodeUrl}
                alt="QR Code Large"
                className="w-80 h-80 mx-auto rounded-lg border-2 border-blue-200"
              />
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium mb-2">{funding.restaurantName}</p>
                <p>펀딩 ID: {funding.id}</p>
                <p>결제 금액: {funding.totalAmount?.toLocaleString()}원</p>
              </div>

              <div className="mt-6 flex gap-3 justify-center">
                <button
                  onClick={downloadQRCode}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                  다운로드
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
