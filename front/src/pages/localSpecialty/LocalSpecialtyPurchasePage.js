import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { localSpecialtyApi } from "../../api/localSpecialtyApi";
import { IoRestaurantOutline, IoArrowBack } from "react-icons/io5";
import {
  TbCurrentLocation,
  TbCalendar,
  TbTruck,
  TbCreditCard,
} from "react-icons/tb";
import MainMenu from "../../components/menus/Mainmenu";

const LocalSpecialtyPurchasePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 구매 관련 상태
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState({
    name: "",
    phone: "",
    address: "",
    detailAddress: "",
    zipCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    loadSpecialtyDetail();
  }, [id]);

  const loadSpecialtyDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await localSpecialtyApi.getLocalSpecialtyById(id);
      setSpecialty(data);
    } catch (err) {
      console.error("상세 정보 로드 실패:", err);
      setError("지역특산물 상세 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = `/${Math.floor(Math.random() * 45 + 1)}.png`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR");
    } catch {
      return dateString;
    }
  };

  const goBack = () => {
    navigate(`/local-specialty/${id}`);
  };

  const goToList = () => {
    navigate("/local-specialty");
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = () => {
    // 구매 처리 로직
    alert("구매 기능이 준비 중입니다. 곧 만나뵙겠습니다! 🚀");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">지역특산물 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !specialty) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          오류가 발생했습니다
        </h2>
        <p className="text-gray-600 mb-6">
          {error || "지역특산물을 찾을 수 없습니다."}
        </p>
        <button
          onClick={goBack}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mr-4"
        >
          상세페이지로 돌아가기
        </button>
        <button
          onClick={loadSpecialtyDetail}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const { cntntsSj, areaNm, imgUrl, sidoNm, sigunguNm, svcDt, cntntsNo } =
    specialty;

  const imgSrc = imgUrl || `/${Math.floor(Math.random() * 45 + 1)}.png`;

  // 가격 정보 (실제로는 API에서 받아와야 함)
  const price = 25000; // 임시 가격
  const shippingFee = quantity > 2 ? 0 : 3000; // 3개 이상 구매 시 무료배송
  const totalPrice = price * quantity + shippingFee;

  return (
    <>
      <MainMenu />

      <div className="p-2 flex justify-center bg-white min-h-screen pt-[200px]">
        <div className="w-full max-w-[1200px]">
          {/* 헤더 */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <IoArrowBack className="text-xl" />
              <span>상세페이지로</span>
            </button>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <IoRestaurantOutline className="text-[32px] text-green-500" />
              <span>지역특산품 구매</span>
            </h1>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽: 상품 정보 및 구매 폼 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 상품 정보 카드 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  상품 정보
                </h2>
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={imgSrc}
                      alt={cntntsSj}
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {cntntsSj}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {sidoNm}
                      {sigunguNm && ` > ${sigunguNm}`}
                    </p>
                    {areaNm && (
                      <p className="text-gray-500 text-sm">{areaNm}</p>
                    )}
                    <div className="mt-3">
                      <span className="text-2xl font-bold text-green-600">
                        {price.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 수량 선택 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  수량 선택
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-16 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 99}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 배송지 정보 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TbTruck className="text-blue-500" />
                  배송지 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      받는 사람
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.name}
                      onChange={(e) =>
                        setDeliveryAddress({
                          ...deliveryAddress,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      연락처
                    </label>
                    <input
                      type="tel"
                      value={deliveryAddress.phone}
                      onChange={(e) =>
                        setDeliveryAddress({
                          ...deliveryAddress,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="010-0000-0000"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      우편번호
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.zipCode}
                      onChange={(e) =>
                        setDeliveryAddress({
                          ...deliveryAddress,
                          zipCode: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="우편번호를 입력하세요"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      기본주소
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.address}
                      onChange={(e) =>
                        setDeliveryAddress({
                          ...deliveryAddress,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="기본주소를 입력하세요"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상세주소
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.detailAddress}
                      onChange={(e) =>
                        setDeliveryAddress({
                          ...deliveryAddress,
                          detailAddress: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="상세주소를 입력하세요"
                    />
                  </div>
                </div>
              </div>

              {/* 결제 방법 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TbCreditCard className="text-blue-500" />
                  결제 방법
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-500"
                    />
                    <span>신용카드</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === "bank"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-500"
                    />
                    <span>계좌이체</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="phone"
                      checked={paymentMethod === "phone"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-500"
                    />
                    <span>휴대폰 결제</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 오른쪽: 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  주문 요약
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품 금액</span>
                    <span className="font-medium">
                      {(price * quantity).toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">배송비</span>
                    <span className="font-medium">
                      {shippingFee === 0
                        ? "무료"
                        : `${shippingFee.toLocaleString()}원`}
                    </span>
                  </div>
                  {shippingFee > 0 && (
                    <div className="text-xs text-blue-600">
                      * 3개 이상 구매 시 무료배송
                    </div>
                  )}
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>총 결제금액</span>
                    <span className="text-green-600">
                      {totalPrice.toLocaleString()}원
                    </span>
                  </div>
                </div>

                {/* 구매하기 버튼 */}
                <button
                  onClick={handlePurchase}
                  className="w-full px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg mb-4"
                >
                  🛒 구매하기
                </button>

                {/* 목록으로 돌아가기 */}
                <button
                  onClick={goToList}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  목록으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocalSpecialtyPurchasePage;
