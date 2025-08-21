import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { IoRestaurantOutline, IoFilter, IoChevronDown } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { FiSearch } from "react-icons/fi";
import { FaFire, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { localSpecialtyApi } from "../../api/localSpecialtyApi";
import { useNavigate } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { motion, AnimatePresence } from "framer-motion";
import Mainmenu from "../../components/menus/Mainmenu";

// Animation variants from ForOneUserIntro
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

// Circular Progress Component (unchanged)
function CircularProgress({ value = 0, size = 50, stroke = 4 }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
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
      title={`${pct}%`}
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
        className="absolute font-semibold text-sm transition-colors duration-500 ease-out"
        style={{
          color: pct >= 80 ? "#b91c1c" : pct >= 50 ? "#a16207" : "#1e40af",
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

const LocalSpecialtyPage = () => {
  const [localSpecialties, setLocalSpecialties] = useState([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedSido, setSelectedSido] = useState("");
  const [selectedSigungu, setSelectedSigungu] = useState("");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(0);
  const [size] = useState(24);
  const [hasMore, setHasMore] = useState(false);
  const observerRef = useRef();
  const loadingRef = useRef();
  const navigate = useNavigate();

  // Fetch data
  const loadLocalSpecialties = useCallback(async () => {
    try {
      setLoading(true);
      const data = await localSpecialtyApi.getAllLocalSpecialties();
      setLocalSpecialties(data);
      setError(null);
    } catch (err) {
      setError("지역특산물 데이터를 불러오는데 실패했습니다.");
      console.error("데이터 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocalSpecialties();
  }, [loadLocalSpecialties]);

  // Filter and sort
  useEffect(() => {
    let filtered = [...localSpecialties];

    // Apply region filters
    if (selectedSido) {
      filtered = filtered.filter((item) => item.sidoNm === selectedSido);
    }
    if (selectedSigungu) {
      filtered = filtered.filter((item) => item.sigunguNm === selectedSigungu);
    }

    // Apply search
    if (searchText.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.cntntsSj.toLowerCase().includes(searchText.toLowerCase()) ||
          item.areaNm.toLowerCase().includes(searchText.toLowerCase()) ||
          item.sidoNm.toLowerCase().includes(searchText.toLowerCase()) ||
          item.sigunguNm.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply sorting
    if (sort === "fundingHigh") {
      filtered.sort(
        (a, b) =>
          (b.fundingAmount + b.totalFundingAmount || 0) -
          (a.fundingAmount + a.totalFundingAmount || 0)
      );
    } else if (sort === "fundingLow") {
      filtered.sort(
        (a, b) =>
          (a.fundingAmount + a.totalFundingAmount || 0) -
          (b.fundingAmount + b.totalFundingAmount || 0)
      );
    } else if (sort === "percentHigh") {
      filtered.sort((a, b) => {
        const aPercent =
          a.fundingGoalAmount > 0
            ? ((a.fundingAmount + a.totalFundingAmount) * 100) /
              a.fundingGoalAmount
            : 0;
        const bPercent =
          b.fundingGoalAmount > 0
            ? ((b.fundingAmount + b.totalFundingAmount) * 100) /
              b.fundingGoalAmount
            : 0;
        return bPercent - aPercent;
      });
    }

    setFilteredSpecialties(filtered);
    setPage(0); // Reset page on filter/sort change
  }, [localSpecialties, searchText, selectedSido, selectedSigungu, sort]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    setPage((prev) => prev + 1);
  }, [hasMore, loading]);

  useEffect(() => {
    const totalItems = filteredSpecialties.length;
    const currentlyShown = (page + 1) * size;
    setHasMore(currentlyShown < totalItems);
  }, [page, filteredSpecialties.length, size]);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const currentItems = useMemo(() => {
    return filteredSpecialties.slice(0, (page + 1) * size);
  }, [filteredSpecialties, page, size]);

  // Sido and Sigungu lists
  const sidoList = [
    ...new Set(localSpecialties.map((item) => item.sidoNm)),
  ].sort();
  const sigunguList = selectedSido
    ? [
        ...new Set(
          localSpecialties
            .filter((item) => item.sidoNm === selectedSido)
            .map((item) => item.sigunguNm)
        ),
      ].sort()
    : [];

  // Carousel arrows
  const renderArrowPrev = (onClickHandler, hasPrev, label) =>
    hasPrev && (
      <button
        type="button"
        onClick={onClickHandler}
        title={label}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 text-orange-600 p-3 rounded-full hover:bg-orange-600 hover:text-white transition-all z-10 shadow-md"
      >
        <FaChevronLeft className="text-xl" />
      </button>
    );

  const renderArrowNext = (onClickHandler, hasNext, label) =>
    hasNext && (
      <button
        type="button"
        onClick={onClickHandler}
        title={label}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 text-orange-600 p-3 rounded-full hover:bg-orange-600 hover:text-white transition-all z-10 shadow-md"
      >
        <FaChevronRight className="text-xl" />
      </button>
    );

  // Specialty Card Component
  const SpecialtyCard = ({ specialty }) => {
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

    const actualFundingAmount =
      (fundingAmount || 0) + (totalFundingAmount || 0);
    const actualPercent =
      fundingGoalAmount > 0
        ? Math.round((actualFundingAmount * 100) / fundingGoalAmount)
        : 0;

    const fundingEndDate = new Date(new Date().getFullYear(), 8, 30); // Fixed to Sep 30
    const daysLeft = Math.max(
      0,
      Math.ceil((fundingEndDate - new Date()) / 86400000)
    );

    const handleImageError = (e) => {
      const fallbackIndex = (cntntsNo % 45) + 1;
      e.target.src = `/${fallbackIndex}.jpg`;
    };

    const imgSrc = imgUrl || `/${(cntntsNo % 45) + 1}.jpg`;

    return (
      <motion.div
        className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:ring-2 hover:ring-orange-300 transition-all duration-300 group flex flex-col"
        variants={itemVariants}
      >
        <div className="relative h-52 overflow-hidden">
          {actualPercent >= 80 && (
            <span className="absolute top-3 left-3  text-white text-sm font-semibold px-3 py-1.5 rounded-full z-10 shadow-sm">
              🔥🔥🔥
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
              className="px-5 py-2 bg-orange-600 text-white text-sm font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-orange-700 shadow-md"
            >
              펀딩 참여
            </button>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-gray-800 truncate flex items-center gap-2">
                <IoRestaurantOutline className="text-orange-600 text-lg" />
                {cntntsSj}
              </h3>
              <CircularProgress value={actualPercent} size={44} stroke={4} />
            </div>
            <p className="text-sm text-gray-600 truncate mt-2 font-medium">
              {areaNm || `${sidoNm} ${sigunguNm || ""}`}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
              <TbCurrentLocation className="text-orange-600 text-lg" />
              {sidoNm} {sigunguNm && `> ${sigunguNm}`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span
                className={`flex items-center gap-2 ${
                  daysLeft <= 5 ? "text-red-600 font-semibold" : "text-gray-600"
                }`}
              >
                <FaFire
                  className={`${
                    daysLeft <= 5 ? "text-red-600" : "text-gray-600"
                  } text-lg`}
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

  // Filter Component
  const FilterComponent = () => (
    <motion.div
      className="mb-8 flex flex-wrap gap-3"
      variants={containerVariants}
    >
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-orange-100">
        <div className="flex items-center gap-1">
          <IoFilter className="text-orange-600 text-base" />
          <label className="text-xs font-semibold text-gray-700">정렬</label>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full sm:w-40 pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg bg-gradient-to-r from-orange-50 to-white text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
        >
          <option value="default">기본</option>
          <option value="fundingHigh">펀딩액 높은 순</option>
          <option value="fundingLow">펀딩액 낮은 순</option>
          <option value="percentHigh">달성률 높은 순</option>
        </select>
        <div className="absolute right-3 pointer-events-none">
          <IoChevronDown className="text-orange-600 text-sm" />
        </div>
      </div>
      <div className="relative flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-orange-100">
        <select
          value={selectedSido}
          onChange={(e) => {
            setSelectedSido(e.target.value);
            setSelectedSigungu("");
          }}
          className="w-full sm:w-40 pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg bg-gradient-to-r from-orange-50 to-white text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
        >
          <option value="">전체 시도</option>
          {sidoList.map((sido) => (
            <option key={sido} value={sido}>
              {sido}
            </option>
          ))}
        </select>
        <div className="absolute right-3 pointer-events-none">
          <IoChevronDown className="text-orange-600 text-sm" />
        </div>
      </div>
      <div className="relative flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-orange-100">
        <select
          value={selectedSigungu}
          onChange={(e) => setSelectedSigungu(e.target.value)}
          className="w-full sm:w-40 pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg bg-gradient-to-r from-orange-50 to-white text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
          disabled={!selectedSido}
        >
          <option value="">전체 시군구</option>
          {sigunguList.map((sigungu) => (
            <option key={sigungu} value={sigungu}>
              {sigungu}
            </option>
          ))}
        </select>
        <div className="absolute right-3 pointer-events-none">
          <IoChevronDown className="text-orange-600 text-sm" />
        </div>
      </div>
      {(selectedSido || selectedSigungu) && (
        <button
          onClick={() => {
            setSelectedSido("");
            setSelectedSigungu("");
          }}
          className="px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition shadow-md"
        >
          필터 초기화
        </button>
      )}
    </motion.div>
  );

  // List Component
  const ListComponent = () => {
    if (loading && currentItems.length === 0) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <svg
              className="animate-spin h-6 w-6 text-orange-600 mx-auto mb-4"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-500">지역특산물 데이터를 불러오는 중...</p>
          </div>
        </div>
      );
    }

    if (currentItems.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍃</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
        </div>
      );
    }

    return (
      <>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {currentItems.map((specialty) => (
            <SpecialtyCard key={specialty.cntntsNo} specialty={specialty} />
          ))}
        </motion.div>
        {hasMore && !loading && (
          <div ref={loadingRef} className="flex justify-center py-8">
            <div className="text-center">
              <svg
                className="animate-spin h-6 w-6 text-orange-600 mx-auto mb-2"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-sm text-gray-500">
                더 많은 지역특산물을 불러오는 중...
              </p>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <Mainmenu />

      <div className="p-6 pt-44 h-auto bg-[url('https://www.transparenttextures.com/patterns/light-wool.png')]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[3fr,1fr] gap-8 pt-4 lg:pt-6">
          {/* Main Content */}
          <div>
            {/* Hero Section */}
            <motion.div
              className="mb-10 text-center bg-gradient-to-b from-orange-200 to-white p-10 rounded-2xl shadow-lg pt-42"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1
                className="text-3xl font-bold text-orange-700 mb-4 tracking-tight"
                variants={itemVariants}
              >
                지역특산물 펀딩으로 지역의 맛을!
              </motion.h1>
              <motion.p
                className="text-gray-600 max-w-[600px] mx-auto text-lg font-medium"
                variants={itemVariants}
              >
                전국 특산물 펀딩에 참여해 특별한 지역의 맛을 만나보세요!
              </motion.p>
              <motion.div
                className="w-full max-w-[640px] mx-auto mt-6 rounded-2xl shadow-xl overflow-hidden"
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
                  className="rounded-2xl"
                  renderArrowPrev={renderArrowPrev}
                  renderArrowNext={renderArrowNext}
                >
                  {filteredSpecialties.length > 0 ? (
                    filteredSpecialties.slice(0, 5).map((specialty) => (
                      <div key={specialty.cntntsNo} className="relative">
                        <img
                          src={
                            specialty.imgUrl ||
                            `/${(specialty.cntntsNo % 45) + 1}.jpg`
                          }
                          alt={`${specialty.cntntsSj} 배너`}
                          className="w-full h-[300px] object-cover brightness-90 transition-all duration-300"
                        />
                        {((specialty.fundingAmount +
                          specialty.totalFundingAmount) *
                          100) /
                          specialty.fundingGoalAmount >=
                          80 && (
                          <span className="absolute top-4 right-4 bg-orange-400 text-gray-900 text-sm font-bold px-3 py-1.5 rounded-full z-10 shadow-md">
                            🔥 Hot!
                          </span>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                          <p className="text-white text-lg font-semibold">
                            {specialty.cntntsSj} -{" "}
                            {Math.round(
                              ((specialty.fundingAmount +
                                specialty.totalFundingAmount) *
                                100) /
                                specialty.fundingGoalAmount
                            )}
                            % 달성
                          </p>
                          <button
                            onClick={() =>
                              navigate(`/local-specialty/${specialty.cntntsNo}`)
                            }
                            className="mt-3 px-5 py-2 bg-orange-600 text-white text-sm font-semibold rounded-full hover:bg-orange-700 transition shadow-md"
                          >
                            펀딩 참여
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative">
                      <img
                        src="/specialty-hero.png"
                        alt="지역특산물 펀딩 소개"
                        className="w-full h-[300px] object-cover brightness-90"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                        <p className="text-white text-lg font-semibold">
                          지금 지역특산물 펀딩에 참여하세요!
                        </p>
                        <button
                          className="mt-3 px-5 py-2 bg-orange-600 text-white text-sm font-semibold rounded-full hover:bg-orange-700 transition shadow-md"
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

            {/* Search and Filter Section */}
            <motion.div
              className="flex flex-col justify-center items-center mb-4"
              variants={itemVariants}
            >
              <div className="relative w-full max-w-[1200px]">
                <input
                  type="text"
                  placeholder="원하는 지역특산물을 검색하세요"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-2xl border border-orange-300 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-400 cursor-pointer transition-colors">
                  <FiSearch size={20} />
                </div>
              </div>
            </motion.div>

            <motion.h2
              className="flex items-center gap-2 text-xl font-bold text-orange-700 mb-4"
              variants={itemVariants}
            >
              <IoRestaurantOutline className="text-2xl" />
              지역특산물 펀딩
            </motion.h2>

            <FilterComponent />

            <motion.div
              className="mb-4 p-3 bg-orange-50 rounded-lg"
              variants={itemVariants}
            >
              <p className="text-sm text-gray-600">
                총{" "}
                <span className="font-semibold text-orange-600">
                  {filteredSpecialties.length}
                </span>
                개의 지역특산물 펀딩이 진행 중입니다.
                {searchText && ` (검색어: "${searchText}")`}
                {selectedSido &&
                  ` (지역: ${selectedSido}${
                    selectedSigungu ? ` > ${selectedSigungu}` : ""
                  })`}
              </p>
            </motion.div>

            <ListComponent />
          </div>
          {/* Sidebar */}
          <div className="hidden lg:block">
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 max-h-[calc(100vh-1.5rem)] overflow-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* 내용 */}

              <motion.h3
                className="text-xl font-semibold text-orange-700 mb-4"
                variants={itemVariants}
              >
                추천 지역
              </motion.h3>
              <motion.ul className="space-y-3" variants={containerVariants}>
                {sidoList.slice(0, 3).map((sido) => (
                  <motion.li key={sido} variants={itemVariants}>
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition flex items-center gap-3"
                      onClick={() => {
                        setSelectedSido(sido);
                        setSelectedSigungu("");
                      }}
                    >
                      <TbCurrentLocation className="text-orange-600 text-lg" />
                      {sido}
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div
                className="mt-6 pt-4 border-t border-gray-200"
                variants={itemVariants}
              >
                <h3 className="text-xl font-semibold text-orange-700 mb-4">
                  오늘의 추천
                </h3>
                <div className="relative rounded-lg overflow-hidden shadow-md">
                  <img
                    src="../../../fruit1.png"
                    alt="추천 펀딩"
                    className="w-full h-40 object-cover brightness-90"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-sm font-semibold">
                      오늘의 특가 펀딩!
                    </p>
                    <button
                      className="mt-2 px-4 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-full hover:bg-orange-700 transition shadow-md"
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

export default LocalSpecialtyPage;
