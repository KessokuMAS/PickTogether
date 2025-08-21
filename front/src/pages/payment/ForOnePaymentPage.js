import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getCookie } from "../../utils/cookieUtil";
import * as fundingApi from "../../api/fundingApi";
import AddressSearchModal from "../../components/address/AddressSearchModal";
import {
  FiArrowLeft,
  FiCreditCard,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiShoppingCart,
  FiCheck,
} from "react-icons/fi";
import { IoRestaurantOutline } from "react-icons/io5";

const ForOnePaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL 파라미터에서 데이터 추출 (한그릇 펀딩용)
  const slotId = searchParams.get("slotId");
  const menuName = searchParams.get("menuName");
  const restaurantName = searchParams.get("restaurantName");
  const fundingPrice = searchParams.get("fundingPrice");
  const originalPrice = searchParams.get("originalPrice");
  const discountPercent = searchParams.get("discountPercent");

  // 선택된 메뉴 정보 구성
  const [selectedMenus, setSelectedMenus] = useState([]);

  useEffect(() => {
    // 한그릇 펀딩 메뉴 정보 구성
    if (slotId && menuName && fundingPrice) {
      const menuData = {
        id: slotId,
        name: menuName,
        price: parseInt(fundingPrice),
        quantity: 1,
      };
      setSelectedMenus([menuData]);
    }
  }, [slotId, menuName, fundingPrice]);

  // 결제 정보 상태
  const [paymentInfo, setPaymentInfo] = useState({
    name: "",
    phone: "",
    email: "",
    paymentMethod: "card",
    agreeTerms: false,
    agreeSMS: false,
    agreeEmail: false,
  });

  // 결제 진행 상태
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");

  // 포트원 SDK 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/v1/iamport.js";
    script.onload = () => {
      if (typeof window.IMP !== "undefined") {
        window.IMP.init("imp06540216");
      }
    };
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        'script[src="https://cdn.iamport.kr/v1/iamport.js"]'
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // 결제 진행
  const handlePayment = () => {
    if (!paymentInfo.name || !paymentInfo.phone || !paymentInfo.email) {
      alert("모든 필수 정보를 입력해주세요.");
      return;
    }

    if (!paymentInfo.agreeTerms) {
      alert("이용약관에 동의해주세요.");
      return;
    }

    setShowPaymentModal(true);
  };

  // 펀딩 정보를 DB에 저장
  const saveFundingToDB = async (paymentResponse, paymentMethod) => {
    try {
      const memberCookie = getCookie("member");
      console.log("쿠키에서 가져온 member 정보:", memberCookie);

      if (!memberCookie?.member?.email) {
        console.error("로그인 정보를 찾을 수 없습니다.");
        return false;
      }

      const fundingData = {
        memberId: memberCookie.member.email,
        restaurantId: slotId, // slotId를 restaurantId로 사용
        restaurantName: restaurantName || "한그릇 펀딩",
        menuInfo: JSON.stringify(selectedMenus),
        totalAmount: parseInt(fundingPrice),
        paymentMethod: paymentMethod,
        impUid: paymentResponse.imp_uid,
        merchantUid: paymentResponse.merchant_uid,
        agreeSMS: paymentInfo.agreeSMS,
        agreeEmail: paymentInfo.agreeEmail,
        status: "COMPLETED",
      };

      const response = await fundingApi.createFunding(fundingData);
      console.log("펀딩 저장 성공:", response);
      return true;
    } catch (error) {
      console.error("펀딩 정보 저장 실패:", error);
      return false;
    }
  };

  // 결제 수단 선택
  const handlePaymentSelect = (paymentMethod) => {
    setSelectedPayment(paymentMethod);
    setShowPaymentModal(false);
    setIsProcessingPayment(true);

    setTimeout(() => {
      initializePayment(paymentMethod);
    }, 100);
  };

  // 결제 초기화
  const initializePayment = (paymentMethod) => {
    if (typeof window.IMP === "undefined") {
      console.error("포트원 SDK가 로드되지 않았습니다.");
      return;
    }

    let pg, payMethod;
    switch (paymentMethod) {
      case "kakao":
        pg = "kakaopay";
        payMethod = "kakaopay";
        break;
      case "toss":
        pg = "tosspay";
        payMethod = "card";
        break;
      case "card":
        pg = "tosspayments";
        payMethod = "card";
        break;
      default:
        alert("지원하지 않는 결제 수단입니다.");
        setIsProcessingPayment(false);
        return;
    }

    const paymentData = {
      pg: pg,
      pay_method: payMethod,
      merchant_uid: `forone_${Date.now()}`,
      amount: parseInt(fundingPrice),
      name: `${menuName} 펀딩 참여`,
      buyer_email: paymentInfo.email,
      buyer_name: paymentInfo.name,
      buyer_tel: paymentInfo.phone,
    };

    window.IMP.request_pay(paymentData, async (response) => {
      console.log("포트원 결제 응답:", response);

      if (response.success === true) {
        const saveSuccess = await saveFundingToDB(response, paymentMethod);

        if (saveSuccess) {
          alert(
            "펀딩 참여가 완료되었습니다! 큐알코드는 사이트에서 언제든지 확인 가능합니다."
          );

          if (paymentInfo.agreeSMS || paymentInfo.agreeEmail) {
            alert("수신동의하신 방법으로 큐알코드가 발송됩니다.");
          }

          navigate("/main");
        } else {
          alert(
            "결제는 완료되었지만 펀딩 정보 저장에 실패했습니다. 관리자에게 문의해주세요."
          );
          setIsProcessingPayment(false);
        }
      } else {
        const errorMessage = response.error_msg || "결제가 취소되었습니다.";
        alert(`결제 실패: ${errorMessage}`);
        setIsProcessingPayment(false);
      }
    });
  };

  // 뒤로가기
  const handleBack = () => {
    navigate(-1);
  };

  // 결제 수단 선택 모달 상태
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!slotId || !menuName || !fundingPrice) {
    return (
      <MainLayout>
        <div className="p-4 flex justify-center bg-white min-h-screen">
          <div className="w-full max-w-[1200px] text-center py-20">
            <h1 className="text-2xl font-bold text-black mb-4">
              잘못된 접근입니다
            </h1>
            <p className="text-gray-600 mb-6">메뉴 정보가 올바르지 않습니다.</p>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              <FiArrowLeft /> 뒤로가기
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 flex justify-center bg-white min-h-screen">
        <div className="w-full max-w-[1200px]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <IoRestaurantOutline className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-black">펀딩 참여</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Order Summary & Payment Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <FiShoppingCart /> 주문 요약
                </h2>

                {/* 레스토랑 정보 */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="font-semibold text-black">
                    {restaurantName || "한그릇 펀딩"}
                  </h3>
                  <p className="text-sm text-gray-600">펀딩 참여</p>
                </div>

                {/* 선택된 메뉴들 */}
                <div className="space-y-3 mb-4">
                  {selectedMenus.map((menu) => (
                    <div
                      key={menu.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-black">
                          {menu.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {Number(menu.price).toLocaleString()}원 ×{" "}
                          {menu.quantity}개
                        </div>
                        {discountPercent > 0 && (
                          <div className="text-sm text-red-600 font-medium">
                            {discountPercent}% 할인
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-green-600">
                        {(menu.price * menu.quantity).toLocaleString()}원
                      </div>
                    </div>
                  ))}
                </div>

                {/* 총 금액 */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-black">
                      총 금액
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {Number(fundingPrice).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <FiUser /> 참여자 정보
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.name}
                      onChange={(e) =>
                        setPaymentInfo((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      전화번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={paymentInfo.phone}
                      onChange={(e) =>
                        setPaymentInfo((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="010-0000-0000"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={paymentInfo.email}
                      onChange={(e) =>
                        setPaymentInfo((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 text-black">
                        <span className="text-sm font-medium">
                          📱 수령 방법
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        큐알코드는 사이트에서 언제든지 확인 가능하며 수신동의 시
                        문자/이메일로도 발송됩니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 이용약관 동의 */}
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentInfo.agreeTerms}
                      onChange={(e) =>
                        setPaymentInfo((prev) => ({
                          ...prev,
                          agreeTerms: e.target.checked,
                        }))
                      }
                      className="mt-1 text-black rounded"
                    />
                    <div className="text-sm text-gray-700">
                      <span className="text-red-500">*</span> 펀딩 참여 및
                      개인정보 처리에 대한{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        이용약관
                      </a>
                      과{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        개인정보처리방침
                      </a>
                      에 동의합니다.
                    </div>
                  </label>
                </div>

                {/* 수신 동의 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    수신 동의 (선택사항)
                  </h4>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentInfo.agreeSMS}
                      onChange={(e) =>
                        setPaymentInfo((prev) => ({
                          ...prev,
                          agreeSMS: e.target.checked,
                        }))
                      }
                      className="text-black rounded"
                    />
                    <div className="text-sm text-gray-700">
                      SMS를 통한 큐알코드 발송 및 펀딩 진행상황 알림 수신에
                      동의합니다.
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentInfo.agreeEmail}
                      onChange={(e) =>
                        setPaymentInfo((prev) => ({
                          ...prev,
                          agreeEmail: e.target.checked,
                        }))
                      }
                      className="text-black rounded"
                    />
                    <div className="text-sm text-gray-700">
                      이메일을 통한 큐알코드 발송 및 펀딩 진행상황 알림 수신에
                      동의합니다.
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Payment Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-300 rounded-lg p-6 sticky top-4">
                <h3 className="text-lg font-bold text-black mb-4">결제 요약</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">상품 금액</span>
                    <span>{Number(fundingPrice).toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">수수료</span>
                    <span>0원</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>총 결제금액</span>
                    <span className="text-green-600">
                      {Number(fundingPrice).toLocaleString()}원
                    </span>
                  </div>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FiCheck />
                  {isProcessingPayment ? "결제 진행 중..." : "펀딩 참여하기"}
                </button>
                <p className="mt-4 text-xs text-gray-500 text-center">
                  결제 완료 후 큐알코드는 사이트에서 언제든지 확인 가능하며,
                  수신동의 시 문자/이메일로도 발송됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-bold text-black mb-4 text-center">
                  결제 수단 선택
                </h3>
                <div className="space-y-3 mb-6">
                  {/* 카카오페이 */}
                  <button
                    onClick={() => handlePaymentSelect("kakao")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition transform hover:scale-105"
                    style={{ backgroundColor: "#FEE500" }}
                  >
                    <img
                      src="../../kakao1.png"
                      alt="KakaoPay"
                      className="w-8 h-8"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-black">카카오페이</div>
                      <div className="text-sm text-gray-700">
                        간편하게 결제하세요
                      </div>
                    </div>
                  </button>

                  {/* 토스페이 */}
                  <button
                    onClick={() => handlePaymentSelect("toss")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition transform hover:scale-105"
                    style={{ backgroundColor: "#007AFF" }}
                  >
                    <img
                      src="../../toss.png"
                      alt="TossPay"
                      className="w-8 h-8"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-white">토스페이</div>
                      <div className="text-sm text-white">토스로 간편 결제</div>
                    </div>
                  </button>

                  {/* 일반결제 */}
                  <button
                    onClick={() => handlePaymentSelect("card")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                  >
                    <FiCreditCard className="w-8 h-8 text-black" />
                    <div className="text-left">
                      <div className="font-semibold text-black">일반결제</div>
                      <div className="text-sm text-gray-600">
                        신용카드, 계좌이체 등
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* Payment Processing Modal */}
          {isProcessingPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
                <h3 className="text-lg font-bold text-black mb-2">
                  {selectedPayment === "kakao"
                    ? "카카오페이"
                    : selectedPayment === "toss"
                    ? "토스페이"
                    : "일반결제"}{" "}
                  진행 중
                </h3>
                <p className="text-gray-600 mb-4">
                  결제창이 열립니다. 결제를 완료해주세요.
                </p>
                <div className="animate-pulse mb-4">
                  <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
                <button
                  onClick={() => {
                    setIsProcessingPayment(false);
                    setSelectedPayment("");
                  }}
                  className="text-blue-600 hover:underline"
                >
                  결제 취소하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ForOnePaymentPage;
