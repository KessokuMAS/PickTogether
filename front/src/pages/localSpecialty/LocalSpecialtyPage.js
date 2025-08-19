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
import { useNavigate } from "react-router-dom";
import MainMenu from "../../components/menus/Mainmenu";

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
  const [hasMore, setHasMore] = useState(true);

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

  // 무한스크롤로 추가 데이터 로드
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) {
      console.log("loadMore blocked:", { hasMore, loading });
      return;
    }

    console.log("loadMore called - page:", page, "size:", size);

    // 다음 페이지로 이동
    const nextPage = page + 1;
    setPage(nextPage);
    console.log("Page updated to:", nextPage);
  }, [page, size, hasMore, loading]);

  // Intersection Observer 설정
  useEffect(() => {
    if (!hasMore || loading) {
      console.log("Observer setup skipped:", { hasMore, loading });
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
    const maxPage = Math.ceil(totalItems / size) - 1;
    const shouldHaveMore = page < maxPage;

    console.log("Page effect:", { page, maxPage, shouldHaveMore, totalItems });

    if (hasMore !== shouldHaveMore) {
      setHasMore(shouldHaveMore);
      console.log("hasMore updated to:", shouldHaveMore);
    }
  }, [page, filteredSpecialties.length, size, hasMore]);

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
    setHasMore(true);
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
    } = specialty;

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

    const imgSrc = imgUrl || `/${Math.floor(Math.random() * 45 + 1)}.png`;

    return (
      <div
        onClick={() => navigate(`/local-specialty/${cntntsNo}`)}
        className="bg-white overflow-hidden border border-gray-300 transition w-[270px] h-[380px] flex flex-col group rounded-lg hover:shadow-lg cursor-pointer"
      >
        <div className="w-full min-h-52 bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
          <img
            src={imgSrc}
            alt={`${cntntsSj} 이미지`}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="p-1 flex-1 flex flex-col justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-black truncate mb-2">
              {cntntsSj}
            </h3>

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

            {svcDt && (
              <p className="text-xs text-gray-500 mb-2">
                등록일: {formatDate(svcDt)}
              </p>
            )}
          </div>

          <div className="">
            <hr className="border-gray-300" />
            <div className="flex justify-between text-sm text-gray-700 pt-2">
              <span className="text-blue-600 font-medium">상세보기 →</span>
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
        {hasMore && (
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
            <span className="text-[22px]">지역특산물</span>
          </h2>

          <FilterComponent />

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              총{" "}
              <span className="font-semi-bold text-blue-600">
                {filteredSpecialties.length}
              </span>
              개의 지역특산물이 있습니다.
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
