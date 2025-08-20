import React, { useEffect, useState, useCallback, useRef } from "react";
import { IoRestaurantOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { FaFire } from "react-icons/fa"; // 🔥 추가

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080") + "/api/restaurants";

// ✅ 원형 게이지 (달성률 색상 변화)
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
          fontSize: `${size * 0.3}px`, // 원 크기보다 크게
          color: pct >= 80 ? "#b91c1c" : pct >= 50 ? "#a16207" : "#1e40af",
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

const NearbyKakaoRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(24);
  const [totalPages, setTotalPages] = useState(0);

  const [coords, setCoords] = useState(null);

  // Intersection Observer를 위한 ref
  const observerRef = useRef();
  const loadingRef = useRef();

  // 이미지 URL을 프론트엔드에서 접근 가능한 URL로 변환
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    // 백엔드에서 반환된 상대 경로를 절대 URL로 변환
    return `http://localhost:8080/${imageUrl}`;
  };

  // 위치 가져오기
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

  // 무한스크롤 loadMore 함수
  const loadMore = useCallback(() => {
    if (!canLoadMore || loading) return;
    fetchNearby(page + 1);
  }, [canLoadMore, loading, page, fetchNearby]);

  // Intersection Observer 설정
  useEffect(() => {
    if (!canLoadMore) {
      console.log("Observer setup skipped - no more data:", { canLoadMore });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && canLoadMore && !loading) {
          console.log(
            "Intersection Observer triggered - loading more restaurants"
          );
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
  }, [canLoadMore, loading, loadMore]);

  return (
    <div className="p-2 flex justify-center bg-white min-h-screen">
      <div className="w-full max-w-[1200px]">
        <h2 className="flex items-center gap-2 text-xl mb-3 leading-none">
          <IoRestaurantOutline className="text-[32px] relative top-[1px] shrink-0" />
          <span className="text-[22px]">주변 펀딩 진행 중 음식점</span>
        </h2>

        {loading && restaurants.length === 0 ? (
          <p className="text-gray-400">음식점을 불러오는 중입니다...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : restaurants.length === 0 ? (
          <p className="text-gray-500">근처 음식점을 찾지 못했습니다.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {restaurants.map((store) => {
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
                  totalFundingAmount, // 펀딩 테이블 결제내역 합산 금액
                } = store;

                // 디버깅을 위한 로그 출력
                console.log(`Restaurant ${name}:`, {
                  fundingAmount,
                  totalFundingAmount,
                  합산결과: (fundingAmount || 0) + (totalFundingAmount || 0),
                  restaurantId,
                });

                // 실제 펀딩된 금액 (기본 fundingAmount + 펀딩 테이블 합산 금액)
                const actualFundingAmount =
                  (fundingAmount || 0) + (totalFundingAmount || 0);

                const percent = Number.isFinite(fundingPercent)
                  ? Number(fundingPercent)
                  : fundingGoalAmount > 0 && actualFundingAmount >= 0
                  ? Math.round(
                      (Number(actualFundingAmount) * 100) /
                        Number(fundingGoalAmount)
                    )
                  : 0;

                const imgSrc =
                  getImageUrl(imageUrl) ||
                  `/${Math.floor(Math.random() * 45 + 1)}.jpg`;

                // 이미지 표시 여부 결정
                const hasCustomImage =
                  imageUrl && imageUrl.includes("uploads/");
                const displayImage = hasCustomImage
                  ? getImageUrl(imageUrl)
                  : `/${restaurantId}.jpg`; // ID 기반으로 일관된 이미지 표시

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
                    className="bg-white overflow-hidden border border-gray-300 transition w-[270px] h-[380px] flex flex-col group rounded-lg"
                  >
                    {/* 이미지 영역 */}
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden relative group">
                      <img
                        src={displayImage}
                        alt={`${name} 이미지`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* 호버 시 오버레이 */}
                      <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/restaurant/${restaurantId}`;
                          }}
                          className="px-4 py-2 text-white font-bold rounded hover:bg-opacity-80 transition"
                        >
                          자세히 보기
                        </button>
                      </div>
                    </div>

                    <div className="p-1  flex-1 flex flex-col justify-between">
                      <div className="min-w-0">
                        {/* 이름 + 게이지 */}
                        {/* 이름 + 게이지 */}
                        <div className="flex items-center justify-between gap-2 ">
                          <h3 className="text-lg font-semibold text-[20px] text-black truncate flex-1">
                            {name}
                          </h3>
                          <div className="shrink-0 mt-4">
                            <CircularProgress
                              value={percent}
                              size={50} // ✅ 기존 40 → 70으로 확대
                              stroke={3} // ✅ 선 두께도 약간 두껍게
                            />
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 truncate">
                          {roadAddressName || "-"}
                        </p>

                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <TbCurrentLocation className="text-base" />
                          {distLabel}
                        </p>

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
                            <span className="inline-flex items-center text-[16px] text-green-600 ">
                              {(
                                (fundingAmount || 0) + (totalFundingAmount || 0)
                              ).toLocaleString()}
                              원 펀딩
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* 무한스크롤을 위한 감지 요소 */}
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
