import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { localSpecialtyApi } from "../../api/localSpecialtyApi";
import { IoRestaurantOutline } from "react-icons/io5";
import { TbExternalLink, TbCurrentLocation } from "react-icons/tb";
import {
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiTag,
  FiEye,
  FiShare2,
  FiMapPin,
  FiClock,
} from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { motion } from "framer-motion";
import MainLayout from "../../layouts/MainLayout";

// Animation variants from LocalSpecialtyPage
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// Bar Progress Component
const BarProgress = ({ value = 0, maxValue = 100 }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const barColor = pct >= 80 ? "#ef4444" : pct >= 50 ? "#facc15" : "#3b82f6";

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="flex justify-between items-center text-xs font-medium text-gray-700">
        <span>{pct}% 달성</span>
        <span>목표 {maxValue.toLocaleString()}원</span>
      </div>
    </div>
  );
};

// Related Specialty Card Component
const RelatedSpecialtyCard = ({ specialty }) => {
  const {
    cntntsSj,
    areaNm,
    imgUrl,
    sidoNm,
    sigunguNm,
    cntntsNo,
    fundingGoalAmount,
    fundingAmount,
    totalFundingAmount,
  } = specialty;

  const navigate = useNavigate();

  const actualFundingAmount = (fundingAmount || 0) + (totalFundingAmount || 0);
  const actualPercent =
    fundingGoalAmount > 0
      ? Math.round((actualFundingAmount * 100) / fundingGoalAmount)
      : 0;

  const fundingEndDate = new Date(new Date().getFullYear(), 8, 30); // Fixed to Sep 30
  const daysLeft = Math.max(
    0,
    Math.ceil((fundingEndDate - new Date()) / 86400000)
  );

  // 카테고리별 폴백 이미지 매핑
  const getCategoryImage = (productName) => {
    const name = productName?.toLowerCase() || "";
    if (name.includes("한우") || name.includes("소고기"))
      return "/public/beef.jpg";
    if (name.includes("인삼") || name.includes("산양삼"))
      return "/public/ginseng.jpg";
    if (name.includes("쌀") || name.includes("미") || name.includes("벼"))
      return "/public/rice.jpg";
    if (name.includes("참외")) return "/public/chamoe.jpg";
    if (
      name.includes("사과") ||
      name.includes("배") ||
      name.includes("포도") ||
      name.includes("감") ||
      name.includes("자두") ||
      name.includes("수박") ||
      name.includes("메론")
    )
      return "/public/fruit.jpg";
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
      return "/public/vegetable.jpg";
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
      return "/public/seafood.jpg";
    if (name.includes("벌꿀") || name.includes("꿀"))
      return "/public/honey.jpg";
    if (
      name.includes("버섯") ||
      name.includes("표고") ||
      name.includes("느타리")
    )
      return "/public/mushroom.jpg";
    if (name.includes("고구마") || name.includes("감자"))
      return "/public/potato.jpg";
    if (name.includes("딸기")) return "/public/strawberry.jpg";
    return `/public/${(cntntsNo % 45) + 1}.jpg`; // 기본 폴백 이미지
  };

  const handleImageError = (e) => {
    e.target.src = getCategoryImage(cntntsSj);
  };

  const imgSrc = imgUrl || getCategoryImage(cntntsSj);

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:ring-2 hover:ring-orange-300 transition-all duration-300 group flex flex-col"
      variants={itemVariants}
    >
      <div className="relative h-52 overflow-hidden">
        {actualPercent >= 80 && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full z-10 shadow-sm">
            🔥 Hot Funding
          </span>
        )}
        <img
          src={imgSrc}
          alt={`${cntntsSj} 이미지`}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-orange-600 bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-300">
          <button
            onClick={() => navigate(`/local-specialty/${cntntsNo}`)}
            className="px-5 py-2 bg-orange-600 text-white text-xs font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-orange-700 shadow-md"
          >
            펀딩 참여
          </button>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-800 truncate flex items-center gap-2">
              <IoRestaurantOutline className="text-orange-600 text-base" />
              {cntntsSj}
            </h3>
            <div
              className="relative flex items-center justify-center"
              title={`${actualPercent}%`}
            >
              <svg width={36} height={36} className="drop-shadow-sm">
                <circle
                  cx={18}
                  cy={18}
                  r={16}
                  fill="none"
                  strokeWidth={3}
                  className="text-gray-200"
                  stroke="currentColor"
                />
                <circle
                  cx={18}
                  cy={18}
                  r={16}
                  fill="none"
                  strokeWidth={3}
                  stroke={
                    actualPercent >= 80
                      ? "#ef4444"
                      : actualPercent >= 50
                      ? "#facc15"
                      : "#3b82f6"
                  }
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 16}
                  strokeDashoffset={
                    2 * Math.PI * 16 * (1 - actualPercent / 100)
                  }
                  transform="rotate(-90 18 18)"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <span
                className="absolute font-semibold text-[10px]"
                style={{
                  color:
                    actualPercent >= 80
                      ? "#b91c1c"
                      : actualPercent >= 50
                      ? "#a16207"
                      : "#1e40af",
                }}
              >
                {actualPercent}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 truncate mt-2 font-medium">
            {areaNm || `${sidoNm} ${sigunguNm || ""}`}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-2 mt-2">
            <TbCurrentLocation className="text-orange-600 text-base" />
            {sidoNm} {sigunguNm && `> ${sigunguNm}`}
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span
              className={`flex items-center gap-2 ${
                daysLeft <= 5 ? "text-red-600 font-semibold" : "text-gray-600"
              }`}
            >
              <FaFire
                className={`${
                  daysLeft <= 5 ? "text-red-600" : "text-gray-600"
                } text-base`}
              />
              {daysLeft}일 남음
            </span>
            <span className="text-green-600 font-semibold">
              {actualFundingAmount.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LocalSpecialtyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [specialty, setSpecialty] = useState(null);
  const [relatedSpecialties, setRelatedSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  // URL 쿼리 파라미터에서 검색어 추출
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("search")?.toLowerCase() || "";

  // 상품명 기반으로 동적 가격 계산 및 카테고리 추출
  const getProductPrice = useCallback((productName) => {
    const name = productName?.toLowerCase() || "";
    if (name.includes("한우") || name.includes("소고기")) return 150000;
    if (name.includes("인삼") || name.includes("산양삼")) return 80000;
    if (name.includes("쌀") || name.includes("미") || name.includes("벼"))
      return 25000;
    if (name.includes("참외")) return 20000;
    if (
      name.includes("사과") ||
      name.includes("배") ||
      name.includes("포도") ||
      name.includes("감") ||
      name.includes("자두") ||
      name.includes("수박") ||
      name.includes("메론")
    )
      return 20000;
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
    if (name.includes("벌꿀") || name.includes("꿀")) return 25000;
    if (
      name.includes("버섯") ||
      name.includes("표고") ||
      name.includes("느타리")
    )
      return 18000;
    if (name.includes("고구마") || name.includes("감자")) return 15000;
    if (name.includes("딸기")) return 18000;
    return 20000;
  }, []);

  // 상품명에서 카테고리 키워드 추출
  const getCategory = useCallback((productName) => {
    const name = productName?.toLowerCase() || "";
    if (name.includes("한우") || name.includes("소고기")) return "한우/소고기";
    if (name.includes("인삼") || name.includes("산양삼")) return "인삼";
    if (name.includes("쌀") || name.includes("미") || name.includes("벼"))
      return "쌀";
    if (name.includes("참외")) return "참외";
    if (
      name.includes("사과") ||
      name.includes("배") ||
      name.includes("포도") ||
      name.includes("감") ||
      name.includes("자두") ||
      name.includes("수박") ||
      name.includes("메론")
    )
      return "과일";
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
      return "채소";
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
      return "해산물";
    if (name.includes("벌꿀") || name.includes("꿀")) return "꿀";
    if (
      name.includes("버섯") ||
      name.includes("표고") ||
      name.includes("느타리")
    )
      return "버섯";
    if (name.includes("고구마") || name.includes("감자")) return "고구마/감자";
    if (name.includes("딸기")) return "딸기";
    return "기타";
  }, []);

  // 상품명에서 세부 키워드(예: 참외) 추출
  const getSubCategory = useCallback(
    (productName) => {
      const name = productName?.toLowerCase() || "";
      if (name.includes("참외")) return "참외";
      return getCategory(productName); // 기본적으로 카테고리로 폴백
    },
    [getCategory]
  );

  // 수량 증가
  const increaseQuantity = () => setQuantity((prev) => Math.min(prev + 1, 99));

  // 수량 감소
  const decreaseQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

  // 수량 직접 입력
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 99) {
      setQuantity(value);
    }
  };

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) {
          throw new Error("잘못된 상품 ID입니다.");
        }
        // 현재 상품 가져오기
        const specialtyData =
          await localSpecialtyApi.getLocalSpecialtyByCntntsNo(id);
        console.log(
          "Fetched specialty data:",
          JSON.stringify(specialtyData, null, 2)
        );
        if (!specialtyData || Object.keys(specialtyData).length === 0) {
          throw new Error("상품 데이터가 비어 있습니다.");
        }
        setSpecialty(specialtyData);

        // 관련 특산품 가져오기
        const allSpecialties = await localSpecialtyApi.getAllLocalSpecialties();
        const currentSubCategory =
          searchTerm || getSubCategory(specialtyData.cntntsSj);
        const related = allSpecialties
          .filter((item) => item.cntntsNo !== specialtyData.cntntsNo) // 현재 상품 제외
          .filter((item) =>
            currentSubCategory === "참외"
              ? item.cntntsSj.toLowerCase().includes("참외")
              : getCategory(item.cntntsSj) ===
                getCategory(specialtyData.cntntsSj)
          )
          .slice(0, 4); // 최대 4개
        setRelatedSpecialties(related);
        console.log("Related specialties:", related);

        setError(null);
      } catch (err) {
        setError(err.message || "데이터를 불러오는데 실패했습니다.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, getCategory, getSubCategory, searchTerm]);

  // 이미지 에러 처리
  const handleImageError = (e) => {
    const fallbackIndex = (parseInt(id) % 45) + 1;
    console.log("Image error, using fallback:", `/public/${fallbackIndex}.jpg`);
    e.target.src = `/public/${fallbackIndex}.jpg`;
  };

  // 날짜 포맷팅
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

  // 뒤로 가기
  const goBack = () => navigate("/local-specialty");

  // 공유 기능
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

  // 구매 버튼 클릭
  const handlePurchaseClick = () => {
    if (quantity <= 0) {
      alert("수량을 선택해주세요");
      return;
    }
    const dynamicPrice = getProductPrice(specialty?.cntntsSj || "");
    navigate(
      `/payment?type=specialty&specialtyId=${
        specialty?.cntntsNo || ""
      }&specialtyName=${
        specialty?.cntntsSj || ""
      }&specialtyPrice=${dynamicPrice}&specialtyQuantity=${quantity}&sidoNm=${encodeURIComponent(
        specialty?.sidoNm || ""
      )}&sigunguNm=${encodeURIComponent(specialty?.sigunguNm || "")}`
    );
  };

  // 로딩 상태
  if (loading) {
    return (
      <MainLayout>
        <div className="bg-orange-50 min-h-screen p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="min-h-[400px] bg-gray-100 rounded-xl"></div>
                <div className="space-y-4">
                  <div className="h-8 w-3/4 bg-gray-100 rounded-lg"></div>
                  <div className="h-4 w-full bg-gray-100 rounded-lg"></div>
                  <div className="h-4 w-1/2 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // 에러 또는 데이터 없음
  if (error || !specialty) {
    return (
      <MainLayout>
        <div className="bg-orange-50 min-h-screen p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <p className="text-red-600 text-center text-sm font-medium py-16">
              {error || "지역특산물을 찾을 수 없습니다."}
            </p>
            <div className="text-center space-x-4">
              <button
                onClick={goBack}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-md text-sm"
              >
                목록으로 돌아가기
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md text-sm"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // specialty 객체 구조 분해
  const {
    cntntsSj = "알 수 없는 상품",
    areaNm = "",
    imgUrl = "",
    sidoNm = "",
    sigunguNm = "",
    svcDt = "",
    linkUrl = "",
    cntntsNo = "",
    cntntsCn = "",
    rdcnt = 0,
    imgUrl2 = "",
    imgUrl3 = "",
    collectYmd = "",
    fundingGoalAmount = 0,
    fundingAmount = 0,
    fundingPercent = 0,
  } = specialty || {};

  // 이미지 소스 및 추가 이미지
  const fallbackIndex = (parseInt(cntntsNo) % 45) + 1;
  const imgSrc = imgUrl || `/public/${fallbackIndex}.jpg`;
  const additionalImages = [imgUrl2, imgUrl3].filter(Boolean);
  const dynamicPrice = getProductPrice(cntntsSj);
  const totalPrice = dynamicPrice * quantity;

  console.log("Rendering with specialty:", specialty);

  return (
    <MainLayout>
      <div className="bg-orange-50 min-h-screen p-4 sm:p-6 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/light-wool.png')]">
        <div className="w-full max-w-7xl mx-auto">
          {/* 뒤로 가기 버튼 */}
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 text-xs font-medium mb-6 transition-all duration-300 hover:scale-105"
          >
            <IoRestaurantOutline className="text-base" /> 뒤로
          </button>

          <div className="space-y-8">
            {/* 상단 섹션: 이미지(좌) + 세부 정보(우) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 메인 이미지 */}
              <div className="relative w-full min-h-[400px] rounded-xl overflow-hidden bg-gray-100 group shadow-lg">
                <img
                  src={imgSrc}
                  alt={cntntsSj}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <button
                  onClick={handleShare}
                  className="absolute top-4 right-4 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full hover:bg-orange-600 transition-all duration-300 flex items-center gap-2 shadow-md transform hover:scale-105"
                >
                  {copied ? "복사됨" : "공유"}
                  <FiShare2 className="text-sm" />
                </button>
              </div>

              {/* 세부 정보 */}
              <div className="bg-white rounded-xl p-5 shadow-lg border border-orange-100 flex flex-col justify-between min-h-[400px]">
                <div className="flex-1 space-y-4">
                  {/* 상품명 및 태그 */}
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 tracking-tight">
                      {cntntsSj}
                    </h1>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-600 mb-3 transition-all duration-300">
                      지역특산품
                    </span>
                  </div>

                  {/* 가격 정보 */}
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                      {dynamicPrice.toLocaleString()}원
                    </div>
                    {(fundingAmount !== undefined ||
                      fundingGoalAmount !== undefined) && (
                      <div>
                        <BarProgress
                          value={fundingPercent || 0}
                          maxValue={fundingGoalAmount || 100000}
                        />
                        <div className="mt-2 text-xs text-gray-600">
                          <span>
                            {Math.round((fundingAmount || 0) / 10000)}만원 펀딩
                          </span>
                          <span className="text-gray-400 mx-2">•</span>
                          <span>
                            목표 {Math.round((fundingGoalAmount || 0) / 10000)}
                            만원
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 기본 정보 */}
                  <div className="text-xs text-gray-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-orange-600 text-sm" />
                      <span>
                        {sidoNm}
                        {sigunguNm && ` > ${sigunguNm}`}
                      </span>
                    </div>
                    {svcDt && (
                      <div className="flex items-center gap-2">
                        <FiClock className="text-orange-600 text-sm" />
                        <span>{formatDate(svcDt)}</span>
                      </div>
                    )}
                    {rdcnt > 0 && (
                      <div className="flex items-center gap-2">
                        <FiEye className="text-orange-600 text-sm" />
                        <span>조회수 {rdcnt.toLocaleString()}회</span>
                      </div>
                    )}
                  </div>

                  {/* 가격 태그 */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FiTag className="text-orange-600 text-sm" />
                    <span className="text-orange-600 font-bold text-base">
                      {dynamicPrice.toLocaleString()}원
                    </span>
                  </div>

                  {/* 수량 선택 */}
                  <div className="pt-3 border-t border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FiShoppingCart className="text-base text-orange-600" />
                      <h2 className="text-base font-bold text-gray-800">
                        수량 선택
                      </h2>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-800">
                          수량:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={decreaseQuantity}
                            disabled={quantity <= 1}
                            className="w-6 h-6 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiMinus className="text-xs text-orange-600" />
                          </button>
                          <input
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            min="1"
                            max="99"
                            className="w-8 text-center text-sm font-bold border-2 border-orange-200 rounded-lg py-0.5 focus:border-orange-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={increaseQuantity}
                            disabled={quantity >= 99}
                            className="w-6 h-6 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiPlus className="text-xs text-orange-600" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-orange-600">
                          총 {totalPrice.toLocaleString()}원
                        </div>
                        <div className="text-xs text-gray-500">
                          {dynamicPrice.toLocaleString()}원 × {quantity}개
                        </div>
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2 mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800 text-xs">
                            {cntntsSj}
                          </div>
                          <div className="text-xs text-gray-600">
                            {dynamicPrice.toLocaleString()}원 × {quantity}개
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-orange-600">
                            {totalPrice.toLocaleString()}원
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setQuantity(1)}
                      className="px-2 py-1 border border-orange-200 text-orange-600 text-xs font-semibold rounded-full hover:bg-orange-100 transition-all duration-300 transform hover:scale-105"
                    >
                      초기화
                    </button>
                  </div>

                  {/* 자세히 보기 버튼 */}
                  {linkUrl && (
                    <div className="pt-3 border-t border-orange-100">
                      <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-all duration-300 text-xs font-semibold transform hover:scale-105"
                      >
                        <TbExternalLink className="text-sm" /> 자세히 보기
                      </a>
                    </div>
                  )}
                </div>

                {/* 구매 버튼 */}
                <div className="mt-4">
                  <button
                    onClick={handlePurchaseClick}
                    className="w-full px-5 py-2 bg-gray-500 text-white text-sm font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-300 flex items-center justify-center gap-2 shadow-md"
                  >
                    <FiShoppingCart className="text-base" /> 펀딩 참여 (
                    {quantity}개)
                  </button>
                </div>
              </div>
            </div>

            {/* 관련 특산품 섹션 */}
            {relatedSpecialties.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl p-5 shadow-lg"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.h3
                  className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"
                  variants={itemVariants}
                >
                  <IoRestaurantOutline className="text-orange-600 text-xl" />
                  관련 특산품
                </motion.h3>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  variants={containerVariants}
                >
                  {relatedSpecialties.map((specialty) => (
                    <RelatedSpecialtyCard
                      key={specialty.cntntsNo}
                      specialty={specialty}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* 추가 이미지 */}
            {additionalImages.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl p-5 shadow-lg"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.h3
                  className="text-lg sm:text-xl font-bold text-gray-800 mb-4"
                  variants={itemVariants}
                >
                  추가 이미지
                </motion.h3>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  variants={containerVariants}
                >
                  {additionalImages.map((img, index) => (
                    <motion.div
                      key={index}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 group"
                      variants={itemVariants}
                    >
                      <img
                        src={img}
                        alt={`${cntntsSj} 추가 이미지 ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        {/* 커스텀 CSS */}
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
