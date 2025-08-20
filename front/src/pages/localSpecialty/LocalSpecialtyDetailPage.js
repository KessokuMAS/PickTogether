import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { localSpecialtyApi } from "../../api/localSpecialtyApi";
import { IoRestaurantOutline, IoArrowBack } from "react-icons/io5";
import { TbCurrentLocation, TbCalendar, TbExternalLink } from "react-icons/tb";
import MainLayout from "../../layouts/MainLayout";
import {
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiTag,
  FiInfo,
  FiEye,
  FiShield,
  FiArrowLeft,
  FiShare2,
  FiMapPin,
  FiClock,
} from "react-icons/fi";

// Bar Progress Component (RestaurantDetailPage에서 가져옴)
const BarProgress = ({ value = 0, maxValue = 100 }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const barColor = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#3b82f6";

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full bg-gray-100 rounded-full h-6">
        <div
          className="h-6 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
        <span>{pct}% 달성</span>
        <span>목표 {maxValue.toLocaleString()}원</span>
      </div>
    </div>
  );
};

const LocalSpecialtyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  // 상품명 기반으로 동적 가격 계산하는 함수
  const getProductPrice = (productName) => {
    // 상품명을 소문자로 변환하여 매칭
    const name = productName.toLowerCase();

    // 프리미엄 상품 (고가)
    if (name.includes("한우") || name.includes("소고기")) return 150000;
    if (name.includes("인삼") || name.includes("산양삼")) return 80000;

    // 주식류
    if (name.includes("쌀") || name.includes("미") || name.includes("벼"))
      return 25000;

    // 과일류
    if (
      name.includes("사과") ||
      name.includes("배") ||
      name.includes("포도") ||
      name.includes("감") ||
      name.includes("자두") ||
      name.includes("참외") ||
      name.includes("수박") ||
      name.includes("메론")
    )
      return 20000;

    // 채소류
    if (
      name.includes("토마토") ||
      name.includes("오이") ||
      name.includes("고추") ||
      name.includes("배추") ||
      name.includes("무") ||
      name.includes("당근") ||
      name.includes("마늘") ||
      name.includes("양파") ||
      name.includes("부추")
    )
      return 12000;

    // 해산물
    if (
      name.includes("멸치") ||
      name.includes("다시마") ||
      name.includes("미역") ||
      name.includes("어묵") ||
      name.includes("곰장어") ||
      name.includes("붕장어") ||
      name.includes("생갈치") ||
      name.includes("새우젓")
    )
      return 30000;

    // 특수작물
    if (name.includes("벌꿀") || name.includes("꿀")) return 25000;
    if (
      name.includes("버섯") ||
      name.includes("표고") ||
      name.includes("느타리")
    )
      return 18000;
    if (name.includes("고구마") || name.includes("감자")) return 15000;
    if (name.includes("딸기")) return 18000;

    // 기본 가격
    return 20000;
  };

  // 수량 증가 함수
  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 99));
  };

  // 수량 감소 함수
  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  // 수량 직접 입력 함수
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 99) {
      setQuantity(value);
    }
  };

  useEffect(() => {
    const fetchSpecialty = async () => {
      try {
        setLoading(true);
        // URL 파라미터는 cntntsNo이므로 cntntsNo로 조회
        const data = await localSpecialtyApi.getLocalSpecialtyByCntntsNo(id);
        setSpecialty(data);

        // 가격 계산 결과를 콘솔에 출력 (디버깅용)
        console.log("상품명:", data.cntntsSj);
        console.log("계산된 가격:", getProductPrice(data.cntntsSj));
      } catch (err) {
        setError("상품 정보를 불러오는데 실패했습니다.");
        console.error("Error fetching specialty:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialty();
  }, [id]);

  const handleImageError = (e) => {
    // cntntsNo 기반으로 fallback 이미지 설정
    const fallbackIndex = (parseInt(id) % 45) + 1;
    e.target.src = `/${fallbackIndex}.png`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\.\s/g, ".")
        .replace(/\.$/, "");
    } catch {
      return dateString;
    }
  };

  const goBack = () => {
    navigate("/local-specialty");
  };

  // Handle share
  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: specialty?.cntntsSj || "지역특산물",
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (e) {
      console.error("Share failed:", e);
    }
  };

  // Handle purchase button click
  const handlePurchaseClick = () => {
    if (quantity <= 0) {
      alert("수량을 선택해주세요");
      return;
    }
    const dynamicPrice = getProductPrice(specialty.cntntsSj);
    navigate(
      `/payment?type=specialty&specialtyId=${
        specialty.cntntsNo
      }&specialtyName=${
        specialty.cntntsSj
      }&specialtyPrice=${dynamicPrice}&specialtyQuantity=${quantity}&sidoNm=${encodeURIComponent(
        specialty.sidoNm || ""
      )}&sigunguNm=${encodeURIComponent(specialty.sigunguNm || "")}`
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="col-span-3 h-96 bg-gray-100 rounded-2xl" />
                <div className="col-span-2 space-y-4">
                  <div className="h-12 w-80 bg-gray-100 rounded-lg" />
                  <div className="h-6 w-full bg-gray-100 rounded-lg" />
                  <div className="h-6 w-1/2 bg-gray-100 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !specialty) {
    return (
      <MainLayout>
        <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <p className="text-red-600 text-center text-lg font-medium py-20">
              {error || "지역특산물을 찾을 수 없습니다."}
            </p>
            <div className="text-center space-x-4">
              <button
                onClick={goBack}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                목록으로 돌아가기
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const {
    cntntsSj,
    areaNm,
    imgUrl,
    sidoNm,
    sigunguNm,
    svcDt,
    linkUrl,
    cntntsNo,
    cntntsCn,
    rdcnt,
    imgUrl2,
    imgUrl3,
    collectYmd,
    fundingGoalAmount,
    fundingAmount,
    fundingPercent,
  } = specialty;

  // 이미지 소스 설정 (cntntsNo 기반 fallback)
  const fallbackIndex = (parseInt(cntntsNo) % 45) + 1;
  const imgSrc = imgUrl || `/${fallbackIndex}.png`;
  const additionalImages = [imgUrl2, imgUrl3].filter(Boolean);

  // 동적 가격 계산
  const dynamicPrice = getProductPrice(cntntsSj);
  const totalPrice = dynamicPrice * quantity;

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen p-4 sm:p-8 bg-[url('https://www.transparenttextures.com/patterns/light-wool.png')]">
        <div className="w-full max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 text-sm font-medium mb-8 transition-colors"
          >
            <IoRestaurantOutline className="text-lg" /> 뒤로
          </button>

          <div className="space-y-10">
            {/* Top Section: Image (Left) and Details (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Hero Image (Left, larger, fills div) */}
              <div className="col-span-3 relative w-full aspect-[3/2] rounded-2xl overflow-hidden bg-gray-100 group shadow-md">
                <img
                  src={imgSrc}
                  alt={cntntsSj}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <button
                  onClick={handleShare}
                  className="absolute top-4 right-4 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md animate-fade-in"
                >
                  {copied ? "복사됨" : "공유"}
                  <FiShare2 />
                </button>
              </div>

              {/* Details (Right) */}
              <div className="col-span-2 bg-white rounded-2xl p-8 shadow-md border border-teal-100 flex flex-col justify-between h-full">
                <div className="flex-1">
                  <h1 className="text-5xl font-bold text-gray-800 mb-4 tracking-tight">
                    {cntntsSj}
                  </h1>
                  <span className="inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-full bg-teal-50 text-teal-600 mb-6 animate-fade-in">
                    지역특산품
                  </span>

                  {/* Price Info */}
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-gray-800 mb-3">
                      {dynamicPrice.toLocaleString()}원
                    </div>
                    {(fundingAmount !== undefined ||
                      fundingGoalAmount !== undefined) && (
                      <>
                        <BarProgress
                          value={fundingPercent || 0}
                          maxValue={fundingGoalAmount || 100000}
                        />
                        <div className="mt-4 text-base text-gray-600">
                          <span>
                            {Math.round((fundingAmount || 0) / 10000)}만원 펀딩
                          </span>
                          <span className="text-gray-400 mx-2">•</span>
                          <span>
                            목표 {Math.round((fundingGoalAmount || 0) / 10000)}
                            만원
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="text-base text-gray-600 space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <FiMapPin className="text-teal-600 text-lg" />
                      <span>
                        {sidoNm}
                        {sigunguNm && ` > ${sigunguNm}`}
                      </span>
                    </div>
                    {svcDt && (
                      <div className="flex items-center gap-3">
                        <FiClock className="text-teal-600 text-lg" />
                        <span>{formatDate(svcDt)}</span>
                      </div>
                    )}
                    {rdcnt && (
                      <div className="flex items-center gap-3">
                        <FiEye className="text-teal-600 text-lg" />
                        <span>조회수 {rdcnt.toLocaleString()}회</span>
                      </div>
                    )}
                  </div>

                  {/* Price Tag */}
                  <div className="flex items-center gap-3 text-base text-gray-600 mb-6">
                    <FiTag className="text-teal-600 text-lg" />
                    <span className="text-emerald-600 font-bold text-xl">
                      {dynamicPrice.toLocaleString()}원
                    </span>
                  </div>
                </div>

                {/* Purchase Button - 하단 고정 */}
                <div className="mt-auto">
                  <button
                    onClick={handlePurchaseClick}
                    className="w-full px-8 py-3 bg-emerald-600 text-white text-lg font-semibold rounded-full hover:bg-emerald-700 transition-colors flex items-center justify-center gap-3 shadow-md animate-fade-in"
                  >
                    <FiShoppingCart className="text-xl" /> 구매하기
                  </button>
                </div>
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="bg-gradient-to-b from-teal-50 to-white rounded-2xl p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <FiShoppingCart className="text-xl text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-800">수량 선택</h2>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-teal-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-gray-800">
                      수량:
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiMinus className="text-base text-teal-600" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                        max="99"
                        className="w-16 text-center text-xl font-bold border-2 border-teal-200 rounded-lg py-2 focus:border-teal-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={increaseQuantity}
                        disabled={quantity >= 99}
                        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiPlus className="text-base text-teal-600" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      총 {totalPrice.toLocaleString()}원
                    </div>
                    <div className="text-sm text-gray-500">
                      {dynamicPrice.toLocaleString()}원 × {quantity}개
                    </div>
                  </div>
                </div>

                <div className="bg-teal-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 text-lg">
                        {cntntsSj}
                      </div>
                      <div className="text-sm text-gray-600">
                        {dynamicPrice.toLocaleString()}원 × {quantity}개
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-emerald-600">
                        {totalPrice.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handlePurchaseClick}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white text-lg font-semibold rounded-full hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-md animate-fade-in"
                  >
                    <FiShoppingCart className="text-xl" />
                    구매하기 ({quantity}개)
                  </button>
                  <button
                    onClick={() => setQuantity(1)}
                    className="px-6 py-3 border border-teal-200 text-emerald-600 text-sm font-semibold rounded-full hover:bg-teal-50 transition-all duration-300 animate-fade-in"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            {cntntsCn && (
              <div className="bg-white rounded-2xl p-8 shadow-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <FiInfo className="text-teal-600 text-xl" />
                  상세 설명
                </h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                    {cntntsCn}
                  </p>
                </div>
              </div>
            )}

            {/* Additional Images */}
            {additionalImages.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  추가 이미지
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {additionalImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 group"
                    >
                      <img
                        src={img}
                        alt={`${cntntsSj} 추가 이미지 ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-white rounded-2xl p-8 shadow-md space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                추가 정보
              </h3>

              {/* Content Number */}
              <div>
                <div className="flex items-center gap-3 font-bold text-gray-800 text-lg mb-2">
                  <FiTag className="text-teal-600 text-lg" /> 콘텐츠 번호
                </div>
                <p className="text-base text-gray-600 font-mono">{cntntsNo}</p>
              </div>

              {/* Collection Date */}
              {collectYmd && (
                <div>
                  <div className="flex items-center gap-3 font-bold text-gray-800 text-lg mb-2">
                    <FiClock className="text-teal-600 text-lg" /> 수집일
                  </div>
                  <p className="text-base text-gray-600">{collectYmd}</p>
                </div>
              )}

              {/* External Link */}
              {linkUrl && (
                <div>
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-teal-600 hover:text-teal-700 transition-colors text-base font-semibold animate-fade-in"
                  >
                    <TbExternalLink className="text-lg" /> 자세히 보기
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom CSS for Animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default LocalSpecialtyDetailPage;
