import React, { useEffect, useState, useCallback } from "react";
import { IoRestaurantOutline, IoFilter, IoChevronDown } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { FaFire, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiHamburger, GiNoodles, GiBowlOfRice } from "react-icons/gi";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const API_BASE =
  (import.meta?.env?.VITE_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080") + "/api/for-one";

// Circular Progress Component
function CircularProgress({ value = 0, size = 48, stroke = 4 }) {
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

const ForOneListComponent = () => {
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(3);
  const [totalPages, setTotalPages] = useState(0);
  const [coords, setCoords] = useState(null);
  const [sort, setSort] = useState("default");

  // Fetch location
  useEffect(() => {
    const saved = localStorage.getItem("selectedLocation");
    if (!saved) {
      console.warn("📦 위치 정보 없음");
      setError("위치 정보를 선택해주세요.");
      setLoading(false);
      return;
    }

    try {
      const data = JSON.parse(saved);
      const lat = parseFloat(data.lat);
      const lng = parseFloat(data.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("유효하지 않은 좌표 형식입니다.");
      }
      setCoords({ lat, lng });
    } catch (e) {
      console.error("❌ 좌표 파싱 실패:", e);
      setError("유효하지 않은 좌표 형식입니다.");
      setLoading(false);
    }
  }, []);

  // Fetch nearby menus
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

        setMenus((prev) =>
          nextPage === 0
            ? data.content ?? []
            : [...prev, ...(data.content ?? [])]
        );
        setTotalPages(data.totalPages ?? 0);
        setPage(data.number ?? nextPage);
      } catch (e) {
        console.error("📡 API 오류:", e);
        setError("메뉴 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [coords, size]
  );

  useEffect(() => {
    if (coords) fetchNearby(0);
  }, [coords, fetchNearby]);

  // Apply sorting
  useEffect(() => {
    let filtered = [...menus];

    if (sort === "priceLow") {
      filtered.sort((a, b) => (a.fundingPrice || 0) - (b.fundingPrice || 0));
    } else if (sort === "priceHigh") {
      filtered.sort((a, b) => (b.fundingPrice || 0) - (a.fundingPrice || 0));
    } else if (sort === "distance") {
      filtered.sort(
        (a, b) => (Number(a.distance) || 0) - (Number(b.distance) || 0)
      );
    }

    setFilteredMenus(filtered);
  }, [menus, sort]);

  const canLoadMore = page + 1 < totalPages;

  // Custom arrow components for carousel
  const renderArrowPrev = (onClickHandler, hasPrev, label) =>
    hasPrev && (
      <button
        type="button"
        onClick={onClickHandler}
        title={label}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 text-teal-600 p-3 rounded-full hover:bg-teal-600 hover:text-white transition-all z-10 shadow-md"
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
        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 text-teal-600 p-3 rounded-full hover:bg-teal-600 hover:text-white transition-all z-10 shadow-md"
      >
        <FaChevronRight className="text-xl" />
      </button>
    );

  // Category icon mapping
  const getCategoryIcon = (menuName) => {
    if (menuName.includes("김치") || menuName.includes("불고기"))
      return <GiBowlOfRice className="text-teal-600 text-lg" />;
    if (menuName.includes("버거") || menuName.includes("피자"))
      return <GiHamburger className="text-teal-600 text-lg" />;
    return <GiNoodles className="text-teal-600 text-lg" />;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen bg-[url('https://www.transparenttextures.com/patterns/light-wool.png')]">
      <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[3fr,1fr] gap-8">
        {/* Main Content */}
        <div>
          {/* Hero Section */}
          <div className="mb-10 text-center bg-gradient-to-b from-teal-100 to-white p-10 rounded-2xl shadow-lg">
            <h1 className="text-4xl font-bold text-teal-700 mb-4 tracking-tight">
              한그릇 펀딩으로 맛있는 한 끼를!
            </h1>
            <p className="text-gray-600 max-w-[600px] mx-auto text-lg font-medium">
              서초동 근처에서 할인된 가격으로 맛있는 메뉴를 즐겨보세요!
            </p>
            <div className="w-full max-w-[640px] mx-auto mt-6 rounded-2xl shadow-xl overflow-hidden">
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
                {filteredMenus.length > 0 ? (
                  filteredMenus.map((menu) => (
                    <div key={menu.slotId} className="relative">
                      <img
                        src={menu.imageUrl || "/default-menu.png"}
                        alt={`${menu.menuName} 배너`}
                        className="w-full h-[300px] object-cover brightness-90 transition-all duration-300"
                      />
                      {menu.discountPercent >= 30 && (
                        <span className="absolute top-4 right-4 bg-yellow-400 text-gray-900 text-sm font-bold px-3 py-1.5 rounded-full z-10 shadow-md">
                          🔥 Hot Deal
                        </span>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                        <p className="text-white text-lg font-semibold">
                          {menu.menuName} - {menu.discountPercent}% 할인
                        </p>
                        <button
                          onClick={() => {
                            const menuData = {
                              id: menu.slotId,
                              name: menu.menuName,
                              price: menu.fundingPrice || menu.originalPrice,
                              quantity: 1,
                            };
                            const queryParams = new URLSearchParams({
                              restaurantId: menu.restaurantId,
                              restaurantName: menu.restaurantName,
                              menus: JSON.stringify([menuData]),
                              totalPrice:
                                menu.fundingPrice || menu.originalPrice,
                              type: "restaurant",
                            });
                            window.location.href = `/payment?${queryParams.toString()}`;
                          }}
                          className="mt-3 px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition shadow-md"
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
                      alt="한그릇 펀딩 소개"
                      className="w-full h-[300px] object-cover brightness-90"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                      <p className="text-white text-lg font-semibold">
                        지금 펀딩에 참여하세요!
                      </p>
                      <button
                        className="mt-3 px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 transition shadow-md"
                        onClick={() => (window.location.href = "/funding")}
                      >
                        자세히 보기
                      </button>
                    </div>
                  </div>
                )}
              </Carousel>
            </div>
          </div>

          {/* Sort Section */}
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-teal-700 mb-4">
              <IoRestaurantOutline className="text-2xl" />
              서초동 근처 한그릇 맛집
            </h2>
            <div className="flex flex-wrap gap-3">
              <div className="relative flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-teal-100">
                <div className="flex items-center gap-1">
                  <IoFilter className="text-teal-600 text-base" />
                  <label className="text-xs font-semibold text-gray-700">
                    정렬
                  </label>
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full sm:w-40 pl-2 pr-7 py-1.5 border border-gray-200 rounded-lg bg-gradient-to-r from-teal-50 to-white text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="default">기본</option>
                  <option value="priceLow">가격 낮은 순</option>
                  <option value="priceHigh">가격 높은 순</option>
                  <option value="distance">가까운 순</option>
                </select>
                <div className="absolute right-3 pointer-events-none">
                  <IoChevronDown className="text-teal-600 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Menu Section */}
          {loading && filteredMenus.length === 0 ? (
            <p className="text-gray-600 text-center text-lg flex items-center justify-center gap-3">
              <svg
                className="animate-spin h-6 w-6 text-teal-600"
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
              메뉴를 불러오는 중...
            </p>
          ) : error ? (
            <p className="text-red-600 text-center text-lg font-medium">
              {error}
            </p>
          ) : filteredMenus.length === 0 ? (
            <p className="text-gray-600 text-center text-lg font-medium">
              근처에 펀딩 메뉴가 없습니다.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenus.map((menu) => {
                  const {
                    slotId,
                    menuName,
                    originalPrice,
                    fundingPrice,
                    discountPercent,
                    currentParticipants,
                    minParticipants,
                    restaurantName,
                    distance,
                    imageUrl,
                    endsAt,
                  } = menu;

                  const discountPct =
                    discountPercent != null
                      ? discountPercent
                      : originalPrice && fundingPrice
                      ? Math.round(
                          ((originalPrice - fundingPrice) / originalPrice) * 100
                        )
                      : 0;

                  const achievementPct =
                    minParticipants > 0
                      ? Math.round(
                          (currentParticipants / minParticipants) * 100
                        )
                      : 0;

                  const imgSrc = imageUrl || "/default-menu.png";
                  const distLabel = Number.isFinite(Number(distance))
                    ? `${Math.round(Number(distance)).toLocaleString()}m`
                    : "거리 정보 없음";

                  const endDate = endsAt ? new Date(endsAt) : null;
                  const daysLeft = endDate
                    ? Math.max(0, Math.ceil((endDate - new Date()) / 86400000))
                    : 0;

                  return (
                    <div
                      key={slotId}
                      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:ring-2 hover:ring-teal-300 transition-all duration-300 group flex flex-col"
                    >
                      {/* Image Section */}
                      <div className="relative h-52 overflow-hidden">
                        {discountPct > 0 && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full z-10 shadow-sm">
                            {discountPct}% OFF
                          </span>
                        )}
                        <img
                          src={imgSrc}
                          alt={`${menuName} 이미지`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-teal-600 bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-300">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              const menuData = {
                                id: slotId,
                                name: menuName,
                                price: fundingPrice || originalPrice,
                                quantity: 1,
                              };
                              const queryParams = new URLSearchParams({
                                restaurantId: slotId, // 임시로 slotId 사용
                                restaurantName: restaurantName,
                                menus: JSON.stringify([menuData]),
                                totalPrice: fundingPrice || originalPrice,
                                type: "restaurant",
                              });
                              window.location.href = `/payment?${queryParams.toString()}`;
                            }}
                            className="px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-teal-700 shadow-md"
                          >
                            펀딩 참여
                          </button>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-xl font-semibold text-gray-800 truncate flex items-center gap-2">
                              {getCategoryIcon(menuName)}
                              {menuName}
                            </h3>
                            <CircularProgress
                              value={achievementPct}
                              size={44}
                              stroke={4}
                            />
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-2 font-medium">
                            {restaurantName || "-"}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                            <TbCurrentLocation className="text-teal-600 text-lg" />
                            {distLabel}
                          </p>
                          <div className="mt-3 flex items-baseline gap-3">
                            {originalPrice && (
                              <span className="text-gray-400 line-through text-sm">
                                {originalPrice.toLocaleString("ko-KR")}원
                              </span>
                            )}
                            {fundingPrice && (
                              <span className="text-red-600 font-semibold text-lg">
                                {fundingPrice.toLocaleString("ko-KR")}원
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            <span
                              className={`flex items-center gap-2 ${
                                daysLeft <= 5
                                  ? "text-red-600 font-semibold"
                                  : "text-gray-600"
                              }`}
                            >
                              <FaFire
                                className={`${
                                  daysLeft <= 5
                                    ? "text-red-600"
                                    : "text-gray-600"
                                } text-lg`}
                              />
                              {daysLeft}일 남음
                            </span>
                            <span className="text-green-600 font-semibold">
                              👥 {currentParticipants}/{minParticipants}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {canLoadMore && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => fetchNearby(page + 1)}
                    disabled={loading}
                    className="px-6 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-full hover:bg-teal-700 disabled:opacity-50 transition shadow-md flex items-center gap-2"
                  >
                    {loading && (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                    )}
                    {loading ? "불러오는 중…" : "더 보기"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            <h3 className="text-xl font-semibold text-teal-700 mb-4">
              인기 카테고리
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition flex items-center gap-3"
                  onClick={() => alert("한식 필터 기능 준비 중!")}
                >
                  <GiBowlOfRice className="text-teal-600 text-lg" />
                  한식
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition flex items-center gap-3"
                  onClick={() => alert("양식 필터 기능 준비 중!")}
                >
                  <GiHamburger className="text-teal-600 text-lg" />
                  양식
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition flex items-center gap-3"
                  onClick={() => alert("아시안 필터 기능 준비 중!")}
                >
                  <GiNoodles className="text-teal-600 text-lg" />
                  아시안
                </button>
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-teal-700 mb-4">
                오늘의 추천
              </h3>
              <div className="relative rounded-lg overflow-hidden shadow-md">
                <img
                  src="../27-1.png"
                  alt="추천 펀딩"
                  className="w-full h-40 object-cover brightness-90"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-sm font-semibold">
                    오늘의 특가 펀딩!
                  </p>
                  <button
                    className="mt-2 px-4 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-full hover:bg-teal-700 transition shadow-md"
                    onClick={() => alert("추천 펀딩 페이지로 이동!")}
                  >
                    바로 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForOneListComponent;
