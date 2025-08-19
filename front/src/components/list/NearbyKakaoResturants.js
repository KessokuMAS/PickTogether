import React, { useEffect, useState, useCallback } from "react";
import { IoRestaurantOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080") + "/api/restaurants";

// ✅ 심플 원형 게이지 (SVG)
function CircularProgress({ value = 0, size = 36, stroke = 4 }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

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
          className="text-blue-400"
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold text-gray-800">
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

  const [coords, setCoords] = useState(null); // { lat, lng }

  // 위치 가져오기 (localStorage 기반)
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
        const data = await res.json(); // Page<RestaurantThumbView>

        setRestaurants((prev) =>
          nextPage === 0 ? data.content ?? [] : prev.concat(data.content ?? [])
        );
        setTotalPages(data.totalPages ?? 0);
        setPage(data.number ?? nextPage);
        console.log("nearby data:", data);
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

  return (
    <div className="p-2 flex justify-center bg-white min-h-screen">
      <div className="w-full max-w-[1200px]">
        <h2 className="flex items-center gap-2 text-xl mb-3 leading-none ">
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
                  placeUrl,
                  distance,
                  fundingAmount,
                  fundingGoalAmount,
                  fundingPercent,
                  imageUrl,
                  fundingStartDate,
                  fundingEndDate,
                  totalFundingAmount,
                } = store;

                // 총 펀딩 금액 = 원래 펀딩 금액 + 실제 결제된 총 금액
                const totalAmount =
                  (fundingAmount || 0) + (totalFundingAmount || 0);

                // 디버깅용 콘솔 출력
                console.log(`Restaurant ${name}:`, {
                  fundingAmount,
                  totalFundingAmount,
                  totalAmount,
                  restaurantId,
                });

                const percent = Number.isFinite(fundingPercent)
                  ? Number(fundingPercent)
                  : fundingGoalAmount > 0 && totalAmount >= 0
                  ? Math.round(
                      (Number(totalAmount) * 100) / Number(fundingGoalAmount)
                    )
                  : 0;

                const imgSrc =
                  imageUrl || `/${Math.floor(Math.random() * 45 + 1)}.png`;
                const distLabel = Number.isFinite(Number(distance))
                  ? `${Math.round(Number(distance)).toLocaleString()}m 거리`
                  : "거리 정보 없음";

                // D-day 계산 (서버에서 내려온 날짜 우선, 없으면 14일 고정)
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
                    className="bg-white overflow-hidden border border-gray-300 transition w-[270px] h-[380px] flex flex-col group rounded-lg
                    "
                  >
                    <div className="w-full min-h-52 bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={`${name} 이미지`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-1 flex-1 flex flex-col justify-between">
                      <div className="min-w-0">
                        {/* 이름 + 게이지 우측 배치 */}
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg font-semibold text-black truncate flex-1">
                            {name}
                          </h3>
                          <div className="shrink-0 mt-4">
                            <CircularProgress
                              value={percent}
                              size={40}
                              stroke={4}
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

                        {/* 펀딩 기간 / D-day */}
                        <div className="mt-2 flex items-center justify-between text-[13px]">
                          <div className="text-gray-800 truncate font-semibold">
                            {fundingStartDate && fundingEndDate
                              ? `${new Date(
                                  fundingStartDate
                                ).toLocaleDateString("ko-KR")} ~ ${new Date(
                                  fundingEndDate
                                ).toLocaleDateString("ko-KR")}`
                              : "기간 정보 없음"}
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-md font-bold border-blue-200 ${
                              daysLeft <= 3
                                ? "bg-white-50 text-blue-600 border-red-200"
                                : "bg-white-100 text-blue-700 border-pink-200"
                            }`}
                          >
                            D-{daysLeft}
                          </span>
                        </div>
                      </div>

                      <div className="">
                        <hr className="border-gray-300" />
                        <div className="flex justify-between text-sm text-gray-700 pt-2">
                          <div className="font-semibold">
                            {Number(totalAmount).toLocaleString("ko-KR")}원 모임
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* 더 보기 버튼 (페이지네이션) */}
            <div className="flex justify-center mt-4">
              {canLoadMore && (
                <button
                  onClick={() => fetchNearby(page + 1)}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                >
                  {loading ? "불러오는 중…" : "더 보기"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NearbyKakaoRestaurants;
