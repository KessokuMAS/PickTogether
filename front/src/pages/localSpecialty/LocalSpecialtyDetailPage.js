import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { localSpecialtyApi } from "../../api/localSpecialtyApi";
import { IoRestaurantOutline, IoArrowBack } from "react-icons/io5";
import { TbCurrentLocation, TbCalendar, TbExternalLink } from "react-icons/tb";
import MainMenu from "../../components/menus/Mainmenu";
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
} from "react-icons/fi";

// Circular Progress Component (RestaurantDetailPage에서 가져옴)
const CircularProgress = ({ value = 0, size = 60, stroke = 4 }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  const strokeColor = pct >= 80 ? "#ef4444" : pct >= 50 ? "#facc15" : "#3b82f6";

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center"
      title={`${pct}%`}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="text-gray-200"
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={strokeColor}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-colors duration-500 ease-out"
        />
      </svg>
      <span
        className="absolute font-bold transition-colors duration-500 ease-out"
        style={{
          fontSize: `${size * 0.3}px`,
          color: pct >= 80 ? "#b91c1c" : pct >= 50 ? "#a16207" : "#1e40af",
        }}
      >
        {pct}%
      </span>
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
    e.target.src = `/${fallbackIndex}.jpg`;
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

  if (loading) {
    return (
      <>
        <MainMenu />
        <div className="p-4 flex justify-center bg-white min-h-screen pt-[200px]">
          <div className="w-full max-w-[1200px]">
            <div className="animate-pulse">
              <div className="w-full h-64 bg-gray-200 rounded-lg" />
              <div className="mt-4 space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !specialty) {
    return (
      <>
        <MainMenu />
        <div className="p-4 flex justify-center bg-white min-h-screen pt-[200px]">
          <div className="w-full max-w-[1200px]">
            <p className="text-red-500 text-center py-20">
              {error || "지역특산물을 찾을 수 없습니다."}
            </p>
            <div className="text-center">
              <button
                onClick={goBack}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mr-4"
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
      </>
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
  const imgSrc = imgUrl || `/${fallbackIndex}.jpg`;
  const additionalImages = [imgUrl2, imgUrl3].filter(Boolean);

  return (
    <>
      <MainMenu />
      <div className="p-4 flex justify-center bg-white min-h-screen pt-[200px]">
        <div className="w-full max-w-[1200px]">
          {/* 뒤로가기 버튼 */}
          <button
            onClick={goBack}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mb-4"
          >
            <IoRestaurantOutline /> 뒤로
          </button>

          <div className="space-y-6">
            {/* Hero Section - 메인 이미지 */}
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 group">
              <img
                src={imgSrc}
                alt={cntntsSj}
                onError={handleImageError}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 text-white font-bold rounded bg-black bg-opacity-80 hover:bg-opacity-100 transition"
                >
                  {copied ? "링크 복사됨" : "공유하기"}
                </button>
              </div>
            </div>

            {/* Specialty Info - 특산물 정보 */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-black">{cntntsSj}</h1>
                {fundingPercent !== undefined && (
                  <CircularProgress value={fundingPercent} />
                )}
              </div>

              <div className="mt-4 text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <TbCurrentLocation />
                  <span>
                    {sidoNm}
                    {sigunguNm && ` > ${sigunguNm}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiTag />
                  <span className="text-green-600 font-bold text-lg">
                    {getProductPrice(cntntsSj).toLocaleString()}원
                  </span>
                </div>
                {svcDt && (
                  <div className="flex items-center gap-2">
                    <TbCalendar />
                    <span>{formatDate(svcDt)}</span>
                  </div>
                )}
              </div>

              {/* Funding Info - 펀딩 정보 */}
              {(fundingAmount !== undefined ||
                fundingGoalAmount !== undefined) && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {Math.round((fundingAmount || 0) / 10000)}만원 펀딩
                    </span>
                    <span>
                      목표 {Math.round((fundingGoalAmount || 0) / 10000)}만원
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 상세 설명 */}
            {cntntsCn && (
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FiInfo />
                  상세 설명
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {cntntsCn}
                  </p>
                </div>
              </div>
            )}

            {/* 추가 이미지들 */}
            {additionalImages.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">추가 이미지</h3>
                <div className="grid grid-cols-2 gap-4">
                  {additionalImages.map((img, index) => (
                    <div
                      key={index}
                      className="h-48 bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <img
                        src={img}
                        alt={`${cntntsSj} 추가 이미지 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 수량 선택 및 구매 */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiShoppingCart className="text-xl" />
                <h2 className="text-lg font-bold">구매하기</h2>
              </div>

              {/* 수량 선택 */}
              <div className="mb-4">
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-medium">수량:</span>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-2 bg-white">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${
                        quantity <= 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <FiMinus className="text-sm" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max="99"
                      className="w-16 text-center border-none outline-none text-lg font-medium bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= 99}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${
                        quantity >= 99
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <FiPlus className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* 주문 요약 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">주문 요약</h4>
                    <span className="text-green-600 font-bold text-lg">
                      {(getProductPrice(cntntsSj) * quantity).toLocaleString()}
                      원
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {cntntsSj}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getProductPrice(cntntsSj).toLocaleString()}원 ×{" "}
                          {quantity}개
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const dynamicPrice = getProductPrice(cntntsSj);
                      navigate(
                        `/payment?type=specialty&specialtyId=${cntntsNo}&specialtyName=${cntntsSj}&specialtyPrice=${dynamicPrice}&specialtyQuantity=${quantity}&sidoNm=${encodeURIComponent(
                          sidoNm || ""
                        )}&sigunguNm=${encodeURIComponent(sigunguNm || "")}`
                      );
                    }}
                    className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    구매하기 ({quantity}개)
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Info - 추가 정보 */}
            <div className="bg-white border border-gray-300 rounded-lg p-6 space-y-4">
              {/* 콘텐츠 번호 */}
              <div>
                <span className="text-sm text-gray-500 font-medium">
                  콘텐츠 번호
                </span>
                <p className="text-gray-700 font-mono text-lg mt-1">
                  {cntntsNo}
                </p>
              </div>

              {/* 조회수 */}
              {rdcnt && (
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    <FiEye /> 조회수
                  </div>
                  <p className="text-gray-600">{rdcnt.toLocaleString()}회</p>
                </div>
              )}

              {/* 수집일 */}
              {collectYmd && (
                <div>
                  <span className="text-sm text-gray-500 font-medium">
                    수집일
                  </span>
                  <p className="text-gray-700">{collectYmd}</p>
                </div>
              )}

              {/* 외부 링크 */}
              {linkUrl && (
                <div>
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <TbExternalLink /> 자세히 보기
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocalSpecialtyDetailPage;
