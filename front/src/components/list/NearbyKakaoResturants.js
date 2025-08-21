import React, { useEffect, useState, useCallback, useRef } from "react";
import { TbCurrentLocation } from "react-icons/tb";

// ✅ 원형 게이지 (달성률 색상 변화)
function CircularProgress({ value = 0, size = 50, stroke = 4 }) {
  const raw = Math.max(0, Math.round(value)); // 실제 값 (텍스트 출력용)
  const pct = Math.min(100, raw); // 게이지용 (100%까지만)

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
          color: raw >= 80 ? "#b91c1c" : raw >= 50 ? "#a16207" : "#1e40af",
        }}
      >
        {raw}%
      </span>
    </div>
  );
}

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080") + "/api/restaurants";

const NearbyKakaoRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(24);
  const [totalPages, setTotalPages] = useState(0);

  const [coords, setCoords] = useState(null);

  const [statusFilter, setStatusFilter] = useState("전체");
  const [sortFilter, setSortFilter] = useState("거리순");
  const [categoryFilter, setCategoryFilter] = useState("전체"); // ✅ 카테고리 필터 상태

  const observerRef = useRef();
  const loadingRef = useRef();

  const categories = [
    { label: "한식", img: "/korean.png" },
    { label: "중식", img: "/china.png" },
    { label: "일식", img: "/japan.png" },
    { label: "뷔페", img: "/b.png" },
    { label: "패스트푸드", img: "/fastfood.png" },
    { label: "카페", img: "/coffee.png" },
  ];

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    return `http://localhost:8080/${imageUrl}`;
  };

  useEffect(() => {
    const saved = localStorage.getItem("selectedLocation");
    if (!saved) {
      console.warn("📦 위치 정보 없음");
      setError("위치 정보가 없습니다.");
      setLoading(false);
      return;
    }

    try {
      const data = JSON.parse(saved);
      const lat = parseFloat(data.lat);
      const lng = parseFloat(data.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("좌표 형식이 잘못되었습니다.");
      }
      setCoords({ lat, lng });
    } catch (e) {
      console.error("❌ 좌표 파싱 실패:", e);
      setError("좌표 형식이 잘못되었습니다.");
      setLoading(false);
    }
  }, []);

  const fetchNearby = useCallback(
    async (nextPage = 0) => {
      if (!coords) return;
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        lat: coords.lat,
        lng: coords.lng,
        radius: 2000,
        page: nextPage,
        size,
      }).toString();

      try {
        const res = await fetch(`${API_BASE}/nearby?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setRestaurants((prev) =>
          nextPage === 0 ? data.content ?? [] : prev.concat(data.content ?? [])
        );
        setTotalPages(data.totalPages ?? 0);
        setPage(data.number ?? nextPage);
      } catch (e) {
        console.error("📡 API 오류:", e);
        setError("목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [coords, size]
  );

  useEffect(() => {
    if (coords) fetchNearby(0);
  }, [coords, fetchNearby]);

  const canLoadMore = page + 1 < totalPages;

  const loadMore = useCallback(() => {
    if (!canLoadMore || loading) return;
    fetchNearby(page + 1);
  }, [canLoadMore, loading, page, fetchNearby]);

  useEffect(() => {
    if (!canLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && canLoadMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loadingRef.current) observer.observe(loadingRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [canLoadMore, loading, loadMore]);

  // 🔹 상태 + 정렬 + 카테고리 필터 적용 (포함 매칭)
  const filteredRestaurants = [...restaurants]
    .filter((store) => {
      // ✅ 카테고리 필터 (포함 매칭)
      if (categoryFilter !== "전체") {
        if (
          !store.categoryName ||
          !store.categoryName.includes(categoryFilter)
        ) {
          return false;
        }
      }

      const end = store.fundingEndDate
        ? new Date(store.fundingEndDate)
        : new Date(Date.now() + 14 * 86400000);
      const daysLeft = Math.max(0, Math.ceil((end - new Date()) / 86400000));

      if (statusFilter === "진행중") return daysLeft > 0;
      if (statusFilter === "종료") return daysLeft === 0;
      return true;
    })
    .sort((a, b) => {
      const endA = a.fundingEndDate ? new Date(a.fundingEndDate) : new Date();
      const endB = b.fundingEndDate ? new Date(b.fundingEndDate) : new Date();
      const daysLeftA = Math.max(0, Math.ceil((endA - new Date()) / 86400000));
      const daysLeftB = Math.max(0, Math.ceil((endB - new Date()) / 86400000));

      const actualA = (a.fundingAmount || 0) + (a.totalFundingAmount || 0);
      const actualB = (b.fundingAmount || 0) + (b.totalFundingAmount || 0);

      const percentA =
        a.fundingGoalAmount > 0
          ? Math.round((actualA * 100) / a.fundingGoalAmount)
          : 0;
      const percentB =
        b.fundingGoalAmount > 0
          ? Math.round((actualB * 100) / b.fundingGoalAmount)
          : 0;

      let cmp = 0;
      switch (sortFilter) {
        case "거리순":
          cmp = (a.distance || 0) - (b.distance || 0);
          break;
        case "참여금액순":
          cmp = actualB - actualA;
          break;
        case "참여율순":
          cmp = percentB - percentA;
          break;
        case "종료임박순":
          cmp = daysLeftA - daysLeftB;
          break;
        default:
          cmp = 0;
      }

      // ✅ 종료된 펀딩은 항상 뒤로 밀기
      if (daysLeftA === 0 && daysLeftB > 0) return 1;
      if (daysLeftB === 0 && daysLeftA > 0) return -1;

      return cmp;
    });

  return (
    <div className="p-2 flex justify-center bg-white min-h-screen">
      <div className="w-full max-w-[1200px]">
        {/* 카테고리 버튼 */}
        <div className="flex flex-wrap gap-8 mb-5 justify-center">
          {/* 전체 버튼 */}
          <button
            key="전체"
            onClick={() => setCategoryFilter("전체")}
            className={`flex flex-col items-center justify-center w-20 h-20 text-sm font-medium transition rounded-lg
              ${
                categoryFilter === "전체"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-50"
              }`}
          >
            <span>전체</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setCategoryFilter(cat.label)}
              className={`flex flex-col items-center justify-center w-20 h-20 text-sm font-medium transition rounded-lg
                ${
                  categoryFilter === cat.label
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                }`}
            >
              <img
                src={cat.img}
                alt={cat.label}
                className="w-12 h-12 object-contain mb-1"
              />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* 제목 + 필터 */}
        <div className="flex items-center justify-between mb-6 px-5">
          <div>
            <h2 className="flex items-center gap-2 text-[22px] font-bold mt-3">
              펀딩 진행 중 음식점
            </h2>
            <p className="text-[15px] text-gray-500 font-semibold mt-1">
              내 주변에서 진행하고 있는 펀딩 음식점을 확인해보세요 !
            </p>
          </div>

          <div className="flex gap-4">
            <select
              className="px-4 py-2 border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="전체">전체</option>
              <option value="진행중">진행중</option>
              <option value="종료">종료</option>
            </select>

            <select
              className="px-4 py-2 border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md"
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
            >
              <option value="거리순">가까운 거리순</option>
              <option value="참여금액순">참여 금액순</option>
              <option value="참여율순">참여율 순</option>
              <option value="종료임박순">종료 임박 순</option>
            </select>
          </div>
        </div>

        {loading && restaurants.length === 0 ? (
          <p className="text-gray-400">음식점을 불러오는 중입니다...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredRestaurants.length === 0 ? (
          <p className="text-gray-500">근처 음식점을 찾지 못했습니다.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredRestaurants.map((store) => {
                const {
                  restaurantId,
                  name,
                  roadAddressName,
                  distance,
                  fundingAmount,
                  fundingGoalAmount,
                  fundingPercent,
                  imageUrl,
                  fundingEndDate,
                  totalFundingAmount,
                  categoryName,
                } = store;

                const actualFundingAmount = fundingAmount || 0;

                const percent =
                  fundingGoalAmount > 0 && actualFundingAmount >= 0
                    ? Math.round(
                        (Number(actualFundingAmount) * 100) /
                          Number(fundingGoalAmount)
                      )
                    : 0;

                const displayImage =
                  imageUrl && imageUrl.includes("uploads/")
                    ? getImageUrl(imageUrl)
                    : `/${restaurantId}.jpg`;

                const distLabel = Number.isFinite(Number(distance))
                  ? `${Math.round(Number(distance)).toLocaleString()}m 거리`
                  : "거리 정보 없음";

                const end = fundingEndDate
                  ? new Date(fundingEndDate)
                  : new Date(Date.now() + 14 * 86400000);
                const daysLeft = Math.max(
                  0,
                  Math.ceil((end - new Date()) / 86400000)
                );

                return (
                  <a
                    key={restaurantId}
                    href={`/restaurant/${restaurantId}`}
                    className={`relative border border-gray-300 transition w-[270px] h-[380px] flex flex-col group rounded-lg
                      ${daysLeft === 0 ? "bg-gray-300 opacity-80" : "bg-white"}
                    `}
                  >
                    <div className="w-full h-48 bg-gray-100 overflow-hidden relative group">
                      <img
                        src={displayImage}
                        alt={`${name} 이미지`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {daysLeft === 0 && percent >= 100 && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-[14px] font-semibold px-2 py-1 rounded shadow">
                          펀딩 성공
                        </div>
                      )}
                    </div>

                    <div className="p-2 flex-1 flex flex-col justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg font-semibold text-black truncate flex-1">
                            {name}
                          </h3>
                          <CircularProgress
                            value={percent}
                            size={50}
                            stroke={3}
                          />
                        </div>

                        <p className="text-sm text-gray-600 truncate">
                          {roadAddressName || "-"}
                        </p>

                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <TbCurrentLocation className="text-base" />
                          {distLabel}
                        </p>

                        {/* ✅ 카테고리도 보여주고 싶다면 */}
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {categoryName}
                        </p>

                        <div className="mt-2 pt-6 border-t border-gray-300">
                          <div className="flex items-center justify-between text-[13px]">
                            <span
                              className={`inline-flex items-center text-[16px] ${
                                daysLeft <= 5 && daysLeft !== 0
                                  ? "text-red-600 font-bold"
                                  : "text-black font-normal"
                              }`}
                            >
                              {daysLeft === 0 ? "종료" : `${daysLeft}일 남음`}
                            </span>
                            <span className="inline-flex items-center text-[16px] text-green-600">
                              {actualFundingAmount.toLocaleString()}원 펀딩
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {canLoadMore && !loading && (
              <div ref={loadingRef} className="flex justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">
                    더 많은 음식점을 불러오는 중...
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NearbyKakaoRestaurants;
