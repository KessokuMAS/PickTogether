import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import MainLayout from "../../layouts/MainLayout";
import MainMenu from "../../components/menus/Mainmenu";
import { FiTrendingUp, FiSearch } from "react-icons/fi";
import { IoRestaurantOutline, IoFilter, IoChevronDown } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { FaFire, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function CircularProgress({ value = 0, size = 44, stroke = 4 }) {
  const raw = Math.max(0, Math.round(value)); // 실제 값 (텍스트 출력용)
  const pct = Math.min(100, raw); // 게이지용 (100%까지만 표시, 넘어가면 100%로 고정)
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  let strokeColor;
  if (pct >= 80) strokeColor = "#ef4444";
  else if (pct >= 50) strokeColor = "#facc15";
  else strokeColor = "#3b82f6";

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center"
      title={`${raw}%`}
    >
      <svg width={size} height={size} className="drop-shadow-sm">
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
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span
        className="absolute font-semibold transition-colors duration-500 ease-out"
        style={{
          color: raw >= 80 ? "#b91c1c" : raw >= 50 ? "#a16207" : "#1e40af",
          fontSize: raw >= 100 ? `${size * 0.25}px` : `${size * 0.3}px`,
        }}
      >
        {raw}%
      </span>
    </div>
  );
}

