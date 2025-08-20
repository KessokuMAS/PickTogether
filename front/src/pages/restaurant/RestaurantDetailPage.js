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
  FiCheck,
  FiMinus,
} from "react-icons/fi";
import { IoRestaurantOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";

// API Base URL
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8080";

// Bar Progress Component
const BarProgress = ({ value = 0, maxValue = 100 }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const barColor = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#3b82f6";

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full bg-gray-100 rounded-full h-6">
        <div
          className="h-6 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
        <span>{pct}% 달성</span>
        <span>목표 {maxValue.toLocaleString()}원</span>
      </div>
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
  const [isAddingToCart, setIsAddingToCart] = useState({});
  const [addedToCart, setAddedToCart] = useState({});

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
    const fallback = `/${fallbackIdx}.png`;
    const url = data?.imageUrl;
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${API_BASE}${url}`;
    return url;
  }, [data, fallbackIdx]);

  // Funding period calculation
  const fundingPeriod = useMemo(() => {
    const now = new Date();
    const addDays = 7 + ((Number(id) || 0) % 8);
    const end = new Date(now);
    end.setDate(end.getDate() + addDays);
    const daysLeft = Math.max(
      0,
      Math.ceil((end.getTime() - now.getTime()) / 86400000)
    );
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
    const pick = (offset) => `/${((base + offset) % 45) + 1}.png`;
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
      if (isAddingToCart[menu.id]) return;
      setIsAddingToCart((prev) => ({ ...prev, [menu.id]: true }));
      setAddedToCart((prev) => ({ ...prev, [menu.id]: true }));
      setSelectedMenus((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === menu.id);
        if (existingIndex >= 0) {
          const updatedMenus = [...prev];
          updatedMenus[existingIndex] = {
            ...updatedMenus[existingIndex],
            quantity: updatedMenus[existingIndex].quantity + 1,
          };
          return updatedMenus;
        }
        return [...prev, { ...menu, quantity: 1 }];
      });
      setTimeout(() => {
        setIsAddingToCart((prev) => ({ ...prev, [menu.id]: false }));
        setAddedToCart((prev) => ({ ...prev, [menu.id]: false }));
      }, 1000);
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

  // Handle funding button click
  const handleFundingClick = () => {
    if (selectedMenus.length === 0) {
      alert("메뉴를 선택해주세요");
      return;
    }
    const params = new URLSearchParams({
      restaurantId: String(id || ""),
      restaurantName: data?.name || "",
      menus: JSON.stringify(selectedMenus),
      totalPrice: String(totalPrice),
    }).toString();
    window.location.href = `/payment?${params}`;
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen p-4 sm:p-8 bg-[url('https://www.transparenttextures.com/patterns/light-wool.png')]">
        <div className="w-full max-w-7xl mx-auto">
          {/* Back Button */}
          <Link
            to="/main"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 text-sm font-medium mb-8 transition-colors"
          >
            <IoRestaurantOutline className="text-lg" /> 뒤로
          </Link>

          {loading ? (
            <div className="animate-pulse space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="col-span-3 h-96 bg-gray-100 rounded-2xl" />
                <div className="col-span-2 space-y-4">
                  <div className="h-12 w-80 bg-gray-100 rounded-lg" />
                  <div className="h-6 w-full bg-gray-100 rounded-lg" />
                  <div className="h-6 w-1/2 bg-gray-100 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-72 bg-gray-100 rounded-2xl" />
                ))}
              </div>
            </div>
          ) : error ? (
            <p className="text-red-600 text-center text-lg font-medium">
              {error}
            </p>
          ) : data ? (
            <div className="space-y-10">
              {/* Top Section: Image (Left) and Details (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Hero Image (Left, larger, fills div) */}
                <div className="col-span-3 relative w-full aspect-[3/2] rounded-2xl overflow-hidden bg-gray-100 group shadow-md">
                  <img
                    src={imgSrc}
                    alt={data.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = `/${fallbackIdx}.png`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <button
                    onClick={handleShare}
                    className="absolute top-4 right-4 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md animate-fade-in"
                  >
                    {copied ? "복사됨" : "공유"}
                    <FiShare2 />
                  </button>
                </div>

                {/* Details (Right) */}
                <div className="col-span-2 bg-white rounded-2xl p-8 shadow-md border border-teal-100">
                  <h1 className="text-5xl font-bold text-gray-800 mb-4 tracking-tight">
                    {data.name}
                  </h1>
                  {data.categoryName && (
                    <span className="inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-full bg-teal-50 text-teal-600 mb-6 animate-fade-in">
                      {data.categoryName}
                    </span>
                  )}
                  <div className="flex flex-col gap-6">
                    {/* Funding Info */}
                    <div>
                      <div className="text-3xl font-bold text-gray-800 mb-3">
                        {Number(data.fundingAmount ?? 0).toLocaleString()}원
                        펀딩
                      </div>
                      <BarProgress
                        value={data.fundingPercent ?? 0}
                        maxValue={data.fundingGoalAmount ?? 0}
                      />
                      <div className="mt-4 text-base text-gray-600 flex items-center gap-2">
                        <span
                          className={`${
                            fundingPeriod.daysLeft <= 5
                              ? "text-red-600 font-semibold"
                              : "text-gray-600"
                          }`}
                        >
                          {fundingPeriod.daysLeft}일 남음
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>
                          {formatDate(fundingPeriod.start)} ~{" "}
                          {formatDate(fundingPeriod.end)}
                        </span>
                      </div>
                      <button
                        onClick={handleFundingClick}
                        className="mt-6 px-8 py-3 bg-emerald-600 text-white text-lg font-semibold rounded-full hover:bg-emerald-700 transition-colors flex items-center gap-3 shadow-md animate-fade-in"
                      >
                        <FiShoppingCart className="text-xl" /> 펀딩 참여
                      </button>
                    </div>
                    {/* Basic Info */}
                    <div className="text-base text-gray-600 space-y-4">
                      <div className="flex items-center gap-3">
                        <FiPhone className="text-teal-600 text-lg" />
                        <span>{data.phone || "-"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiMapPin className="text-teal-600 text-lg" />
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
                          className="inline-flex items-center gap-3 text-teal-600 hover:text-teal-700 transition-colors"
                        >
                          <TbCurrentLocation className="text-lg" /> 길찾기
                        </a>
                      )}
                    </div>
                    {/* Price and Tags */}
                    {(data.priceRange || data.tags) && (
                      <div className="space-y-4">
                        {data.priceRange && (
                          <div className="flex items-center gap-3 text-base text-gray-600">
                            <FiTag className="text-teal-600 text-lg" />
                            <span>가격대: {data.priceRange}</span>
                          </div>
                        )}
                        {data.tags && (
                          <div className="flex flex-wrap items-center gap-3">
                            <FiTag className="text-teal-600 text-lg" />
                            <div className="flex flex-wrap gap-2">
                              {String(data.tags)
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean)
                                .map((t, idx) => (
                                  <span
                                    key={`${t}-${idx}`}
                                    className="px-3 py-1.5 text-sm font-semibold rounded-full bg-teal-50 text-teal-600 animate-fade-in"
                                  >
                                    {t}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Selection */}
              {menuItems.length > 0 && (
                <div className="bg-gradient-to-b from-teal-50 to-white rounded-2xl p-8 shadow-md">
                  <div className="flex items-center gap-3 mb-6">
                    <FiShoppingCart className="text-xl text-teal-600" />
                    <h2 className="text-2xl font-bold text-gray-800">메뉴</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((menu, index) => (
                      <div
                        key={menu.id}
                        className="relative rounded-2xl overflow-hidden bg-white group hover:shadow-xl hover:ring-2 hover:ring-teal-300 transition-all duration-500 border border-teal-100"
                      >
                        <div className="relative w-full h-56 overflow-hidden">
                          <img
                            src={menu.imageUrl}
                            alt={menu.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = `/${
                                ((fallbackIdx + index) % 45) + 1
                              }.png`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute bottom-4 right-4">
                            <button
                              onClick={() => addToCart(menu)}
                              disabled={isAddingToCart[menu.id]}
                              className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-full flex items-center gap-2 hover:bg-emerald-700 transition-all duration-300 disabled:opacity-50 shadow-md group-hover:scale-105 animate-fade-in"
                            >
                              {addedToCart[menu.id] ? (
                                <>
                                  <FiCheck className="text-lg" />
                                  추가됨
                                </>
                              ) : (
                                <>
                                  <FiPlus className="text-lg" />
                                  추가
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 text-xl truncate">
                              {menu.name}
                            </h3>
                            <span className="text-red-600 font-semibold text-lg">
                              {Number(menu.price).toLocaleString()}원
                            </span>
                          </div>
                          {menu.description && (
                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                              {menu.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Menus */}
              {selectedMenus.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      장바구니
                    </h2>
                    <span className="text-red-600 font-semibold text-lg">
                      총 {totalPrice.toLocaleString()}원
                    </span>
                  </div>
                  <div className="space-y-4">
                    {selectedMenus.map((menu) => (
                      <div
                        key={menu.id}
                        className="flex items-center justify-between p-4 bg-teal-50 rounded-lg transition-all duration-300 animate-fade-in"
                      >
                        <div>
                          <div className="font-semibold text-gray-800 text-lg">
                            {menu.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {Number(menu.price).toLocaleString()}원 ×{" "}
                            {menu.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              updateQuantity(menu.id, menu.quantity - 1)
                            }
                            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all duration-300"
                          >
                            <FiMinus className="text-base text-teal-600" />
                          </button>
                          <span className="w-8 text-center text-base font-medium text-gray-800">
                            {menu.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(menu.id, menu.quantity + 1)
                            }
                            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all duration-300"
                          >
                            <FiPlus className="text-base text-teal-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={handleFundingClick}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white text-lg font-semibold rounded-full hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-md animate-fade-in"
                    >
                      <FiShoppingCart className="text-xl" />
                      결제 ({selectedMenus.length})
                    </button>
                    <button
                      onClick={() => setSelectedMenus([])}
                      className="px-6 py-3 border border-teal-200 text-emerald-600 text-sm font-semibold rounded-full hover:bg-teal-50 transition-all duration-300 animate-fade-in"
                    >
                      초기화
                    </button>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-white rounded-2xl p-8 shadow-md space-y-6">
                {data.description && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      소개
                    </h3>
                    <p className="text-base text-gray-600 leading-relaxed">
                      {data.description}
                    </p>
                  </div>
                )}
                {data.businessHours && (
                  <div>
                    <div className="flex items-center gap-3 font-bold text-gray-800 text-lg mb-3">
                      <FiClock className="text-teal-600 text-lg" /> 영업시간
                    </div>
                    <p className="text-base text-gray-600">
                      {data.businessHours}
                    </p>
                  </div>
                )}
                {(data.homepageUrl || data.instagramUrl) && (
                  <div className="flex flex-wrap gap-4">
                    {data.homepageUrl && (
                      <a
                        href={data.homepageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-teal-600 hover:text-teal-700 transition-colors text-base font-semibold animate-fade-in"
                      >
                        <FiGlobe className="text-lg" /> 홈페이지
                      </a>
                    )}
                    {data.instagramUrl && (
                      <a
                        href={data.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-teal-600 hover:text-teal-700 transition-colors text-base font-semibold animate-fade-in"
                      >
                        <FiInstagram className="text-lg" /> 인스타그램
                      </a>
                    )}
                  </div>
                )}
                {data.notice && (
                  <div>
                    <div className="flex items-center gap-3 font-bold text-gray-800 text-lg mb-3">
                      <FiAlertCircle className="text-teal-600 text-lg" /> 공지
                    </div>
                    <p className="text-base text-gray-600">{data.notice}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Custom CSS for Animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default RestaurantDetailPage;
