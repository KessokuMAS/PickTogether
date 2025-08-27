import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getCookie } from "../../utils/cookieUtil";

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
        setWishlistItems(wishlist);
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
      {/* 찜 목록 버튼 */}
      <button
        onClick={toggleWishlist}
        className="fixed bottom-32 right-6 w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40"
        aria-label="찜 목록 보기"
      >
        <FiHeart size={24} />
      </button>

      {/* 찜 목록 드롭다운 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-wishlist-dropdown
            className="fixed bottom-40 right-6 w-80 max-h-96 bg-white shadow-2xl border border-gray-200 rounded-2xl z-50 overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* 헤더 */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-red-500 to-red-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiHeart className="text-white" />찜 목록
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* 찜 목록 내용 */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-3"></div>
                  <p className="text-sm">찜 목록을 불러오는 중...</p>
                </div>
              ) : wishlistItems.length > 0 ? (
                <div className="p-4 space-y-3">
                  {wishlistItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(`/restaurant/${item.restaurantId}`);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors duration-200 group border border-gray-100"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={`/${item.restaurantId}.jpg`}
                          alt="레스토랑 이미지"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `/${
                              (item.restaurantId % 45) + 1
                            }.jpg`;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-red-600 transition-colors">
                          {item.restaurant?.name ||
                            `레스토랑 ${item.restaurantId}`}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {item.restaurant?.roadAddressName || "주소 정보 없음"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FiHeart className="mx-auto mb-3 text-gray-300" size={32} />
                  <p className="text-sm">찜한 레스토랑이 없습니다</p>
                  <p className="text-xs mt-1">레스토랑을 찜해보세요!</p>
                </div>
              )}
            </div>

            {/* 전체보기 버튼 */}
            {wishlistItems.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    navigate("/wishlist");
                    setIsOpen(false);
                  }}
                  className="w-full py-2 px-4 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 text-center block"
                >
                  찜 목록 전체보기
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WishlistDropdown;
