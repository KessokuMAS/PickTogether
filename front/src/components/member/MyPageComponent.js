// src/components/member/MyPageComponent.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getMyPageInfo } from "../../api/memberApi";
import { getMemberFundings } from "../../api/fundingApi";
import { getCookie } from "../../utils/cookieUtil";
import { FiMaximize2, FiDownload, FiSquare } from "react-icons/fi";
import QRCode from "qrcode";

export default function MyPageComponent() {
  const [member, setMember] = useState(null);
  const [fundings, setFundings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await getMyPageInfo();
        setMember(data);

        // 결제 내역 로드
        const memberCookie = getCookie("member");
        if (memberCookie?.member?.email) {
          try {
            const fundingData = await getMemberFundings(
              memberCookie.member.email
            );
            setFundings(fundingData);
          } catch (fundingError) {
            console.error("결제 내역 로드 실패:", fundingError);
            // 펀딩 로드 실패는 전체 마이페이지에 영향을 주지 않도록 함
          }
        }
      } catch (e) {
        console.error("마이페이지 데이터 불러오기 실패:", e);
        setErr("회원 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const initials = useMemo(() => {
    const base = member?.nickname || member?.email?.split("@")[0] || "";
    const tokens = base
      .replace(/[^가-힣a-zA-Z0-9\s]/g, " ")
      .trim()
      .split(/\s+/);
    const first = tokens[0]?.[0] ?? "";
    const second = tokens[1]?.[0] ?? "";
    return (first + second).toUpperCase() || "ME";
  }, [member]);

  const socialText = useMemo(() => {
    const t = (member?.socialType || "").toUpperCase();
    if (!t) return "일반회원";
    if (t === "KAKAO") return "카카오 연동";
    if (t === "NAVER") return "네이버 연동";
    if (t === "GOOGLE") return "구글 연동";
    return t;
  }, [member]);

  // 관리자 역할 확인
  const isAdmin = useMemo(() => {
    console.log("=== DEBUG INFO ===");
    console.log("Member data:", member);
    console.log("Member roles:", member?.memberRoleList);
    console.log("Role names:", member?.roleNames);
    console.log("Role names length:", member?.roleNames?.length);
    console.log("Role names type:", typeof member?.roleNames);
    console.log("Role names is array:", Array.isArray(member?.roleNames));
    if (member?.roleNames && member.roleNames.length > 0) {
      console.log("First role:", member.roleNames[0]);
      console.log("All roles:", member.roleNames);
    }
    console.log(
      "Role types:",
      member?.roleNames?.map((role) => typeof role)
    );
    // roleNames 필드에서 ADMIN 역할 확인
    const adminCheck = member?.roleNames?.some((role) => role === "ADMIN");
    console.log("Is Admin:", adminCheck);
    console.log("==================");
    return adminCheck;
  }, [member]);

  // 소상공인 역할 확인
  const isBusinessOwner = useMemo(() => {
    const businessOwnerCheck = member?.roleNames?.some(
      (role) => role === "BUSINESS_OWNER"
    );
    console.log("Is Business Owner:", businessOwnerCheck);
    return businessOwnerCheck;
  }, [member]);

  const reload = () => {
    setErr("");
    setLoading(true);
    getMyPageInfo()
      .then((d) => setMember(d))
      .catch(() => setErr("다시 실패했습니다. 잠시 후 재시도해주세요."))
      .finally(() => setLoading(false));
  };

  // 로딩 스켈레톤
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 p-6 text-white shadow-xl">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 animate-pulse rounded-full bg-white/30" />
              <div className="flex-1">
                <div className="h-5 w-40 animate-pulse rounded-md bg-white/30" />
                <div className="mt-3 h-4 w-64 animate-pulse rounded-md bg-white/25" />
                <div className="mt-3 flex gap-2">
                  <div className="h-6 w-24 animate-pulse rounded-full bg-white/25" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-white/25" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white p-5 shadow-md">
                <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200" />
                <div className="mt-3 h-8 w-20 animate-pulse rounded-md bg-slate-200" />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-md">
            <div className="h-5 w-32 animate-pulse rounded-md bg-slate-200" />
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h2 className="text-2xl font-extrabold text-slate-800">
            앗, 문제가 발생했어요
          </h2>
          <p className="mt-2 text-slate-500">{err}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={reload}
              className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
            >
              다시 시도
            </button>
            <a
              href="/member/login"
              className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
            >
              로그인 페이지로
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* 헤더 */}
        <section className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/40 bg-white/20 text-2xl font-black tracking-wide">
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold leading-tight">
                {member.nickname || "사용자"}
              </h1>
              <p className="mt-1 break-all text-sm/6 opacity-90">
                {member.email}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-bold">
                  {socialText}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-bold">
                  마이페이지
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <a
                  href="/mypage/admin/settings"
                  className="rounded-xl border border-white/50 bg-yellow-500 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-600"
                >
                  관리자 설정
                </a>
              )}
              {isBusinessOwner && (
                <a
                  href="/mypage/business/requests"
                  className="rounded-xl border border-white/50 bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600"
                >
                  가게 요청
                </a>
              )}
              <a
                href="/main"
                className="rounded-xl border border-white/50 bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"
              >
                메인으로 가기
              </a>
              <a
                href="/member/edit"
                className="rounded-xl border border-white/50 bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-white/90"
              >
                정보 수정
              </a>
              <a
                href="/member/logout"
                className="rounded-xl border border-white/50 bg-transparent px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
              >
                로그아웃
              </a>
            </div>
          </div>
        </section>

        {/* 통계 카드 */}
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-md">
            <div className="text-xs font-bold text-slate-500">포인트</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">
              {member.points ?? 0}{" "}
              <span className="text-sm font-semibold text-slate-400">P</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              활동으로 적립된 포인트
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <div className="text-xs font-bold text-slate-500">등급</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">
              {member.grade ?? "없음"}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              다음 등급까지 열심히
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <div className="text-xs font-bold text-slate-500">연동 상태</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">
              {socialText}
            </div>
            <div className="mt-2 text-xs text-slate-500">계정 보안은 생명</div>
          </div>
        </section>

        {/* 계정 정보 카드 */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-md">
          <h2 className="text-base font-extrabold text-slate-900">계정 정보</h2>
          <div className="mt-4 space-y-3">
            <Row label="이메일" value={member.email} />
            <Row label="닉네임" value={member.nickname || "—"} />
            <Row label="소셜 타입" value={member.socialType || "일반회원"} />
          </div>
        </section>

        {/* 결제 내역 카드 */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-md">
          <h2 className="text-base font-extrabold text-slate-900">결제 내역</h2>
          <div className="mt-4">
            {fundings.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">아직 참여한 펀딩이 없습니다.</p>
                <p className="text-xs mt-1">
                  레스토랑에서 펀딩에 참여해보세요!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {fundings.map((funding) => (
                  <FundingRow key={funding.id} funding={funding} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="truncate text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
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
                <FiSquare className="text-blue-600" />
                사용 QR 코드
              </div>
              {qrCodeUrl && (
                <button
                  onClick={downloadQRCode}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiDownload className="text-sm" />
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
                  <FiDownload className="text-sm" />
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
