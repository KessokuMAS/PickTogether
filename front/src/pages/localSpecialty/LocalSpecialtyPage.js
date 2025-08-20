import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { localSpecialtyApi } from "../../api/localSpecialtyApi";
import { IoRestaurantOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { FiSearch } from "react-icons/fi";
import { FaFire } from "react-icons/fa"; // 🔥 펀딩 아이콘 추가
import { useNavigate } from "react-router-dom";
import MainMenu from "../../components/menus/Mainmenu";

// ✅ 원형 게이지 (달성률 색상 변화) - NearbyKakaoRestaurants와 동일
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
      {/* 🔹 퍼센트 텍스트만 크게 */}
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
}

const LocalSpecialtyPage = () => {
  const [localSpecialties, setLocalSpecialties] = useState([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedSido, setSelectedSido] = useState("");
  const [selectedSigungu, setSelectedSigungu] = useState("");

  // 무한스크롤 관련 상태
  const [page, setPage] = useState(0);
  const [size] = useState(24);
  const [hasMore, setHasMore] = useState(false); // 초기값을 false로 설정

  // Intersection Observer를 위한 ref
  const observerRef = useRef();
  const loadingRef = useRef();

  const navigate = useNavigate();

  // 전체 지역특산물 데이터 로드
  useEffect(() => {
    loadLocalSpecialties();
  }, []);

  // 검색 및 필터링된 결과 업데이트
  useEffect(() => {
    if (localSpecialties.length > 0) {
      filterAndSearchSpecialties();
    }
  }, [localSpecialties, searchText, selectedSido, selectedSigungu]);

  // 무한스크롤로 추가 데이터 표시 (이미 로드된 데이터에서 더 보여주기)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) {
      console.log("loadMore blocked:", { hasMore, loading });
      return;
    }

    console.log("loadMore called - page:", page, "size:", size);

    // 다음 페이지로 이동 (기존 데이터에서 더 많이 표시)
    const nextPage = page + 1;
    setPage(nextPage);
    console.log("Page updated to:", nextPage);
  }, [page, size, hasMore, loading]);

  // Intersection Observer 설정
  useEffect(() => {
    if (!hasMore) {
      console.log("Observer setup skipped - no more data:", { hasMore });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          console.log("Intersection Observer triggered - loading more data");
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px", // 100px 전에 미리 로드 시작
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
      console.log("Observer attached to loading element");
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        console.log("Observer disconnected");
      }
    };
  }, [hasMore, loading, loadMore]);

  // 페이지 변경 시 hasMore 상태 업데이트
  useEffect(() => {
    const totalItems = filteredSpecialties.length;
    const currentlyShown = (page + 1) * size;
    const shouldHaveMore = currentlyShown < totalItems;

    console.log("Page effect:", {
      page,
      totalItems,
      currentlyShown,
      shouldHaveMore,
      size,
    });

    setHasMore(shouldHaveMore);
  }, [page, filteredSpecialties.length, size]);

  // 현재까지 로드된 아이템들 - 수정된 로직
  const currentItems = useMemo(() => {
    const startIndex = 0;
    const endIndex = (page + 1) * size;
    console.log("Current items calculation:", {
      startIndex,
      endIndex,
      total: filteredSpecialties.length,
    });
    return filteredSpecialties.slice(startIndex, endIndex);
  }, [filteredSpecialties, page, size]);

  const loadLocalSpecialties = async () => {
    try {
      setLoading(true);
      const data = await localSpecialtyApi.getAllLocalSpecialties();
      console.log("백엔드에서 받은 지역특산물 데이터:", data);
      console.log("첫 번째 데이터 샘플:", data[0]);
      setLocalSpecialties(data);
      setError(null);
    } catch (err) {
      setError("지역특산물 데이터를 불러오는데 실패했습니다.");
      console.error("데이터 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchSpecialties = () => {
    let filtered = [...localSpecialties];

    // 지역 필터링
    if (selectedSido) {
      filtered = filtered.filter((item) => item.sidoNm === selectedSido);
    }
    if (selectedSigungu) {
      filtered = filtered.filter((item) => item.sigunguNm === selectedSigungu);
    }

    // 검색어 필터링
    if (searchText.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.cntntsSj.toLowerCase().includes(searchText.toLowerCase()) ||
          item.areaNm.toLowerCase().includes(searchText.toLowerCase()) ||
          item.sidoNm.toLowerCase().includes(searchText.toLowerCase()) ||
          item.sigunguNm.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    console.log("Filtering result:", {
      original: localSpecialties.length,
      filtered: filtered.length,
      selectedSido,
      selectedSigungu,
      searchText,
    });

    setFilteredSpecialties(filtered);
    // 필터 변경 시 페이지 초기화
    setPage(0);
    // hasMore는 자동으로 계산되므로 강제 설정하지 않음
  };

  // 시도 목록 추출 (중복 제거)
  const sidoList = [
    ...new Set(localSpecialties.map((item) => item.sidoNm)),
  ].sort();

  // 선택된 시도에 해당하는 시군구 목록
  const sigunguList = selectedSido
    ? [
        ...new Set(
          localSpecialties
            .filter((item) => item.sidoNm === selectedSido)
            .map((item) => item.sigunguNm)
        ),
      ].sort()
    : [];

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleSidoChange = (sido) => {
    setSelectedSido(sido);
    setSelectedSigungu(""); // 시도 변경 시 시군구 초기화
  };

  const handleSigunguChange = (sigungu) => {
    setSelectedSigungu(sigungu);
  };

  // 필터 컴포넌트
  const FilterComponent = () => (
    <div className="mb-6 flex flex-wrap gap-4">
      <div className="flex flex-col">
        <label
          htmlFor="sido-select"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          시도
        </label>
        <select
          id="sido-select"
          value={selectedSido}
          onChange={(e) => handleSidoChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">전체 시도</option>
          {sidoList.map((sido) => (
            <option key={sido} value={sido}>
              {sido}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="sigungu-select"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          시군구
        </label>
        <select
          id="sigungu-select"
          value={selectedSigungu}
          onChange={(e) => handleSigunguChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={!selectedSido}
        >
          <option value="">전체 시군구</option>
          {sigunguList.map((sigungu) => (
            <option key={sigungu} value={sigungu}>
              {sigungu}
            </option>
          ))}
        </select>
      </div>

      {(selectedSido || selectedSigungu) && (
        <button
          onClick={() => {
            handleSidoChange("");
            handleSigunguChange("");
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors self-end"
        >
          필터 초기화
        </button>
      )}
    </div>
  );

  // 카드 컴포넌트
  const SpecialtyCard = ({ specialty }) => {
    const {
      cntntsSj,
      areaNm,
      imgUrl,
      sidoNm,
      sigunguNm,
      svcDt,
      linkUrl,
      cntntsNo,
      fundingGoalAmount, // 백엔드에서 받은 펀딩 목표 금액
      fundingAmount, // 백엔드에서 받은 현재 펀딩 금액
      fundingPercent, // 백엔드에서 받은 펀딩 달성률
      totalFundingAmount, // 펀딩 테이블 결제내역 합산 금액
    } = specialty;

    // 실제 펀딩된 금액 (기본 fundingAmount + 펀딩 테이블 합산 금액)
    const actualFundingAmount =
      (fundingAmount || 0) + (totalFundingAmount || 0);

    // 실제 합산된 금액으로 퍼센트 재계산
    const actualPercent =
      fundingGoalAmount > 0 && actualFundingAmount >= 0
        ? Math.round((actualFundingAmount * 100) / fundingGoalAmount)
        : 0;

    // 디버깅을 위한 로그 출력
    console.log(`LocalSpecialty ${cntntsSj}:`, {
      fundingAmount,
      totalFundingAmount,
      actualFundingAmount,
      백엔드퍼센트: fundingPercent,
      실제퍼센트: actualPercent,
      cntntsNo,
    });

    // 펀딩 종료일 (3분기 끝 - 9월 30일 고정)
    const getCurrentQuarterEnd = () => {
      const now = new Date();
      const currentYear = now.getFullYear();

      // 현재 분기 계산
      const currentMonth = now.getMonth() + 1; // 1~12
      let quarterEndMonth, quarterEndYear;

      if (currentMonth <= 3) {
        // 1분기: 3월 31일
        quarterEndMonth = 3;
        quarterEndYear = currentYear;
      } else if (currentMonth <= 6) {
        // 2분기: 6월 30일
        quarterEndMonth = 6;
        quarterEndYear = currentYear;
      } else if (currentMonth <= 9) {
        // 3분기: 9월 30일
        quarterEndMonth = 9;
        quarterEndYear = currentYear;
      } else {
        // 4분기: 12월 31일 (다음 해 1분기로 넘어감)
        quarterEndMonth = 3;
        quarterEndYear = currentYear + 1;
      }

      return new Date(quarterEndYear, quarterEndMonth, 0); // 해당 월의 마지막 날
    };

    const fundingEndDate = getCurrentQuarterEnd();
    const daysLeft = Math.max(
      0,
      Math.ceil((fundingEndDate.getTime() - new Date().getTime()) / 86400000)
    );

    const handleImageError = (e) => {
      // 이미지 에러 시에도 cntntsNo 기반 고정 이미지 사용
      const fallbackIndex = (cntntsNo % 45) + 1;
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

    // 이미지 소스도 cntntsNo 기반으로 고정
    const fallbackIndex = (cntntsNo % 45) + 1;
    const imgSrc = imgUrl || `/${fallbackIndex}.jpg`;

    return (
      <div
        onClick={() => navigate(`/local-specialty/${cntntsNo}`)}
        className="bg-white overflow-hidden border border-gray-300 transition w-[270px] h-[380px] flex flex-col group rounded-lg hover:shadow-lg cursor-pointer"
      >
        {/* 이미지 영역 */}
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden relative group">
          <img
            src={imgSrc}
            alt={`${cntntsSj} 이미지`}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* 호버 시 오버레이 */}
          <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate(`/local-specialty/${cntntsNo}`);
              }}
              className="px-4 py-2 text-white font-bold rounded hover:bg-opacity-80 transition"
            >
              자세히 보기
            </button>
          </div>
        </div>

        <div className="p-1 flex-1 flex flex-col justify-between">
          <div className="min-w-0">
            {/* 이름 + 게이지 */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-[20px] text-black truncate flex-1">
                {cntntsSj}
              </h3>
              <div className="shrink-0 mt-4">
                <CircularProgress value={actualPercent} size={50} stroke={3} />
              </div>
            </div>

            <div className="flex items-center gap-1 mb-2">
              <TbCurrentLocation className="text-base text-blue-500" />
              <span className="text-sm text-gray-600">
                {sidoNm} {sigunguNm && `> ${sigunguNm}`}
              </span>
            </div>

            {areaNm && (
              <p className="text-sm text-gray-600 truncate mb-2">
                지역: {areaNm}
              </p>
            )}

            <div className="mt-2 pt-6">
              {/* 구분선 */}
              <div className="border-t border-gray-300 mb-2"></div>

              {/* 남은 일수 + 펀딩금액 */}
              <div className="flex items-center justify-between text-[13px]">
                <span
                  className={`inline-flex items-center text-[16px] ${
                    daysLeft <= 5
                      ? "text-red-600 font-bold"
                      : "text-black font-normal"
                  }`}
                >
                  {daysLeft}일 남음
                </span>
                <span className="inline-flex items-center text-[16px] text-green-600">
                  {actualFundingAmount.toLocaleString()}원 펀딩
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 목록 컴포넌트
  const ListComponent = () => {
    if (loading && currentItems.length === 0) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentItems.map((specialty) => (
            <SpecialtyCard key={specialty.cntntsNo} specialty={specialty} />
          ))}
        </div>

        {/* 자동 로딩을 위한 감지 요소 */}
        {hasMore && !loading && (
          <div ref={loadingRef} className="flex justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">
                더 많은 지역특산물을 불러오는 중...
              </p>
            </div>
          </div>
        )}
      </>
    );
  };

  if (loading && localSpecialties.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">지역특산물 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          오류가 발생했습니다
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={loadLocalSpecialties}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <>
      <MainMenu />

      <div className="p-2 flex justify-center bg-white min-h-screen pt-[200px]">
        <div className="w-full max-w-[1200px]">
          {/* 🔍 메인 검색창 - 메인페이지와 동일 */}
          <div className="flex flex-col justify-center items-center mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="원하는 지역특산물을 검색하세요"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-[1200px] pl-12 pr-12 py-3 rounded-2xl border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400 cursor-pointer transition-colors">
                <FiSearch size={20} />
              </div>
            </div>
          </div>

          <h2 className="flex items-center gap-2 text-xl mb-3 leading-none">
            <IoRestaurantOutline className="text-[32px] relative top-[1px] shrink-0" />
            <span className="text-[22px]">지역특산물 펀딩</span>
          </h2>

          <FilterComponent />

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              총{" "}
              <span className="font-semi-bold text-blue-600">
                {filteredSpecialties.length}
              </span>
              개의 지역특산물 펀딩이 진행 중입니다.
              {searchText && ` (검색어: "${searchText}")`}
              {selectedSido &&
                ` (지역: ${selectedSido}${
                  selectedSigungu ? ` > ${selectedSigungu}` : ""
                })`}
            </p>
          </div>

          <ListComponent />
        </div>
      </div>
    </>
  );
};

export default LocalSpecialtyPage;
