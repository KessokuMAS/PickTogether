import React, { useEffect, useState, useCallback } from "react";
import { IoRestaurantOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080") + "/api/for-one";

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
          className="text-pink-600"
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

const NearbyForOneMenus = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(24);
  const [totalPages, setTotalPages] = useState(0);

  const [coords, setCoords] = useState(null);

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
        const data = await res.json(); // Page<ForOneMenuNearbyView>

        setMenus((prev) =>
          nextPage === 0 ? data.content ?? [] : prev.concat(data.content ?? [])
        );
        setTotalPages(data.totalPages ?? 0);
        setPage(data.number ?? nextPage);
        console.log("nearby for-one menus:", data);
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
    <div className="p-4 flex justify-center">
      <div className="w-full max-w-[1200px]">
        <h2 className="flex items-center gap-2 text-xl mb-3 leading-none ">
          <IoRestaurantOutline className="text-[32px] relative top-[1px] shrink-0" />
          <span className="text-[22px]">주변 한그릇 펀딩 메뉴</span>
        </h2>

        {loading && menus.length === 0 ? (
          <p className="text-gray-400">메뉴를 불러오는 중입니다...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : menus.length === 0 ? (
          <p className="text-gray-500">근처 한그릇 메뉴를 찾지 못했습니다.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {menus.map((menu) => {
                const {
                  slotId,
                  menuName,
                  originalPrice,
                  fundingPrice,
                  discountPercent,
                  currentParticipants,
                  minParticipants,
                  endsAt,
                  restaurantName,
                  distance,
                  imageUrl,
                } = menu;

                const percent =
                  discountPercent != null
                    ? discountPercent
                    : originalPrice && fundingPrice
                    ? Math.round(
                        ((originalPrice - fundingPrice) / originalPrice) * 100
                      )
                    : 0;

                const imgSrc =
                  imageUrl || `/${Math.floor(Math.random() * 45 + 1)}.png`;
                const distLabel = Number.isFinite(Number(distance))
                  ? `${Math.round(Number(distance)).toLocaleString()}m 거리`
                  : "거리 정보 없음";

                const endDate = endsAt ? new Date(endsAt) : null;
                const daysLeft = endDate
                  ? Math.max(0, Math.ceil((endDate - new Date()) / 86400000))
                  : null;

                return (
                  <div
                    key={slotId}
                    className="bg-white shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition w-[267px] h-[430px] flex flex-col"
                  >
                    {/* 이미지 + 할인 퍼센트 배지 */}
                    <div className="relative w-full min-h-52 bg-gray-100 flex items-center justify-center text-gray-400">
                      {percent > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {percent}%
                        </span>
                      )}
                      <img
                        src={imgSrc}
                        alt={`${menuName} 이미지`}
                        className="w-full h-[240px] object-cover"
                      />
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="min-w-0">
                        {/* 이름 + 게이지 */}
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg font-semibold text-pink-700 truncate flex-1">
                            {menuName}
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
                          {restaurantName}
                        </p>

                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <TbCurrentLocation className="text-base" />
                          {distLabel}
                        </p>

                        {/* 가격 표시 */}
                        <div className="mt-2 flex items-baseline gap-2">
                          {originalPrice && (
                            <span className="text-gray-400 line-through text-sm">
                              {originalPrice.toLocaleString("ko-KR")}원
                            </span>
                          )}
                          {fundingPrice && (
                            <span className="text-red-600 font-bold text-lg">
                              {fundingPrice.toLocaleString("ko-KR")}원
                            </span>
                          )}
                        </div>

                        {/* 남은 기간 */}
                        {daysLeft != null && (
                          <div className="mt-2 flex items-center justify-between text-[13px]">
                            <div className="text-gray-800 truncate font-semibold">
                              {endDate
                                ? `${endDate.toLocaleDateString("ko-KR")} 종료`
                                : "기간 정보 없음"}
                            </div>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-md font-bold border ${
                                daysLeft <= 3
                                  ? "bg-red-50 text-red-600 border-red-200"
                                  : "bg-pink-100 text-pink-700 border-pink-200"
                              }`}
                            >
                              D-{daysLeft}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {canLoadMore && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => fetchNearby(page + 1)}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                >
                  {loading ? "불러오는 중…" : "더 보기"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NearbyForOneMenus;
