import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getCookie } from "../../utils/cookieUtil";
import { createFunding } from "../../api/fundingApi";
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

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL 파라미터에서 데이터 추출
  const restaurantId = searchParams.get("restaurantId");
  const restaurantName = searchParams.get("restaurantName");
  const menusParam = searchParams.get("menus");
  const totalPrice = searchParams.get("totalPrice");

  // 지역특산품 관련 파라미터 추가
  const productType = searchParams.get("type"); // "restaurant" 또는 "specialty"
  const specialtyId = searchParams.get("specialtyId");
  const specialtyName = searchParams.get("specialtyName");
  const specialtyPrice = searchParams.get("specialtyPrice");
  const specialtyQuantity = searchParams.get("specialtyQuantity");
  const specialtySidoNm = searchParams.get("sidoNm");
  const specialtySigunguNm = searchParams.get("sigunguNm");

  // 선택된 메뉴들 파싱
  const [selectedMenus, setSelectedMenus] = useState([]);

  useEffect(() => {
    // 기존 링크 호환성을 위해 type이 비어있어도 레스토랑 플로우로 간주하여 파싱
    if (menusParam && (productType === "restaurant" || !productType)) {
      try {
        const parsedMenus = JSON.parse(menusParam);
        setSelectedMenus(parsedMenus);
      } catch (e) {
        console.error("메뉴 데이터 파싱 오류:", e);
        setSelectedMenus([]);
      }
    }
  }, [menusParam, productType]);

  // 결제 정보 상태
  const [paymentInfo, setPaymentInfo] = useState({
    name: "",
    phone: "",
    email: "",
    paymentMethod: "card",
    agreeTerms: false,
    agreeSMS: false, // SMS 수신 동의
    agreeEmail: false, // 이메일 수신 동의
    // 지역특산품 구매 시 배송 주소 정보 추가
    address: "",
    detailAddress: "",
    zipCode: "",
  });

  // 결제 진행 상태
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");

  // 포트원 SDK 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.iamport.kr/v1/iamport.js";
    script.onload = () => {
      // SDK 로드 완료 후 포트원 초기화
      if (typeof window.IMP !== "undefined") {
        window.IMP.init("imp06540216"); // 실제 포트원 가맹점 식별코드로 변경 필요
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

    // 지역특산품 구매 시 배송 주소도 필수
    if (productType === "specialty") {
      if (
        !paymentInfo.address ||
        !paymentInfo.detailAddress ||
        !paymentInfo.zipCode
      ) {
        alert("배송 주소를 모두 입력해주세요.");
        return;
      }
    }

    if (!paymentInfo.agreeTerms) {
      alert("이용약관에 동의해주세요.");
      return;
    }

    // 결제 수단 선택 모달 표시
    setShowPaymentModal(true);
  };

  // 펀딩 정보 저장
  const saveFundingToDB = async (paymentResponse, paymentMethod) => {
    try {
      const memberCookie = getCookie("member");
      console.log("쿠키에서 가져온 member 정보:", memberCookie);

      if (!memberCookie?.member?.email) {
        console.error("로그인 정보를 찾을 수 없습니다.");
        console.error("memberCookie:", memberCookie);
        console.error("memberCookie.member:", memberCookie?.member);
        console.error(
          "memberCookie.member.email:",
          memberCookie?.member?.email
        );
        return false;
      }

      const fundingData = {
        memberId: memberCookie.member.email, // email을 ID로 사용
        restaurantId: restaurantId,
        restaurantName: restaurantName,
        menuInfo: JSON.stringify(selectedMenus),
        totalAmount: Number(totalPrice),
        paymentMethod: paymentMethod,
        impUid: paymentResponse.imp_uid,
        merchantUid: paymentResponse.merchant_uid,
        agreeSMS: paymentInfo.agreeSMS,
        agreeEmail: paymentInfo.agreeEmail,
        status: "COMPLETED",
      };

      // 백엔드 API 호출
      const response = await createFunding(fundingData);
      console.log("펀딩 저장 성공:", response);

      return true;
    } catch (error) {
      console.error("펀딩 정보 저장 실패:", error);
      return false;
    }
  };

  // 지역특산품 구매 정보 저장
  const saveSpecialtyOrderToDB = async (paymentResponse, paymentMethod) => {
    try {
      const memberCookie = getCookie("member");
      console.log("쿠키에서 가져온 member 정보:", memberCookie);

      if (!memberCookie?.member?.email) {
        console.error("로그인 정보를 찾을 수 없습니다.");
        return false;
      }

      const orderData = {
        memberId: memberCookie.member.email,
        specialtyId: specialtyId,
        specialtyName: specialtyName,
        quantity: Number(specialtyQuantity),
        unitPrice: Number(specialtyPrice),
        totalAmount: Number(specialtyPrice) * Number(specialtyQuantity),
        buyerName: paymentInfo.name,
        buyerPhone: paymentInfo.phone,
        buyerEmail: paymentInfo.email,
        zipCode: paymentInfo.zipCode,
        address: paymentInfo.address,
        detailAddress: paymentInfo.detailAddress,
        paymentMethod: paymentMethod,
        merchantUid: paymentResponse.merchant_uid,
        agreeSms: paymentInfo.agreeSMS,
        agreeEmail: paymentInfo.agreeEmail,
        sidoNm: specialtySidoNm,
        sigunguNm: specialtySigunguNm,
      };

      // 지역특산품 주문 생성 API 호출
      const response = await fetch(
        "http://localhost:8080/api/funding-specialty",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) {
        throw new Error("주문 생성 실패");
      }

      const createdOrder = await response.json();
      console.log("특산품 주문 생성 성공:", createdOrder);

      // 결제 완료 처리
      const paymentCompleteResponse = await fetch(
        "http://localhost:8080/api/funding-specialty/payment/complete",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            impUid: paymentResponse.imp_uid,
            merchantUid: paymentResponse.merchant_uid,
          }),
        }
      );

      if (!paymentCompleteResponse.ok) {
        throw new Error("결제 완료 처리 실패");
      }

      const completedOrder = await paymentCompleteResponse.json();
      console.log("결제 완료 처리 성공:", completedOrder);

      return true;
    } catch (error) {
      console.error("특산품 주문 저장 실패:", error);
      return false;
    }
  };

  // 결제 수단 선택
  const handlePaymentSelect = (paymentMethod) => {
    setSelectedPayment(paymentMethod);
    setShowPaymentModal(false);
    setIsProcessingPayment(true);

    // 결제 진행
    initializePayment(paymentMethod);
  };

  // 포트원 결제 초기화
  const initializePayment = (paymentMethod) => {
    if (typeof window.IMP === "undefined") {
      console.error("포트원 SDK가 로드되지 않았습니다.");
      return;
    }

    // 결제 수단에 따른 설정
    let pg, payMethod;
    switch (paymentMethod) {
      case "kakaopay":
        pg = "kakaopay";
        payMethod = "kakaopay";
        break;
      case "tosspay":
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

    // 결제 요청
    const paymentData = {
      pg: pg,
      pay_method: payMethod,
      merchant_uid:
        productType === "specialty"
          ? `specialty_${Date.now()}`
          : `funding_${Date.now()}`,
      amount:
        productType === "specialty"
          ? Number(specialtyPrice) * Number(specialtyQuantity)
          : Number(totalPrice),
      name:
        productType === "specialty"
          ? `${specialtyName} 구매`
          : `${restaurantName} 펀딩 참여`,
      buyer_email: paymentInfo.email,
      buyer_name: paymentInfo.name,
      buyer_tel: paymentInfo.phone,
    };

    window.IMP.request_pay(paymentData, async (response) => {
      console.log("포트원 결제 응답:", response);

      if (response.success === true) {
        // 결제 성공 시 정보 저장
        if (productType === "specialty") {
          // 지역특산품 구매 성공
          const saveSuccess = await saveSpecialtyOrderToDB(
            response,
            paymentMethod
          );

          if (saveSuccess) {
            alert("지역특산품 구매가 완료되었습니다! 🎉");

            if (paymentInfo.agreeSMS || paymentInfo.agreeEmail) {
              alert(
                "수신동의하신 방법으로 펀딩 종료시 주문 확인 및 배송 안내가 발송됩니다."
              );
            }

            navigate("/local-specialty");
          } else {
            alert(
              "결제는 완료되었지만 주문 정보 저장에 실패했습니다. 관리자에게 문의해주세요."
            );
            setIsProcessingPayment(false);
          }
        } else {
          // 레스토랑 펀딩 성공
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
        }
      } else {
        // 결제 실패
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

  // 주소 검색 모달 상태
  const [showAddressModal, setShowAddressModal] = useState(false);

  // 주소 선택 핸들러
  const handleAddressSelect = (addressData) => {
    setPaymentInfo((prev) => ({
      ...prev,
      zipCode: addressData.zipCode,
      address: addressData.address,
      detailAddress: addressData.detailAddress,
    }));
  };

  if (productType === "specialty") {
    // 지역특산품 구매인 경우
    if (!specialtyName || !specialtyPrice) {
      return (
        <MainLayout>
          <div className="p-4 flex justify-center bg-white min-h-screen">
            <div className="w-full max-w-[1200px] text-center py-20">
              <h1 className="text-2xl font-bold text-black mb-4">
                잘못된 접근입니다
              </h1>
              <p className="text-gray-600 mb-6">
                상품 정보가 올바르지 않습니다.
              </p>
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
  } else {
    // 레스토랑 펀딩인 경우
    if (!restaurantName || selectedMenus.length === 0) {
      return (
        <MainLayout>
          <div className="p-4 flex justify-center bg-white min-h-screen">
            <div className="w-full max-w-[1200px] text-center py-20">
              <h1 className="text-2xl font-bold text-black mb-4">
                잘못된 접근입니다
              </h1>
              <p className="text-gray-600 mb-6">
                메뉴를 선택한 후 다시 시도해주세요.
              </p>
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
            <h1 className="text-2xl font-bold text-black">
              {productType === "specialty" ? "지역특산품 구매" : "펀딩 참여"}
            </h1>
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
                {(productType === "restaurant" || !productType) && (
                  <>
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <h3 className="font-semibold text-black">
                        {restaurantName}
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
                          </div>
                          <div className="font-bold text-green-600">
                            {(menu.price * menu.quantity).toLocaleString()}원
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* 지역특산품 정보 */}
                {productType === "specialty" && (
                  <>
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <h3 className="font-semibold text-black">
                        {specialtyName}
                      </h3>
                      <p className="text-sm text-gray-600">지역특산품 구매</p>
                    </div>

                    {/* 상품 정보 */}
                    <div className="space-y-3 mb-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-black text-lg mb-1">
                              {specialtyName}
                            </div>
                            {/* 지역 정보 표시 */}
                            <div className="text-sm text-blue-600 font-medium mb-2">
                              지역:{" "}
                              {specialtySidoNm && specialtySigunguNm
                                ? `${specialtySidoNm} ${specialtySigunguNm}`
                                : "지역 정보 없음"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {Number(specialtyPrice).toLocaleString()}원 ×{" "}
                              {specialtyQuantity}개
                            </div>
                          </div>
                          <div className="font-bold text-green-600 text-xl">
                            {(
                              Number(specialtyPrice) * Number(specialtyQuantity)
                            ).toLocaleString()}
                            원
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 총 금액 */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-black">
                      총 금액
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {productType === "specialty"
                        ? (
                            Number(specialtyPrice) * Number(specialtyQuantity)
                          ).toLocaleString()
                        : Number(totalPrice).toLocaleString()}
                      원
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

                  {/* 지역특산품 구매 시에만 배송 주소 입력 필드 표시 */}
                  {productType === "specialty" && (
                    <>
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <FiMapPin /> 배송 주소{" "}
                          <span className="text-red-500">*</span>
                        </h4>
                      </div>

                      {/* 주소 검색 및 표시 */}
                      <div className="md:col-span-2">
                        {!paymentInfo.address ? (
                          // 주소가 선택되지 않은 경우 - 주소 검색 버튼
                          <button
                            type="button"
                            onClick={() => setShowAddressModal(true)}
                            className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 border-dashed rounded-lg hover:bg-blue-100 transition text-blue-600 font-medium flex items-center justify-center gap-2"
                          >
                            <FiMapPin />
                            카카오맵으로 주소 검색하기
                          </button>
                        ) : (
                          // 주소가 선택된 경우 - 주소 정보 표시 및 변경 버튼
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="text-sm text-gray-600 mb-1">
                                  우편번호
                                </div>
                                <div className="font-mono text-gray-900 mb-3">
                                  {paymentInfo.zipCode}
                                </div>

                                <div className="text-sm text-gray-600 mb-1">
                                  기본 주소
                                </div>
                                <div className="text-gray-900 mb-3">
                                  {paymentInfo.address}
                                </div>

                                <div className="text-sm text-gray-600 mb-1">
                                  상세 주소
                                </div>
                                <div className="text-gray-900">
                                  {paymentInfo.detailAddress}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowAddressModal(true)}
                                className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition text-gray-700"
                              >
                                변경
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
                              💡 주소를 변경하려면 '변경' 버튼을 눌러주세요.
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 text-black">
                        <span className="text-sm font-medium">
                          {productType === "specialty"
                            ? "🚚 배송 안내"
                            : "📱 수령 방법"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {productType === "specialty"
                          ? "주문 완료 후 2-3일 내 배송되며, 배송 상황은 주문 내역에서 확인할 수 있습니다."
                          : "큐알코드는 사이트에서 언제든지 확인 가능하며\n수신동의 시 문자/이메일로도 발송됩니다."}
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
                      <span className="text-red-500">*</span>{" "}
                      {productType === "specialty"
                        ? "상품 구매 및 개인정보 처리에 대한"
                        : "펀딩 참여 및 개인정보 처리에 대한"}{" "}
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
                      SMS를 통한{" "}
                      {productType === "specialty"
                        ? "주문 확인 및 배송 진행상황 알림 수신에"
                        : "큐알코드 발송 및 펀딩 진행상황 알림 수신에"}{" "}
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
                      이메일을 통한{" "}
                      {productType === "specialty"
                        ? "주문 확인 및 배송 진행상황 알림 수신에"
                        : "큐알코드 발송 및 펀딩 진행상황 알림 수신에"}{" "}
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
                    <span>
                      {productType === "specialty"
                        ? (
                            Number(specialtyPrice) * Number(specialtyQuantity)
                          ).toLocaleString()
                        : Number(totalPrice).toLocaleString()}
                      원
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">수수료</span>
                    <span>0원</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>총 결제금액</span>
                    <span className="text-green-600">
                      {productType === "specialty"
                        ? (
                            Number(specialtyPrice) * Number(specialtyQuantity)
                          ).toLocaleString()
                        : Number(totalPrice).toLocaleString()}
                      원
                    </span>
                  </div>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FiCheck />
                  {isProcessingPayment
                    ? "결제 진행 중..."
                    : productType === "specialty"
                    ? "펀딩 참여하기"
                    : "펀딩 참여하기"}
                </button>
                <p className="mt-4 text-xs text-gray-500 text-center">
                  {productType === "specialty"
                    ? "결제 완료 후 주문 내역에서 배송 상황을 확인할 수 있습니다."
                    : "결제 완료 후 큐알코드는 사이트에서 언제든지 확인 가능하며, 수신동의 시 문자/이메일로도 발송됩니다."}
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
                    onClick={() => handlePaymentSelect("kakaopay")}
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
                    onClick={() => handlePaymentSelect("tosspay")}
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
                  {selectedPayment === "kakaopay"
                    ? "카카오페이"
                    : selectedPayment === "tosspay"
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

          {/* Address Search Modal */}
          <AddressSearchModal
            isOpen={showAddressModal}
            onClose={() => setShowAddressModal(false)}
            onAddressSelect={handleAddressSelect}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentPage;
