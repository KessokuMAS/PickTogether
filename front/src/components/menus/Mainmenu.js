// src/components/layout/MainMenu.js
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiMapPin,
  FiShoppingCart,
  FiHeart,
  FiTrendingUp,
  FiMessageSquare,
} from "react-icons/fi";
import { GiArtificialIntelligence } from "react-icons/gi";
import { useAuth } from "../../context/AuthContext";
import { listMemberLocations } from "../../api/memberApi";

// ==========================
// 로고 + 글자 애니메이션
// ==========================
const AnimatedLogo = () => {
  const text = "PickTogether";

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08 },
    },
  };

  const letter = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
  };

  return (
    <Link to="/" className="flex items-center">
      <img src="/logo1.png" alt="PickTogether" className="h-[95px] w-auto" />
      <motion.span
        className="text-2xl font-bold tracking-wide font-poppins flex"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {text.split("").map((char, idx) => (
          <motion.span
            key={idx}
            className={idx < 4 ? "text-red-600" : "text-black"}
            variants={letter}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </Link>
  );
};

// ==========================
// 메뉴 항목
// ==========================
const menuItems = [
  {
    to: "/for-one",
    icon: FiShoppingCart,
    label: "한 그릇",
    color: "text-orange-500",
  },
  {
    to: "/local-specialty",
    icon: FiHeart,
    label: "지역특산품",
    color: "text-red-500",
  },
  {
    to: "/trending",
    icon: FiTrendingUp,
    label: "인기펀딩",
    color: "text-yellow-500",
  },
  {
    to: "/ai-recommend",
    icon: GiArtificialIntelligence,
    label: "AI 추천",
    color: "text-blue-500",
  },
  {
    to: "/community",
    icon: FiMessageSquare,
    label: "커뮤니티",
    color: "text-green-500",
  },
];

// ==========================
// 메인 메뉴
// ==========================
const MainMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [regionName, setRegionName] = useState("");
  const [locations, setLocations] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [isLocationBarOpen, setIsLocationBarOpen] = useState(false);
  const locationBarRef = useRef(null);

  const { isLoggedIn, userInfo, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/main");
  };

  // 스크롤 상태 감지
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 저장된 위치 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("selectedLocation");
    if (saved) {
      const { address } = JSON.parse(saved);
      setRegionName(address || "");
    }
  }, []);

  // 회원 위치 목록 API 호출
  const fetchLocations = async () => {
    try {
      setListError("");
      setListLoading(true);
      const list = await listMemberLocations();
      setLocations(Array.isArray(list) ? list : []);
    } catch (e) {
      setListError("주소지 목록을 불러오지 못했습니다.");
    } finally {
      setListLoading(false);
    }
  };

  // 카카오맵 선택 메시지 수신
  useEffect(() => {
    const handler = (e) => {
      if (!e?.data || typeof e.data !== "object") return;
      if (e.data.type === "ADDRESS_SELECTED") {
        const addr = e.data.address || "";
        setRegionName(addr);
        localStorage.setItem(
          "selectedLocation",
          JSON.stringify({
            address: addr,
            lat: e.data.lat ?? null,
            lng: e.data.lng ?? null,
          })
        );
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // 위치바 토글
  const toggleLocationBar = async () => {
    const next = !isLocationBarOpen;
    setIsLocationBarOpen(next);
    if (next) await fetchLocations();
  };

  // 저장된 위치 선택
  const selectSavedLocation = (loc) => {
    const address =
      loc.address ||
      loc.alias ||
      loc.label ||
      loc.roadAddress ||
      loc.road_address_name ||
      "";
    if (!address) return;
    const selected = {
      address,
      lat: loc.lat ?? loc.y ?? null,
      lng: loc.lng ?? loc.x ?? null,
    };
    localStorage.setItem("selectedLocation", JSON.stringify(selected));
    setRegionName(address);
    setIsLocationBarOpen(false);
  };

  // 외부 클릭 시 위치바 닫기
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!isLocationBarOpen) return;
      if (
        locationBarRef.current &&
        !locationBarRef.current.contains(e.target)
      ) {
        setIsLocationBarOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isLocationBarOpen]);

  // 위치 설정 팝업
  const openLocationPopup = () => {
    window.open("/location", "위치 설정", "width=800,height=700");
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-md border-b border-gray-200"
            : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <AnimatedLogo />

            {/* 데스크탑 메뉴 */}
            <div className="hidden lg:flex flex-1 justify-center space-x-6">
              {menuItems.map(({ to, icon: Icon, label, color }) => (
                <Link
                  key={to + label}
                  to={to}
                  className="flex items-center space-x-2 text-black hover:text-emerald-600 transition-colors duration-200 py-2 px-3 rounded-full hover:bg-emerald-50 relative group"
                >
                  <Icon size={20} className={color} />
                  <span className="font-semibold text-1xl">{label}</span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></div>
                </Link>
              ))}
            </div>

            {/* 계정 / 모바일 메뉴 */}
            <div className="flex items-center gap-4">
              {/* 데스크탑 메뉴 */}
              <div className="hidden md:flex items-center gap-3">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/mypage"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 px-3 py-1.5 rounded-full hover:bg-emerald-50 transition-colors duration-200"
                    >
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                        <FiUser size={14} className="text-emerald-600" />
                      </div>
                      <span>마이페이지</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors duration-200"
                    >
                      <FiLogOut size={16} />
                      <span>로그아웃</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/member/login"
                    className="text-sm font-semibold text-gray-700 hover:text-emerald-600 px-3 py-1.5 rounded-full hover:bg-emerald-50 transition-colors duration-200"
                  >
                    회원가입/로그인
                  </Link>
                )}
              </div>

              {/* 모바일 메뉴 버튼 */}
              <button
                className="lg:hidden p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* 위치바 + 검색창 */}
          {!isScrolled && (
            <div
              ref={locationBarRef}
              className="w-full border-b border-gray-100 bg-white"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={openLocationPopup}
                  className="flex items-center space-x-2 w-fit text-left"
                >
                  <FiMapPin size={18} className="text-emerald-600" />
                  <span className="text-base font-bold text-gray-500">
                    위치
                  </span>
                  <span className="text-base font-bold text-gray-800">
                    {regionName || "지역 미선택"}
                  </span>
                </button>

                <div className="relative w-1/2 max-w-md">
                  <input
                    type="text"
                    placeholder="원하는 상품을 검색하세요"
                    className="w-full rounded-full border border-gray-300 pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default MainMenu;
