import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getFundingById } from "../../api/fundingApi";
import { getCookie } from "../../utils/cookieUtil";
import {
  FiArrowLeft,
  FiMaximize2,
  FiCalendar,
  FiMapPin,
  FiCreditCard,
  FiCheck,
  FiDownload,
} from "react-icons/fi";

const QRCodePage = () => {
  const { fundingId } = useParams();
  const navigate = useNavigate();
  const [funding, setFunding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFunding = async () => {
      try {
        setLoading(true);
        const data = await getFundingById(fundingId);
        setFunding(data);
      } catch (err) {
        console.error("펀딩 정보 로드 실패:", err);
        setError("펀딩 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (fundingId) {
      loadFunding();
    }
  }, [fundingId]);

  const handleBack = () => {
    navigate(-1);
  };

  const downloadQRCode = () => {
    // QR 코드 다운로드 기능 (실제 구현 시)
    alert("QR 코드 다운로드 기능은 준비 중입니다.");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">큐알코드를 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !funding) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              오류가 발생했습니다
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "펀딩 정보를 찾을 수 없습니다."}
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              뒤로가기
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">큐알코드 확인</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 큐알코드 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                <div className="text-center">
                  <FiMaximize2 className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">QR 코드 이미지</p>
                  <p className="text-gray-400 text-xs">
                    실제 구현 시 포트원에서 제공
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={downloadQRCode}
                  className="w-full bg-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiDownload className="text-lg" />
                  QR 코드 다운로드
                </button>

                <div className="text-xs text-gray-500">
                  QR 코드는 펀딩 참여 완료 후 자동으로 생성됩니다.
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 펀딩 정보 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiCheck className="text-green-600" />
              펀딩 참여 정보
            </h2>

            <div className="space-y-4">
              {/* 레스토랑 정보 */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FiMapPin className="text-pink-600" />
                  {funding.restaurantName}
                </h3>
                <p className="text-sm text-gray-600">펀딩 참여 완료</p>
              </div>

              {/* 메뉴 정보 */}
              {funding.menuInfo && (
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    선택한 메뉴
                  </h4>
                  {(() => {
                    try {
                      const menus = JSON.parse(funding.menuInfo);
                      return (
                        <div className="space-y-2">
                          {menus.map((menu, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-gray-700">
                                {menu.name} × {menu.quantity}개
                              </span>
                              <span className="font-medium text-gray-900">
                                {(menu.price * menu.quantity).toLocaleString()}
                                원
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    } catch (e) {
                      return (
                        <span className="text-gray-500 text-sm">
                          {funding.menuInfo}
                        </span>
                      );
                    }
                  })()}
                </div>
              )}

              {/* 결제 정보 */}
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FiCreditCard className="text-blue-600" />
                  결제 정보
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 수단</span>
                    <span className="text-gray-900">
                      {funding.paymentMethod === "kakaopay"
                        ? "카카오페이"
                        : funding.paymentMethod === "tosspay"
                        ? "토스페이"
                        : funding.paymentMethod === "card"
                        ? "일반결제"
                        : funding.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 금액</span>
                    <span className="font-bold text-pink-600 text-lg">
                      {funding.totalAmount?.toLocaleString()}원
                    </span>
                  </div>
                  {funding.impUid && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">결제 번호</span>
                      <span className="text-gray-500 font-mono text-xs">
                        {funding.impUid}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 참여 정보 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FiCalendar className="text-purple-600" />
                  참여 정보
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">참여일</span>
                    <span className="text-gray-900">
                      {new Date(funding.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">상태</span>
                    <span
                      className={`font-medium ${
                        funding.status === "COMPLETED"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {funding.status === "COMPLETED" ? "완료" : funding.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            큐알코드 사용 안내
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• 큐알코드는 펀딩 참여 완료 후 즉시 생성됩니다.</p>
            <p>• 레스토랑에서 QR 코드를 스캔하여 사용할 수 있습니다.</p>
            <p>• QR 코드는 한 번만 사용 가능하며, 사용 후 만료됩니다.</p>
            <p>• 문제가 있을 경우 레스토랑에 문의하세요.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QRCodePage;
