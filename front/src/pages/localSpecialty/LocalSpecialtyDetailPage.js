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
} from "react-icons/fi";

const LocalSpecialtyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); // 수량 상태 추가

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
        const data = await localSpecialtyApi.getLocalSpecialtyById(id);
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
    e.target.style.display = "none";
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
          목록으로 돌아가기
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          다시 시도
        </button>
      </div>
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
  } = specialty;

  const imgSrc = imgUrl || `/${Math.floor(Math.random() * 45 + 1)}.png`;
  const additionalImages = [imgUrl2, imgUrl3].filter(Boolean);

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
              <span>목록으로</span>
            </button>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <IoRestaurantOutline className="text-[32px] text-blue-500" />
              <span>지역특산물 상세정보</span>
            </h1>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="space-y-6">
            {/* 이미지 및 기본 정보 */}
            <div>
              {/* 메인 이미지 */}
              <div className="mb-6">
                <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={cntntsSj}
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 추가 이미지들 */}
              {additionalImages.length > 0 && (
                <div className="mb-6">
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

              {/* 상세 설명 */}
              {cntntsCn && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">상세 설명</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {cntntsCn}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 상품 정보 및 구매 섹션 */}
            <div className="max-w-2xl mx-auto">
              {/* 제목 */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {cntntsSj}
              </h2>

              {/* 상품 정보 */}
              <div className="mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FiTag className="text-pink-500" />
                    상품 정보
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">상품명</span>
                      <span className="text-gray-800 font-semibold">
                        {cntntsSj}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">가격</span>
                      <span className="text-pink-600 font-bold text-xl">
                        {getProductPrice(cntntsSj).toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">지역</span>
                      <span className="text-gray-800 font-medium">
                        {sidoNm}
                        {sigunguNm && ` > ${sigunguNm}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600 font-medium">수집일</span>
                      <span className="text-gray-800">{collectYmd}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 수량 선택 */}
              <div className="mb-6">
                <div className="bg-pink-50 rounded-lg p-6 border border-pink-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FiShoppingCart className="text-pink-600 text-xl" />
                    <h3 className="text-lg font-bold text-gray-900">
                      수량 선택
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
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

                  <div className="bg-white rounded-lg p-4 border border-pink-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900">주문 요약</h4>
                      <span className="text-pink-600 font-bold text-lg">
                        {(
                          getProductPrice(cntntsSj) * quantity
                        ).toLocaleString()}
                        원
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                      className="w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      구매하기 ({quantity}개)
                    </button>
                  </div>
                </div>
              </div>

              {/* 위치 정보 */}
              <div className="mb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <TbCurrentLocation className="text-pink-500 text-lg" />
                    <span className="font-semibold text-gray-700">위치</span>
                  </div>
                  <div className="pl-6">
                    <p className="text-gray-800 font-medium text-lg">
                      {sidoNm}
                      {sigunguNm && ` > ${sigunguNm}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* 등록일 */}
              {svcDt && (
                <div className="mb-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <TbCalendar className="text-pink-500 text-lg" />
                      <span className="font-semibold text-gray-700">
                        등록일
                      </span>
                    </div>
                    <p className="pl-6 text-gray-600">{formatDate(svcDt)}</p>
                  </div>
                </div>
              )}

              {/* 콘텐츠 번호 */}
              <div className="mb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <span className="text-sm text-gray-500 font-medium">
                    콘텐츠 번호
                  </span>
                  <p className="text-gray-700 font-mono text-lg mt-1">
                    {cntntsNo}
                  </p>
                </div>
              </div>

              {/* 조회수 */}
              {rdcnt && (
                <div className="mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <span className="text-sm text-gray-500 font-medium">
                      조회수
                    </span>
                    <p className="text-gray-700 text-lg font-semibold mt-1">
                      {rdcnt.toLocaleString()}회
                    </p>
                  </div>
                </div>
              )}

              {/* 외부 링크 */}
              {linkUrl && (
                <div className="mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center justify-center font-medium"
                    >
                      <TbExternalLink className="text-lg" />
                      <span>자세히 보기</span>
                    </a>
                  </div>
                </div>
              )}

              {/* 목록으로 돌아가기 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <button
                  onClick={goBack}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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

export default LocalSpecialtyDetailPage;
