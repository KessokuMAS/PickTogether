import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getCookie } from "../../utils/cookieUtil";

// 스크롤바 숨김 스타일
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

const WishlistDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // 찜 목록 로드
  const loadWishlist = async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      const memberData = getCookie("member");
      if (!memberData?.accessToken) return;

      const response = await fetch("http://localhost:8080/api/wishlist", {
        headers: {
          Authorization: `Bearer ${memberData.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const wishlist = await response.json();
        console.log("찜 목록 API 응답:", wishlist);

        // 각 찜한 레스토랑의 상세 정보 조회
        const detailedWishlist = await Promise.all(
          wishlist.map(async (item) => {
            try {
              const restaurantResponse = await fetch(
                `http://localhost:8080/api/restaurants/${item.restaurantId}`
              );
              if (restaurantResponse.ok) {
                const restaurantData = await restaurantResponse.json();
                return { ...item, ...restaurantData };
              }
            } catch (error) {
              console.error(
                `레스토랑 ${item.restaurantId} 정보 조회 실패:`,
                error
              );
            }
            return item;
          })
        );

        console.log("상세 정보가 포함된 찜 목록:", detailedWishlist);
        setWishlistItems(detailedWishlist);
      }
    } catch (error) {
      console.error("찜 목록 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 찜 목록 토글
  const toggleWishlist = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }

    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      loadWishlist();
    }
  };

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest("[data-wishlist-dropdown]")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isLoggedIn) return null;

  return (
    <>
      <style>{scrollbarHideStyles}</style>
      {/* 찜 목록 버튼 */}
      <button
        onClick={toggleWishlist}
        className={`fixed bottom-32 right-6 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-2xl hover:shadow-red-300/50 transition-all duration-300 flex items-center justify-center z-40 transform hover:scale-110 hover:-translate-y-1 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
        aria-label="찜 목록 보기"
      >
        <FiHeart size={24} />
      </button>

      {/* 찜 목록 드롭다운 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-wishlist-dropdown
            className="fixed bottom-40 right-6 w-80 max-h-120 bg-white/95 backdrop-blur-md shado-[0_20px_60px_-12px_rgba(0,0,0,0.25)] border border-white/20 rounded-3xl z-50 overflow-hidden"
            initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 30, scale: 0.9, rotateX: -15 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              transformStyle: "preserve-3d",
              perspective: "1000px",
            }}
          >
            {/* 헤더 */}
            <div className="p-5 border-b border-gray-100/50 bg-gradient-to-r from-red-500/90 to-red-600/90 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <FiHeart className="text-white" size={16} />
                  </div>
                  찜 목록
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* 찜 목록 내용 */}
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-3"></div>
                  <p className="text-sm">찜 목록을 불러오는 중...</p>
                </div>
              ) : wishlistItems.length > 0 ? (
                <div className="p-4 space-y-2">
                  {wishlistItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      onClick={() => {
                        navigate(`/restaurant/${item.restaurantId}`);
                        setIsOpen(false);
                      }}
                      className="group w-full p-3 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 border border-gray-100/50 hover:border-red-200/50 hover:shadow-lg hover:shadow-red-100/50 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                          <img
                            src={`/${item.restaurantId}.jpg`}
                            alt="레스토랑 이미지"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = `/${
                                (item.restaurantId % 45) + 1
                              }.jpg`;
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-red-600 transition-colors duration-300">
                            {item.restaurant?.name ||
                              item.name ||
                              `레스토랑 ${item.restaurantId}`}
                          </h4>
                          <p className="text-xs text-gray-500 truncate mt-1 group-hover:text-gray-600 transition-colors">
                            {item.restaurant?.roadAddressName ||
                              item.roadAddressName ||
                              "주소 정보 없음"}
                          </p>
                          {/* 퍼센트 정보 추가 */}
                          {(item.fundingPercent !== undefined ||
                            item.fundingAmount !== undefined) && (
                            <p className="text-xs text-red-500 font-medium mt-1">
                              {item.fundingPercent !== undefined
                                ? `${item.fundingPercent}% 달성`
                                : item.fundingAmount !== undefined
                                ? `${item.fundingAmount}원 펀딩`
                                : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiHeart className="text-gray-300" size={28} />
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    찜한 레스토랑이 없습니다
                  </p>
                  <p className="text-xs mt-2 text-gray-400">
                    마음에 드는 레스토랑을 찜해보세요!
                  </p>
                </div>
              )}
            </div>

            {/* 전체보기 버튼 */}
            <div className="p-4 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <button
                onClick={() => {
                  navigate("/wishlist");
                  setIsOpen(false);
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 text-center block shadow-lg hover:shadow-xl hover:shadow-red-200/50 transform hover:-translate-y-0.5"
              >
                찜 목록 전체보기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WishlistDropdown;