const FundingCard = ({ funding }) => {
  const {
    restaurantId,
    name,
    roadAddressName,
    distance,
    fundingAmount,
    fundingGoalAmount,
    fundingPercent,
    totalFundingAmount,
    imageUrl,
    fundingEndDate,
  } = funding;

  const navigate = useNavigate();

  // ✅ NearbyKakaoResturants.js와 동일한 로직 적용
  const actualFundingAmount = (fundingAmount || 0) + (totalFundingAmount || 0);
  const percent =
    fundingGoalAmount > 0 && actualFundingAmount >= 0
      ? Math.round(
          (Number(actualFundingAmount) * 100) / Number(fundingGoalAmount)
        )
      : 0;

  const hasCustomImage = imageUrl && imageUrl.includes("uploads/");
  const displayImage = hasCustomImage
    ? `http://localhost:8080/${imageUrl}`
    : `/${restaurantId}.jpg`;

  const distLabel = Number.isFinite(Number(distance))
    ? `${Math.round(Number(distance)).toLocaleString()}m 거리`
    : "거리 정보 없음";

  const end = fundingEndDate
    ? new Date(fundingEndDate)
    : new Date(Date.now() + 14 * 86400000);
  const daysLeft = Math.max(0, Math.ceil((end - new Date()) / 86400000));

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:ring-2 hover:ring-yellow-400 transition-all duration-300 group flex flex-col border border-gray-100"
      variants={itemVariants}
    >
      <div className="relative h-48 overflow-hidden">
        {percent >= 80 && (
          <span className="absolute top-2 left-2 bg-yellow-500 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-sm">
            🔥 HOT
          </span>
        )}
        <img
          src={displayImage}
          alt={`${name} 이미지`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-yellow-600 bg-opacity-0 group-hover:bg-opacity-15 flex items-center justify-center transition-all duration-300">
          <button
            onClick={() => navigate(`/restaurant/${restaurantId}`)}
            className="px-4 py-1.5 bg-yellow-600 text-white text-sm font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-yellow-700 shadow-md"
          >
            펀딩 참여
          </button>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-gray-900 truncate flex-1 flex items-center gap-1.5">
              <IoRestaurantOutline className="text-yellow-600 text-base flex-shrink-0" />
              <span className="truncate">{name}</span>
            </h3>
            <CircularProgress value={percent} size={40} stroke={3} />
          </div>
          <p className="text-xs text-gray-600 truncate mt-1.5 font-medium">
            {roadAddressName || "-"}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1.5">
            <TbCurrentLocation className="text-yellow-600 text-base flex-shrink-0" />
            <span className="truncate">{distLabel}</span>
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span
              className={`flex items-center gap-1.5 ${
                daysLeft <= 5 ? "text-red-600 font-semibold" : "text-gray-600"
              }`}
            >
              <FaFire
                className={`${
                  daysLeft <= 5 ? "text-red-600" : "text-gray-600"
                } text-base flex-shrink-0`}
              />
              <span className="truncate">{daysLeft}일 남음</span>
            </span>
            <span className="text-green-600 font-semibold truncate">
              {actualFundingAmount.toLocaleString()}원 펀딩
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FilterComponent = ({
  sort,
  setSort,
  selectedSido,
  setSelectedSido,
  selectedSigungu,
  setSelectedSigungu,
  sidoList,
  sigunguList,
}) => (
  <motion.div
    className="mb-6 flex flex-wrap gap-2"
    variants={containerVariants}
  >
    <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-md shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
      <div className="flex items-center gap-1">
        <IoFilter className="text-yellow-600 text-sm" />
        <label className="text-xs font-semibold text-gray-700">정렬</label>
      </div>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="w-full sm:w-36 pl-2 pr-6 py-1 border border-gray-200 rounded-md  text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
      >
        <option value="default">기본</option>
        <option value="fundingHigh">펀딩액 높은 순</option>
        <option value="fundingLow">펀딩액 낮은 순</option>
        <option value="percentHigh">달성률 높은 순</option>
      </select>
      <div className="absolute right-2 pointer-events-none">
        <IoChevronDown className="text-yellow-600 text-xs" />
      </div>
    </div>
    <div className="relative flex items-center gap-1.5 bg-white p-1.5 rounded-md shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
      <select
        value={selectedSido}
        onChange={(e) => {
          setSelectedSido(e.target.value);
          setSelectedSigungu("");
        }}
        className="w-full sm:w-36 pl-2 pr-6 py-1 border border-gray-200 rounded-md text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
      >
        <option value="">전체 시도</option>
        {sidoList.map((sido) => (
          <option key={sido} value={sido}>
            {sido}
          </option>
        ))}
      </select>
      <div className="absolute right-2 pointer-events-none">
        <IoChevronDown className="text-yellow-600 text-xs" />
      </div>
    </div>
    <div className="relative flex items-center gap-1.5 bg-white p-1.5 rounded-md shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
      <select
        value={selectedSigungu}
        onChange={(e) => setSelectedSigungu(e.target.value)}
        className="w-full sm:w-36 pl-2 pr-6 py-1 border border-gray-200 rounded-md text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
        disabled={!selectedSido}
      >
        <option value="">전체 시군구</option>
        {sigunguList.map((sigungu) => (
          <option key={sigungu} value={sigungu}>
            {sigungu}
          </option>
        ))}
      </select>
      <div className="absolute right-2 pointer-events-none">
        <IoChevronDown className="text-yellow-600 text-xs" />
      </div>
    </div>
    {(selectedSido || selectedSigungu) && (
      <button
        onClick={() => {
          setSelectedSido("");
          setSelectedSigungu("");
        }}
        className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-semibold rounded-md hover:bg-yellow-600 transition shadow-sm"
      >
        필터 초기화
      </button>
    )}
  </motion.div>
);

const TrendingFundingPage = () => {
  const [fundings, setFundings] = useState([]);
  const [filteredFundings, setFilteredFundings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(48);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedSido, setSelectedSido] = useState("");
  const [selectedSigungu, setSelectedSigungu] = useState("");
  const [sort, setSort] = useState("percentHigh");
  const observerRef = useRef();
  const loadingRef = useRef();
  const navigate = useNavigate();

  const fetchTrendingFundings = async (nextPage = 0) => {
    try {
      if (nextPage === 0) setLoading(true);
      else setIsLoadingMore(true);
      setError("");

      const lat = 37.5027;
      const lng = 127.0352;
      const radius = 10000;

      const params = new URLSearchParams({
        lat,
        lng,
        radius,
        page: nextPage,
        size,
      }).toString();

      const API_BASE =
        import.meta?.env?.VITE_API_BASE || "http://localhost:8080";
      const url = `${API_BASE}/api/restaurants/nearby?${params}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const data = await res.json();

      let sortedContent = data.content || [];
      sortedContent.sort((a, b) => {
        const aProgress =
          a.fundingGoalAmount > 0 &&
          (a.fundingAmount || 0) + (a.totalFundingAmount || 0) >= 0
            ? Math.round(
                (Number((a.fundingAmount || 0) + (a.totalFundingAmount || 0)) *
                  100) /
                  Number(a.fundingGoalAmount)
              )
            : 0;
        const bProgress =
          b.fundingGoalAmount > 0 &&
          (b.fundingAmount || 0) + (b.totalFundingAmount || 0) >= 0
            ? Math.round(
                (Number((b.fundingAmount || 0) + (b.totalFundingAmount || 0)) *
                  100) /
                  Number(b.fundingGoalAmount)
              )
            : 0;
        return bProgress - aProgress;
      });

      if (nextPage === 0) setFundings(sortedContent);
      else setFundings((prev) => [...prev, ...sortedContent]);

      setHasMore(!data.last);
      setPage(data.number || nextPage);
    } catch (err) {
      console.error("API 호출 에러:", err);
      setError(`인기펀딩을 불러오는데 실패했습니다: ${err.message}`);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTrendingFundings(0);
  }, []);

  useEffect(() => {
    let filtered = [...fundings];

    if (selectedSido) {
      filtered = filtered.filter((item) => item.sidoNm === selectedSido);
    }
    if (selectedSigungu) {
      filtered = filtered.filter((item) => item.sigunguNm === selectedSigungu);
    }

    if (searchText.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.roadAddressName
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          item.sidoNm.toLowerCase().includes(searchText.toLowerCase()) ||
          item.sigunguNm.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (sort === "fundingHigh") {
      filtered.sort(
        (a, b) =>
          (b.fundingAmount || 0) +
          (b.totalFundingAmount || 0) -
          ((a.fundingAmount || 0) + (a.totalFundingAmount || 0))
      );
    } else if (sort === "fundingLow") {
      filtered.sort(
        (a, b) =>
          (a.fundingAmount || 0) +
          (a.totalFundingAmount || 0) -
          ((b.fundingAmount || 0) + (b.totalFundingAmount || 0))
      );
    } else if (sort === "percentHigh") {
      filtered.sort((a, b) => {
        const aPercent =
          a.fundingGoalAmount > 0
            ? (((a.fundingAmount || 0) + (a.totalFundingAmount || 0)) * 100) /
              a.fundingGoalAmount
            : 0;
        const bPercent =
          b.fundingGoalAmount > 0
            ? (((b.fundingAmount || 0) + (b.totalFundingAmount || 0)) * 100) /
              b.fundingGoalAmount
            : 0;
        return bPercent - aPercent;
      });
    }

    setFilteredFundings(filtered);
    setPage(0);
  }, [fundings, searchText, selectedSido, selectedSigungu, sort]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || isLoadingMore) return;
    fetchTrendingFundings(page + 1);
  }, [hasMore, loading, isLoadingMore, page]);

  useEffect(() => {
    const totalItems = filteredFundings.length;
    const currentlyShown = (page + 1) * size;
    setHasMore(currentlyShown < totalItems);
  }, [page, filteredFundings.length, size]);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loading &&
          !isLoadingMore
        ) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loadingRef.current) observer.observe(loadingRef.current);
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [hasMore, loading, isLoadingMore, loadMore]);

  const currentItems = filteredFundings.slice(0, (page + 1) * size);

  const sidoList = [...new Set(fundings.map((item) => item.sidoNm))].sort();
  const sigunguList = selectedSido
    ? [
        ...new Set(
          fundings
            .filter((item) => item.sidoNm === selectedSido)
            .map((item) => item.sigunguNm)
        ),
      ].sort()
    : [];

  const renderArrowPrev = (onClickHandler, hasPrev, label) =>
    hasPrev && (
      <button
        type="button"
        onClick={onClickHandler}
        title={label}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 text-yellow-600 p-2.5 rounded-full hover:bg-yellow-600 hover:text-white transition-all z-10 shadow-sm"
      >
        <FaChevronLeft className="text-lg" />
      </button>
    );

  const renderArrowNext = (onClickHandler, hasNext, label) =>
    hasNext && (
      <button
        type="button"
        onClick={onClickHandler}
        title={label}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 text-yellow-600 p-2.5 rounded-full hover:bg-yellow-600 hover:text-white transition-all z-10 shadow-sm"
      >
        <FaChevronRight className="text-lg" />
      </button>
    );

  if (loading && page === 0) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen ">
          <div className="text-center">
            <svg
              className="animate-spin h-6 w-6 text-yellow-600 mx-auto mb-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-600 text-sm">
              인기 펀딩 데이터를 불러오는 중...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <MainMenu />
      <div className="p-5 sm:p-6 md:p-8 pt-40 h-auto  bg-[url('https://www.transparenttextures.com/patterns/light-wool.png')]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[3fr,1fr] gap-6 pt-3 lg:pt-44">
          <div>
            <motion.div
              className="mb-8 text-center bg-gradient-to-b from-yellow-100 to-white p-8 rounded-xl shadow-lg pt-42"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="flex items-center gap-2 mb-4 justify-center"
                variants={itemVariants}
              >
                <Link
                  to="/main"
                  className="inline-flex items-center gap-1.5 text-gray-600 hover:text-yellow-600 text-xs font-medium transition-all duration-300 hover:scale-105"
                ></Link>
              </motion.div>
              <motion.h1
                className="text-3xl font-bold text-yellow-800 mb-3 tracking-tight"
                variants={itemVariants}
              >
                지금 뜨는 펀딩 맛집!
              </motion.h1>
              <motion.p
                className="text-gray-600 max-w-[600px] mx-auto text-base font-medium"
                variants={itemVariants}
              >
                인기 급상승 중인 맛집 펀딩에 참여해 특별한 경험을 누려보세요!
              </motion.p>
              <motion.div
                className="w-full max-w-[600px] mx-auto mt-5 rounded-xl shadow-xl overflow-hidden"
                variants={itemVariants}
              >
                <Carousel
                  autoPlay
                  infiniteLoop
                  showThumbs={false}
                  showStatus={false}
                  showIndicators={false}
                  interval={3000}
                  transitionTime={600}
                  className="rounded-xl"
                  renderArrowPrev={renderArrowPrev}
                  renderArrowNext={renderArrowNext}
                >
                  {filteredFundings.length > 0 ? (
                    filteredFundings.slice(0, 5).map((funding) => (
                      <div key={funding.restaurantId} className="relative">
                        <img
                          src={
                            funding.imageUrl &&
                            funding.imageUrl.includes("uploads/")
                              ? `http://localhost:8080/${funding.imageUrl}`
                              : `/${funding.restaurantId}.jpg`
                          }
                          alt={`${funding.name} 배너`}
                          className="w-full h-[280px] object-cover brightness-95 transition-all duration-300"
                        />
                        {(((funding.fundingAmount || 0) +
                          (funding.totalFundingAmount || 0)) *
                          100) /
                          funding.fundingGoalAmount >=
                          80 && (
                          <span className="absolute top-3 right-3 bg-yellow-500 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-sm">
                            🔥 Hot!
                          </span>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent p-4">
                          <p className="text-white text-base font-semibold truncate">
                            {funding.name} -{" "}
                            {Math.round(
                              (((funding.fundingAmount || 0) +
                                (funding.totalFundingAmount || 0)) *
                                100) /
                                funding.fundingGoalAmount
                            )}
                            % 달성
                          </p>
                          <button
                            onClick={() =>
                              navigate(`/restaurant/${funding.restaurantId}`)
                            }
                            className="mt-2 px-4 py-1.5 bg-yellow-600 text-white text-xs font-semibold rounded-full hover:bg-yellow-700 transition shadow-sm"
                          >
                            펀딩 참여
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative">
                      <img
                        src="/funding-hero.png"
                        alt="인기 펀딩 소개"
                        className="w-full h-[280px] object-cover brightness-95"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent p-4">
                        <p className="text-white text-base font-semibold">
                          지금 인기 펀딩에 참여하세요!
                        </p>
                        <button
                          className="mt-2 px-4 py-1.5 bg-yellow-600 text-white text-xs font-semibold rounded-full hover:bg-yellow-700 transition shadow-sm"
                          onClick={() => navigate("/funding")}
                        >
                          자세히 보기
                        </button>
                      </div>
                    </div>
                  )}
                </Carousel>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex flex-col justify-center items-center mb-4"
              variants={itemVariants}
            >
              <div className="relative w-full max-w-[1000px]">
                <input
                  type="text"
                  placeholder="인기 맛집을 검색하세요"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-800 placeholder-gray-400 text-sm"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-600 cursor-pointer transition-colors">
                  <FiSearch size={18} />
                </div>
              </div>
            </motion.div>

            <motion.h2
              className="flex flex-col gap-1 text-lg font-bold text-yellow-800"
              variants={itemVariants}
            >
              <span className="flex items-center gap-1.5">
                <FiTrendingUp className="text-xl flex-shrink-0" />
                <span className="truncate">인기 펀딩 맛집</span>
              </span>
              <span className="text-gray-600 text-[14px] truncate">
                달성률이 높은 펀딩을 확인해보세요 !
              </span>
            </motion.h2>

            <FilterComponent
              sort={sort}
              setSort={setSort}
              selectedSido={selectedSido}
              setSelectedSido={setSelectedSido}
              selectedSigungu={selectedSigungu}
              setSelectedSigungu={setSelectedSigungu}
              sidoList={sidoList}
              sigunguList={sigunguList}
            />

            <motion.div
              className="mb-4 p-2.5 rounded-md shadow-sm"
              variants={itemVariants}
            >
              <p className="text-xs text-gray-600 truncate">
                총{" "}
                <span className="font-semibold text-yellow-700">
                  {filteredFundings.length}
                </span>{" "}
                개의 인기 펀딩이 진행 중입니다.
                {searchText && ` (검색어: "${searchText}")`}
                {selectedSido &&
                  ` (지역: ${selectedSido}${
                    selectedSigungu ? ` > ${selectedSigungu}` : ""
                  })`}
              </p>
            </motion.div>

            {error ? (
              <motion.div className="text-center py-8" variants={itemVariants}>
                <p className="text-red-500 text-base mb-3">{error}</p>
                <button
                  onClick={() => fetchTrendingFundings(0)}
                  className="px-3 py-1.5 bg-yellow-600 text-white text-xs font-semibold rounded-md hover:bg-yellow-700 transition shadow-sm"
                >
                  다시 시도
                </button>
              </motion.div>
            ) : currentItems.length === 0 ? (
              <motion.div className="text-center py-16" variants={itemVariants}>
                <div className="text-5xl mb-3">🍴</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  인기 펀딩이 없습니다
                </h3>
                <p className="text-gray-600 text-sm">
                  새로운 펀딩을 기다려주세요!
                </p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
                  variants={containerVariants}
                >
                  {currentItems.map((funding) => (
                    <FundingCard
                      key={funding.restaurantId || funding.id}
                      funding={funding}
                    />
                  ))}
                </motion.div>
                {hasMore && (
                  <motion.div
                    ref={loadingRef}
                    className="flex justify-center py-6"
                    variants={itemVariants}
                  >
                    {isLoadingMore && (
                      <div className="text-center">
                        <svg
                          className="animate-spin h-5 w-5 text-yellow-600 mx-auto mb-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <p className="text-xs text-gray-600">
                          더 많은 인기 펀딩을 불러오는 중...
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>
          <div className="hidden lg:block">
            <motion.div
              className="bg-white rounded-xl shadow-lg p-5 sticky top-5 max-h-[calc(100vh-1.25rem)] overflow-auto pt-42"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h3
                className="text-lg font-semibold text-yellow-800 mb-3 truncate"
                variants={itemVariants}
              >
                인기 지역
              </motion.h3>
              <motion.ul className="space-y-2" variants={containerVariants}>
                {sidoList.slice(0, 3).map((sido) => (
                  <motion.li key={sido} variants={itemVariants}>
                    <button
                      className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-md transition flex items-center gap-2"
                      onClick={() => {
                        setSelectedSido(sido);
                        setSelectedSigungu("");
                      }}
                    >
                      <TbCurrentLocation className="text-yellow-600 text-base flex-shrink-0" />
                      <span className="truncate">{sido}</span>
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div
                className="mt-5 pt-3 border-t border-gray-200"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold text-yellow-800 mb-3 truncate">
                  오늘의 핫딜
                </h3>
                <div className="relative rounded-md overflow-hidden shadow-md">
                  <img
                    src="/45.JPG"
                    alt="추천 펀딩"
                    className="w-full h-36 object-cover brightness-95"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/85 to-transparent">
                    <p className="text-white text-xs font-semibold truncate">
                      오늘의 인기 펀딩!
                    </p>
                    <button
                      className="mt-1.5 px-3 py-1 bg-yellow-600 text-white text-xs font-medium rounded-full hover:bg-yellow-700 transition shadow-sm"
                      onClick={() => navigate("/funding")}
                    >
                      바로 보기
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrendingFundingPage;
