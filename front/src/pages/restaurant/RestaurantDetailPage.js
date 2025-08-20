import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  fetchRestaurantDetail,
  fetchRestaurantMenus,
} from "../../api/restaurantApi";
import {
  FiPhone,
  FiMapPin,
  FiClock,
  FiTag,
  FiGlobe,
  FiInstagram,
  FiAlertCircle,
  FiShare2,
  FiShoppingCart,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { IoRestaurantOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";

// API Base URL
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8080";

// 이미지 URL을 프론트엔드에서 접근 가능한 URL로 변환
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  // 백엔드에서 반환된 상대 경로를 절대 URL로 변환
  return `${API_BASE}/${imageUrl}`;
};

// Circular Progress Component
const CircularProgress = ({ value = 0, size = 60, stroke = 4 }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  const strokeColor = pct >= 80 ? "#ef4444" : pct >= 50 ? "#facc15" : "#3b82f6";

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
};

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch restaurant details
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchRestaurantDetail(id);
        setData(res);
      } catch (e) {
        setError("상세 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Fallback index for placeholder images
  const fallbackIdx = useMemo(() => ((Number(id) || 0) % 45) + 1, [id]);

  // Image source with fallback
  const imgSrc = useMemo(() => {
    const fallback = `/${fallbackIdx}.jpg`;
    const url = data?.imageUrl;

    if (!url) return fallback;

    // 승인된 가게 요청인지 확인 (uploads/ 포함 여부)
    const hasCustomImage = url && url.includes("uploads/");

    if (hasCustomImage) {
      // 승인된 가게: 실제 이미지 사용
      return getImageUrl(url);
    } else {
      // 기존 CSV 데이터: ID 기반 이미지 사용
      return fallback;
    }
  }, [data, fallbackIdx]);

  // Funding period calculation
  const fundingPeriod = useMemo(() => {
    const now = new Date();
    const addDays = 7 + ((Number(id) || 0) % 8);
    const end = new Date(now);
    end.setDate(end.getDate() + addDays);
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / 86400000);
    return { start: now, end, daysLeft };
  }, [id]);

  const formatDate = (d) =>
    d
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\.\s/g, ".")
      .replace(/\.$/, "");

  // Fallback menu items
  const fallbackMenuItems = useMemo(() => {
    const base = Number(id) || 1;
    const pick = (offset) => `/${((base + offset) % 45) + 1}.jpg`;
    return [
      {
        id: base * 10 + 1,
        name: "대표 메뉴 A",
        description: "신선한 재료로 만든 인기 메뉴",
        price: 12000,
        imageUrl: pick(1),
      },
      {
        id: base * 10 + 2,
        name: "대표 메뉴 B",
        description: "담백하고 건강한 한 끼",
        price: 9800,
        imageUrl: pick(2),
      },
      {
        id: base * 10 + 3,
        name: "세트 메뉴",
        description: "가성비 좋은 구성",
        price: 15000,
        imageUrl: pick(3),
      },
    ];
  }, [id]);

  // Fetch menu items
  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const menus = await fetchRestaurantMenus(id);
        setMenuItems(
          Array.isArray(menus) && menus.length > 0 ? menus : fallbackMenuItems
        );
      } catch (e) {
        setMenuItems(fallbackMenuItems);
      }
    })();
  }, [id, fallbackMenuItems]);

  // Total price calculation
  const totalPrice = useMemo(
    () =>
      selectedMenus.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [selectedMenus]
  );

  // Handle menu addition
  const addToCart = useCallback(
    (menu) => {
      if (isAddingToCart) return; // 중복 실행 방지

      setIsAddingToCart(true);
      setSelectedMenus((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === menu.id);
        if (existingIndex >= 0) {
          // 기존 아이템이 있으면 수량을 1씩만 증가
          const updatedMenus = [...prev];
          updatedMenus[existingIndex] = {
            ...updatedMenus[existingIndex],
            quantity: updatedMenus[existingIndex].quantity + 1,
          };
          return updatedMenus;
        }
        // 새 아이템이면 수량 1로 추가
        return [...prev, { ...menu, quantity: 1 }];
      });

      // 짧은 지연 후 플래그 리셋
      setTimeout(() => setIsAddingToCart(false), 100);
    },
    [isAddingToCart]
  );

  // Update menu quantity
  const updateQuantity = useCallback((menuId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedMenus((prev) => prev.filter((item) => item.id !== menuId));
      return;
    }
    setSelectedMenus((prev) =>
      prev.map((item) =>
        item.id === menuId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, []);

  // Handle share
  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: data?.name || "레스토랑", url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (e) {
      console.error("Share failed:", e);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 flex justify-center bg-white min-h-screen">
        <div className="w-full max-w-[1200px]">
          <Link
            to="/main"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mb-4"
          >
            <IoRestaurantOutline /> 뒤로
          </Link>

          {loading ? (
            <div className="animate-pulse">
              <div className="w-full h-64 bg-gray-200 rounded-lg" />
              <div className="mt-4 space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : data ? (
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 group">
                <img
                  src={imgSrc}
                  alt={data.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = `/${fallbackIdx}.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <button
                    onClick={handleShare}
                    className="px-4 py-2 text-white font-bold rounded bg-black bg-opacity-80 hover:bg-opacity-100 transition"
                  >
                    {copied ? "링크 복사됨" : "공유하기"}
                  </button>
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-black">{data.name}</h1>
                  <CircularProgress value={data.fundingPercent ?? 0} />
                </div>
                {data.categoryName && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 mt-2">
                    {data.categoryName}
                  </span>
                )}
                <div className="mt-4 text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <FiPhone />
                    <span>{data.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin />
                    <span className="truncate">
                      {data.roadAddressName || "-"}
                    </span>
                  </div>
                  {data.y && data.x && (
                    <a
                      href={`https://map.kakao.com/link/to/${encodeURIComponent(
                        data.name || ""
                      )},${data.y},${data.x}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <TbCurrentLocation /> 길찾기
                    </a>
                  )}
                </div>

                {/* Funding Info */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {Number(data.fundingAmount ?? 0).toLocaleString()}원 펀딩
                    </span>
                    <span>
                      목표{" "}
                      {Number(data.fundingGoalAmount ?? 0).toLocaleString()}원
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        fundingPeriod.daysLeft <= 5
                          ? "text-red-600 bg-red-100"
                          : "text-black bg-gray-100"
                      }`}
                    >
                      {fundingPeriod.daysLeft}일 남음
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(fundingPeriod.start)} ~{" "}
                      {formatDate(fundingPeriod.end)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Selection */}
              {menuItems.length > 0 && (
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FiShoppingCart className="text-xl" />
                    <h2 className="text-lg font-bold">메뉴 선택</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {menuItems.map((menu, index) => (
                      <div
                        key={menu.id}
                        className="border border-gray-300 rounded-lg overflow-hidden bg-white group"
                      >
                        <div className="w-full h-40 bg-gray-100 relative">
                          <img
                            src={menu.imageUrl}
                            alt={menu.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              const idx = ((fallbackIdx + index) % 45) + 1;
                              e.currentTarget.src = `/${idx}.jpg`;
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-black truncate">
                              {menu.name}
                            </h3>
                            <span className="text-green-600 font-bold">
                              {Number(menu.price).toLocaleString()}원
                            </span>
                          </div>
                          {menu.description && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {menu.description}
                            </p>
                          )}
                          <button
                            onClick={() => addToCart(menu)}
                            className="mt-3 w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                          >
                            장바구니에 추가
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Menus */}
              {selectedMenus.length > 0 && (
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">선택된 메뉴</h2>
                    <span className="text-green-600 font-bold">
                      총 {totalPrice.toLocaleString()}원
                    </span>
                  </div>
                  <div className="space-y-3">
                    {selectedMenus.map((menu) => (
                      <div
                        key={menu.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-black">
                            {menu.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {Number(menu.price).toLocaleString()}원 ×{" "}
                            {menu.quantity}개
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(menu.id, menu.quantity - 1)
                            }
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <FiMinus className="text-sm" />
                          </button>
                          <span className="w-8 text-center font-bold">
                            {menu.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(menu.id, menu.quantity + 1)
                            }
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <FiPlus className="text-sm" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => {
                        const params = new URLSearchParams({
                          restaurantId: String(id || ""),
                          restaurantName: data?.name || "",
                          menus: JSON.stringify(selectedMenus),
                          totalPrice: String(totalPrice),
                        }).toString();
                        window.location.href = `/payment?${params}`;
                      }}
                      className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                    >
                      펀딩 참여하기 ({selectedMenus.length}개)
                    </button>
                    <button
                      onClick={() => setSelectedMenus([])}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                    >
                      전체 삭제
                    </button>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-white border border-gray-300 rounded-lg p-6 space-y-4">
                {data.description && (
                  <div>
                    <h3 className="font-semibold text-black">소개</h3>
                    <p className="text-gray-600">{data.description}</p>
                  </div>
                )}
                {data.businessHours && (
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      <FiClock /> 영업시간
                    </div>
                    <p className="text-gray-600">{data.businessHours}</p>
                  </div>
                )}
                {(data.priceRange || data.tags) && (
                  <div className="space-y-2">
                    {data.priceRange && (
                      <div className="flex items-center gap-2">
                        <FiTag />
                        <span>가격대: {data.priceRange}</span>
                      </div>
                    )}
                    {data.tags && (
                      <div className="flex flex-wrap items-center gap-2">
                        <FiTag />
                        <div className="flex flex-wrap gap-2">
                          {String(data.tags)
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .map((t, idx) => (
                              <span
                                key={`${t}-${idx}`}
                                className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                              >
                                {t}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {(data.homepageUrl || data.instagramUrl) && (
                  <div className="flex flex-wrap gap-3">
                    {data.homepageUrl && (
                      <a
                        href={data.homepageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <FiGlobe /> 홈페이지
                      </a>
                    )}
                    {data.instagramUrl && (
                      <a
                        href={data.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-pink-600 hover:text-pink-800"
                      >
                        <FiInstagram /> 인스타그램
                      </a>
                    )}
                  </div>
                )}
                {data.notice && (
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      <FiAlertCircle /> 공지
                    </div>
                    <p className="text-gray-600">{data.notice}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </MainLayout>
  );
};

export default RestaurantDetailPage;
