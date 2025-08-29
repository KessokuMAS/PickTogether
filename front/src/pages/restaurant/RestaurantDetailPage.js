import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  FiHeart,
} from "react-icons/fi";
import { IoRestaurantOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { FaHeart } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { getCookie } from "../../utils/cookieUtil";

// API Base URL
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8080";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Cart item animation (no scale to prevent image scaling)
const cartItemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

// Bar Progress Component
const BarProgress = ({ value = 0, maxValue = 100 }) => {
  const pct =
    maxValue > 0
      ? Math.max(0, Math.min(100, Math.round((value * 100) / maxValue)))
      : 0;
  const barColor = pct >= 80 ? "#ef4444" : pct >= 50 ? "#facc15" : "#3b82f6";

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-sm">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const { isLoggedIn } = useAuth();

  // 찜 상태 확인
  const checkWishlistStatus = useCallback(async () => {
    if (!isLoggedIn || !id) return;

    try {
      const memberData = getCookie("member");
      if (!memberData?.accessToken) return;

      const response = await fetch(
        `http://localhost:8080/api/wishlist/check/${id}`,
        {
          headers: {
            Authorization: `Bearer ${memberData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("찜 상태 확인 응답:", result);
        setIsWishlisted(result.isWishlisted);
      }
    } catch (error) {
      console.error("찜 상태 확인 실패:", error);
    }
  }, [isLoggedIn, id]);

  // 찜 상태 확인 useEffect
  useEffect(() => {
    checkWishlistStatus();
  }, [checkWishlistStatus]);

  // 찜 토글 함수
  const toggleWishlist = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (isWishlistLoading) return;

    try {
      setIsWishlistLoading(true);
      const memberData = getCookie("member");
      if (!memberData?.accessToken) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/wishlist/toggle`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${memberData.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            restaurantId: parseInt(id),
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("찜 토글 응답:", result);
        setIsWishlisted(result.isWishlisted);

        // 찜 추가/제거 시 모두 알림창 표시하지 않음 (시각적 피드백만)
      } else {
        const errorData = await response.json();
        console.error("찜 토글 오류 응답:", errorData);
        alert(errorData.message || "찜 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("찜 토글 실패:", error);
      alert("찜 처리에 실패했습니다.");
    } finally {
      setIsWishlistLoading(false);
    }
  };

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
    return [
      {
        id: base * 10 + 1,
        name: "묵은지두루치기",
        description: "신선한 재료로 만든 인기 메뉴",
        originalPrice: 15000,
        price: 12000,
        imageUrl: `/${base}m1.jpg`,
      },
      {
        id: base * 10 + 2,
        name: "생삼겹살",
        description: "그 무엇보다 두껍다",
        originalPrice: 14000,
        price: 10000,
        imageUrl: `/${base}m2.jpg`,
      },
      {
        id: base * 10 + 3,
        name: "철판쭈꾸미볶음",
        description: "살아서 움직일 수도 있어요",
        originalPrice: 18000,
        price: 15000,
        imageUrl: `/${base}m3.jpg`,
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
    // 로그인 상태 확인 (useAuth 사용)
    if (!isLoggedIn) {
      alert("로그인해주세요");
      return;
    }

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
      <div className="bg-orange-50 min-h-screen p-4 sm:p-6 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')]">
        <div className="w-full max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.div variants={itemVariants}>
            <Link
              to="/main"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-600 text-sm font-semibold mb-8 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400"
              aria-label="메인 페이지로 돌아가기"
            ></Link>
          </motion.div>

          {loading ? (
            <motion.div
              className="animate-pulse space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="min-h-[360px] bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl shadow-sm" />
                <div className="space-y-4">
                  <div className="h-9 w-3/4 bg-gray-100 rounded-lg" />
                  <div className="h-5 w-full bg-gray-100 rounded-lg" />
                  <div className="h-5 w-1/2 bg-gray-100 rounded-lg" />
                </div>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              className="text-center text-red-600 text-sm font-semibold py-16"
              variants={itemVariants}
            >
              {error}
            </motion.div>
          ) : data ? (
            <motion.div
              className="space-y-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Top Section: Image (Left) and Details (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
                {/* Hero Image */}
                <motion.div
                  className="relative w-full max-h-[670px] rounded-2xl overflow-hidden bg-gray-100 group shadow-md"
                  variants={itemVariants}
                >
                  <img
                    src="/gif.gif"
                    alt={data.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = `/${fallbackIdx}.png`;
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* 찜 버튼 */}
                  <button
                    onClick={toggleWishlist}
                    disabled={isWishlistLoading}
                    className="absolute top-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm text-orange-600 text-sm font-semibold rounded-full flex items-center gap-2 hover:bg-white hover:shadow-lg transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
                    aria-label={isWishlisted ? "찜 해제" : "찜 추가"}
                  >
                    {isWishlisted ? (
                      <FaHeart className="text-sm text-red-500" />
                    ) : (
                      <FiHeart className="text-sm" />
                    )}
                    {isWishlisted ? "찜 완료" : "찜"}
                  </button>

                  <button
                    onClick={handleShare}
                    className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-full flex items-center gap-2 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    aria-label="공유하기"
                  >
                    {copied ? "복사됨" : "공유"}
                    <FiShare2 className="text-sm" />
                  </button>
                </motion.div>

                {/* Details and Cart */}
                <motion.div
                  className="bg-white rounded-2xl p-8 shadow-md border border-orange-100 flex flex-col lg:sticky lg:top-8 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-gray-100"
                  variants={itemVariants}
                >
                  <div className="space-y-6">
                    {/* Restaurant Info */}
                    <div className="flex justify-center">
                      {/* 왼쪽: 이름 + 카테고리 */}
                      <div>
                        <img src="/우렁식탁.jfif" className="w-[180px]"></img>
                      </div>

                      {/* 오른쪽: 이미지 */}
                      {/* <img
                        className="w-[200px] h-[150px] ml-10"
                        src="/음식점1.jpg"
                        alt="음식점"
                      /> */}
                    </div>

                    <div>
                      <div className="text-2xl font-bold text-gray-900 mb-3">
                        {Number(
                          (data.fundingAmount ?? 0) +
                            (data.totalFundingAmount ?? 0)
                        ).toLocaleString()}
                        원 펀딩
                      </div>
                      <BarProgress
                        value={
                          (data.fundingAmount ?? 0) +
                          (data.totalFundingAmount ?? 0)
                        }
                        maxValue={data.fundingGoalAmount ?? 0}
                      />
                      <div className="mt-3 text-sm text-gray-600 flex items-center gap-3">
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
                    </div>
                    <div className="text-sm text-gray-600 space-y-3">
                      <div className="flex items-center gap-2">
                        <FiPhone className="text-orange-600 text-base" />
                        <span>{data.phone || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiMapPin className="text-orange-600 text-base" />
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
                          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-all duration-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                          aria-label="길찾기"
                        >
                          <TbCurrentLocation className="text-base" /> 길찾기
                        </a>
                      )}
                    </div>
                    {(data.priceRange || data.tags) && (
                      <div className="space-y-3">
                        {data.priceRange && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiTag className="text-orange-600 text-base" />
                            <span>가격대: {data.priceRange}</span>
                          </div>
                        )}
                        {data.tags && (
                          <div className="flex flex-wrap items-center gap-2">
                            <FiTag className="text-orange-600 text-base" />
                            <div className="flex flex-wrap gap-2">
                              {String(data.tags)
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean)
                                .map((t, idx) => (
                                  <span
                                    key={`${t}-${idx}`}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all duration-300"
                                  >
                                    {t}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cart Section */}
                    <motion.div
                      className="pt-6 border-t border-orange-100"
                      variants={itemVariants}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <FiShoppingCart className="text-orange-600 text-base" />
                          장바구니
                        </h2>
                        <span className="text-orange-600 font-semibold text-sm">
                          총 {totalPrice.toLocaleString()}원
                        </span>
                      </div>
                      {selectedMenus.length > 0 ? (
                        <>
                          <div className="space-y-3 max-h-48 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-gray-100">
                            {selectedMenus.map((menu, index) => (
                              <motion.div
                                key={menu.id}
                                className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg transition-all duration-300 hover:bg-orange-100 shadow-sm"
                                variants={cartItemVariants}
                                initial="hidden"
                                animate="visible"
                              >
                                <img
                                  src={menu.imageUrl}
                                  alt={menu.name}
                                  className="w-12 h-12 rounded-full object-cover border border-orange-100"
                                  onError={(e) => {
                                    // 각 메뉴별로 고유한 fallback 이미지 사용
                                    const base = Number(id) || 1;
                                    const menuNumber = (index % 3) + 1;
                                    e.currentTarget.src = `/${base}m${menuNumber}.png`;
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 text-sm">
                                    {menu.name}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {Number(menu.price).toLocaleString()}원 ×{" "}
                                    {menu.quantity}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      updateQuantity(menu.id, menu.quantity - 1)
                                    }
                                    className="w-8 h-8 rounded-full bg-orange-200 hover:bg-orange-300 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    aria-label={`Decrease quantity of ${menu.name}`}
                                  >
                                    <FiMinus className="text-sm text-orange-600" />
                                  </button>
                                  <span className="w-10 text-center text-sm font-medium text-gray-900">
                                    {menu.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(menu.id, menu.quantity + 1)
                                    }
                                    className="w-8 h-8 rounded-full bg-orange-200 hover:bg-orange-300 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    aria-label={`Increase quantity of ${menu.name}`}
                                  >
                                    <FiPlus className="text-sm text-orange-600" />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          <button
                            onClick={() => setSelectedMenus([])}
                            className="mt-4 w-full py-2.5 border border-orange-200 text-orange-600 text-sm font-semibold rounded-lg hover:bg-orange-50 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            aria-label="장바구니 비우기"
                          >
                            장바구니 비우기
                          </button>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 text-center">
                          장바구니가 비어 있습니다.
                        </p>
                      )}
                      <div className="mt-4">
                        <button
                          onClick={handleFundingClick}
                          className={`w-full px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 ${(() => {
                            if (!isLoggedIn) {
                              return "bg-gray-400 text-gray-600 cursor-not-allowed hover:bg-gray-400";
                            }
                            if (selectedMenus.length === 0) {
                              return "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300";
                            }
                            return "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-lg";
                          })()}`}
                          disabled={selectedMenus.length === 0 || !isLoggedIn}
                          aria-label={(() => {
                            if (!isLoggedIn) return "로그인이 필요합니다";
                            if (selectedMenus.length > 0)
                              return `펀딩 참여 (${selectedMenus.length} items)`;
                            return "펀딩 참여";
                          })()}
                        >
                          <FiShoppingCart className="text-base" />
                          {(() => {
                            if (!isLoggedIn) return "로그인 필요";
                            if (selectedMenus.length > 0)
                              return `펀딩 참여 (${selectedMenus.length})`;
                            return "펀딩 참여";
                          })()}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Menu Selection */}
              {menuItems.length > 0 && (
                <motion.div
                  className="bg-white rounded-2xl p-8 shadow-md border border-orange-100"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    className="flex items-center gap-2 mb-6"
                    variants={itemVariants}
                  >
                    <FiShoppingCart className="text-lg text-orange-600" />
                    <h2 className="text-xl font-bold text-gray-900">메뉴</h2>
                  </motion.div>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                  >
                    {menuItems.map((menu, index) => (
                      <motion.div
                        key={menu.id}
                        className="relative rounded-xl overflow-hidden bg-white group hover:shadow-lg hover:ring-2 hover:ring-orange-200 transition-all duration-300 border border-orange-100"
                        variants={itemVariants}
                      >
                        <div className="relative w-full aspect-[4/3] overflow-hidden">
                          <img
                            src={menu.imageUrl}
                            alt={menu.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              // 각 메뉴별로 고유한 fallback 이미지 사용
                              const base = Number(id) || 1;
                              const menuNumber = (index % 3) + 1;
                              e.currentTarget.src = `/gif.gif`;
                            }}
                          />
                          <div className="absolute inset-0 bg-orange-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                          <button
                            onClick={() => addToCart(menu)}
                            disabled={isAddingToCart[menu.id]}
                            className="absolute bottom-3 right-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-full flex items-center gap-2 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 shadow-md group-hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            aria-label={`Add ${menu.name} to cart`}
                          >
                            {addedToCart[menu.id] ? (
                              <>
                                <FiCheck className="text-sm" />
                                추가됨
                              </>
                            ) : (
                              <>
                                <FiPlus className="text-sm" />
                                추가
                              </>
                            )}
                          </button>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 text-lg truncate">
                              {menu.name}
                            </h3>
                            <div className="flex flex-col items-end">
                              {/* 원래 가격 */}
                              {menu.originalPrice &&
                                menu.originalPrice > menu.price && (
                                  <span className="text-gray-400 text-xs line-through">
                                    {Number(
                                      menu.originalPrice
                                    ).toLocaleString()}
                                    원
                                  </span>
                                )}
                              {/* 할인된 가격 */}
                              <span className="text-red-600 font-bold text-base">
                                {Number(menu.price).toLocaleString()}원
                              </span>
                            </div>
                          </div>
                          {menu.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {menu.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Additional Info */}
              {(data.description ||
                data.businessHours ||
                data.homepageUrl ||
                data.instagramUrl ||
                data.notice) && (
                <motion.div
                  className="bg-white rounded-2xl p-8 shadow-md border border-orange-100 space-y-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {data.description && (
                    <motion.div variants={itemVariants}>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">
                        소개
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {data.description}
                      </p>
                    </motion.div>
                  )}
                  {data.businessHours && (
                    <motion.div variants={itemVariants}>
                      <div className="flex items-center gap-2 font-bold text-gray-900 text-xl mb-4 tracking-tight">
                        <FiClock className="text-orange-600 text-lg" /> 영업시간
                      </div>
                      <p className="text-sm text-gray-600">
                        {data.businessHours}
                      </p>
                    </motion.div>
                  )}
                  {(data.homepageUrl || data.instagramUrl) && (
                    <motion.div
                      className="flex flex-wrap gap-4"
                      variants={itemVariants}
                    >
                      {data.homepageUrl && (
                        <a
                          href={data.homepageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-all duration-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                          aria-label="홈페이지 방문"
                        >
                          <FiGlobe className="text-lg" /> 홈페이지
                        </a>
                      )}
                      {data.instagramUrl && (
                        <a
                          href={data.instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-all duration-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                          aria-label="인스타그램 방문"
                        >
                          <FiInstagram className="text-lg" /> 인스타그램
                        </a>
                      )}
                    </motion.div>
                  )}
                  {data.notice && (
                    <motion.div variants={itemVariants}>
                      <div className="flex items-center gap-2 font-bold text-gray-900 text-xl mb-4 tracking-tight">
                        <FiAlertCircle className="text-orange-600 text-lg" />{" "}
                        공지
                      </div>
                      <p className="text-sm text-gray-600">{data.notice}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : null}
        </div>

        {/* Custom CSS */}
        <style jsx>{`
          .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: #f5a623 #f3f4f6;
          }
          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: #f5a623;
            border-radius: 9999px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: #f3f4f6;
            border-radius: 9999px;
          }
        `}</style>
      </div>
      {/* Footer Section */}
      <footer className="mt-4 bg-gray-350 text-gray-700 text-sm">
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 회사 소개 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-base">회사</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  회사소개
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  채용
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  블로그
                </a>
              </li>
            </ul>
          </div>

          {/* 서비스 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-base">서비스</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  개인정보처리방침
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  고객센터
                </a>
              </li>
            </ul>
          </div>

          {/* 고객센터 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-base">고객센터</h4>
            <ul className="space-y-2">
              <li>전화: 1234-5678</li>
              <li>이메일: support@example.com</li>
              <li>평일 09:00~18:00 (주말/공휴일 제외)</li>
            </ul>
          </div>

          {/* SNS */}
          <div className="space-y-3">
            <h4 className="font-semibold text-base">팔로우</h4>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="hover:text-gray-900 transition-colors"
                aria-label="인스타그램"
              >
                <FiInstagram size={20} />
              </a>
              <a
                href="#"
                className="hover:text-gray-900 transition-colors"
                aria-label="페이스북"
              >
                <FiGlobe size={20} />
              </a>
              <a
                href="#"
                className="hover:text-gray-900 transition-colors"
                aria-label="블로그"
              >
                <IoRestaurantOutline size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-8 border-t border-gray-400 pt-6 text-center text-gray-500 text-xs">
          © 2025 픽투게더. All rights reserved.
          <span className="block mt-1">
            서비스 이용 시 주의사항 및 법적 안내 문구
          </span>
        </div>
      </footer>
    </MainLayout>
  );
};

export default RestaurantDetailPage;
