import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IoRestaurantOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { FiHeart, FiTrash2 } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { getCookie } from "../../utils/cookieUtil";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Circular Progress Component (NearbyKakaoResturants.js와 동일)
function CircularProgress({ value = 0, size = 50, stroke = 4 }) {
  const raw = Math.max(0, Math.round(value));
  const pct = Math.min(100, raw);

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
          fontSize: raw >= 100 ? `${size * 0.25}px` : `${size * 0.3}px`,
          color: raw >= 80 ? "#b91c1c" : raw >= 50 ? "#a16207" : "#1e40af",
        }}
      >
        {raw}%
      </span>
    </div>
  );
}

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 찜 목록 로드 (백엔드 API 사용)
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        const memberData = getCookie("member");
        console.log("쿠키에서 가져온 member 데이터:", memberData);

        if (!memberData) {
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }

        const token = memberData.accessToken;
        console.log("추출된 토큰:", token);

        if (!token) {
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8080/api/wishlist", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const wishlistData = await response.json();

          // 각 찜한 레스토랑의 상세 정보 가져오기
          const items = await Promise.all(
            wishlistData.map(async (wishlistItem) => {
              try {
                const restaurantResponse = await fetch(
                  `http://localhost:8080/api/restaurants/nearby?lat=37.5027&lng=127.0352&radius=10000&page=0&size=1000`
                );
                if (restaurantResponse.ok) {
                  const data = await restaurantResponse.json();
                  const restaurant = data.content?.find(
                    (store) => store.restaurantId == wishlistItem.restaurantId
                  );
                  return restaurant;
                }
              } catch (e) {
                console.error(
                  `레스토랑 ${wishlistItem.restaurantId} 정보 로드 실패:`,
                  e
                );
                return null;
              }
            })
          );

          setWishlistItems(items.filter(Boolean));
        } else {
          setError("찜 목록을 불러오지 못했습니다.");
        }
      } catch (e) {
        console.error("찜 목록 로드 실패:", e);
        setError("찜 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  // 찜 제거 (백엔드 API 사용)
  const removeFromWishlist = async (restaurantId) => {
    try {
      const memberData = getCookie("member");
      if (!memberData) {
        alert("로그인이 필요합니다.");
        return;
      }

      const token = memberData.accessToken;

      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/wishlist/${restaurantId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setWishlistItems((prev) =>
          prev.filter((item) => item.restaurantId !== restaurantId)
        );
      } else {
        console.error("찜 제거 실패");
      }
    } catch (e) {
      console.error("찜 제거 에러:", e);
    }
  };

  // 찜 목록 비우기 (백엔드 API 사용)
  const clearAllWishlist = async () => {
    if (window.confirm("찜 목록을 모두 비우시겠습니까?")) {
      try {
        const memberData = getCookie("member");
        if (!memberData) {
          alert("로그인이 필요합니다.");
          return;
        }

        const token = memberData.accessToken;

        if (!token) {
          alert("로그인이 필요합니다.");
          return;
        }

        // 각 찜 항목을 개별적으로 삭제
        const deletePromises = wishlistItems.map((item) =>
          fetch(`http://localhost:8080/api/wishlist/${item.restaurantId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
        );

        await Promise.all(deletePromises);
        setWishlistItems([]);
      } catch (e) {
        console.error("찜 목록 비우기 에러:", e);
      }
    }
  };

  // 에러 상태
  if (error) {
    return (
      <MainLayout>
        <div className="bg-orange-50 min-h-screen p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center py-20">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                오류가 발생했습니다
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-all duration-300"
                >
                  다시 시도
                </button>
                <button
                  onClick={() => navigate("/main")}
                  className="px-6 py-3 bg-gray-500 text-white text-sm font-semibold rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  메인으로 가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="bg-orange-50 min-h-screen p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-1/3 bg-gray-100 rounded-lg"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-80 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-orange-50 min-h-screen p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-6xl mx-auto">
          {/* 헤더 */}
          <motion.div
            className="flex items-center justify-between mb-8"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaHeart className="text-red-500 text-2xl" />찜 목록
              </h1>
              <p className="text-gray-600 mt-2">
                내가 찜한 펀딩 음식점들을 확인해보세요
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/main")}
                className="px-4 py-2 bg-gray-500 text-white text-sm font-semibold rounded-lg hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
              >
                <IoRestaurantOutline className="text-base" />
                메인으로
              </button>
              {wishlistItems.length > 0 && (
                <button
                  onClick={clearAllWishlist}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
                >
                  <FiTrash2 className="text-base" />
                  전체 삭제
                </button>
              )}
            </div>
          </motion.div>

          {/* 찜 목록 */}
          {wishlistItems.length === 0 ? (
            <motion.div
              className="text-center py-20"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <FaHeart className="text-gray-300 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                찜한 음식점이 없습니다
              </h3>
              <p className="text-gray-500 mb-6">
                메인 페이지에서 마음에 드는 음식점을 찜해보세요
              </p>
              <button
                onClick={() => navigate("/main")}
                className="px-6 py-3 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-all duration-300"
              >
                메인으로 가기
              </button>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {wishlistItems.map((restaurant) => {
                const {
                  restaurantId,
                  name,
                  roadAddressName,
                  distance,
                  fundingAmount,
                  fundingGoalAmount,
                  imageUrl,
                  fundingEndDate,
                  totalFundingAmount,
                  categoryName,
                } = restaurant;

                const actualFundingAmount =
                  (fundingAmount || 0) + (totalFundingAmount || 0);
                const percent =
                  fundingGoalAmount > 0 && actualFundingAmount >= 0
                    ? Math.round(
                        (Number(actualFundingAmount) * 100) /
                          Number(fundingGoalAmount)
                      )
                    : 0;

                const displayImage =
                  imageUrl && imageUrl.includes("uploads/")
                    ? `http://localhost:8080/${imageUrl}`
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
                  <motion.div
                    key={restaurantId}
                    className="relative border border-gray-300 transition w-full h-[380px] flex flex-col group rounded-lg bg-white hover:shadow-lg"
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-full h-48 bg-gray-100 overflow-hidden relative group rounded-t-lg">
                      <img
                        src={displayImage}
                        alt={`${name} 이미지`}
                        className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      />
                      {daysLeft === 0 && percent >= 100 && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-[14px] font-semibold px-2 py-1 rounded shadow">
                          펀딩 성공
                        </div>
                      )}
                      {/* 찜 해제 버튼 */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromWishlist(restaurantId);
                        }}
                        className="absolute top-2 left-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md"
                        aria-label="찜 해제"
                      >
                        <FaHeart className="text-white text-sm" />
                      </button>
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

                    {/* 클릭 영역 */}
                    <button
                      onClick={() => navigate(`/restaurant/${restaurantId}`)}
                      className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-orange-500 bg-opacity-10 px-4 py-2 rounded-lg"
                      aria-label={`${name} 상세보기`}
                    >
                      <span className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                        상세보기
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default WishlistPage;
