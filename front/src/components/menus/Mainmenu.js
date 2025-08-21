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
import SearchBar from "../common/SearchBar";

// Animated Logo Component
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
      <img src="/logo.png" alt="PickTogether" className="h-[95px] w-auto" />
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

// Menu Items
const menuItems = [
  {
    to: "/for-one",
    icon: FiShoppingCart,
    label: "한 그릇",
    color: "text-teal-600",
    hoverColor: "hover:text-teal-700",
    hoverBg: "hover:bg-teal-50",
    underlineColor: "bg-teal-600",
  },
  {
    to: "/local-specialty",
    icon: FiHeart,
    label: "지역특산품",
    color: "text-red-500",
    hoverColor: "hover:text-red-600",
    hoverBg: "hover:bg-red-50",
    underlineColor: "bg-red-500",
  },
  {
    to: "/trending",
    icon: FiTrendingUp,
    label: "인기펀딩",
    color: "text-yellow-500",
    hoverColor: "hover:text-yellow-600",
    hoverBg: "hover:bg-yellow-50",
    underlineColor: "bg-yellow-500",
  },
  {
    to: "/ai-recommend",
    icon: GiArtificialIntelligence,
    label: "AI 추천",
    color: "text-blue-500",
    hoverColor: "hover:text-blue-600",
    hoverBg: "hover:bg-blue-50",
    underlineColor: "bg-blue-500",
  },
  {
    to: "/community",
    icon: FiMessageSquare,
    label: "커뮤니티",
    color: "text-gray-600",
    hoverColor: "hover:text-gray-500",
    hoverBg: "hover:bg-gray-50",
    underlineColor: "bg-gray-600",
  },
];

// Main Menu Component
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

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load saved location
  useEffect(() => {
    const saved = localStorage.getItem("selectedLocation");
    if (saved) {
      const { address } = JSON.parse(saved);
      setRegionName(address || "");
    }
  }, []);

  // Fetch member locations
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

  // Handle KakaoMap address selection
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

  // Toggle location bar
  const toggleLocationBar = async () => {
    const next = !isLocationBarOpen;
    setIsLocationBarOpen(next);
    if (next) await fetchLocations();
  };

  // Select saved location
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

  // Close location bar on outside click
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

  // Open location popup
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

            {/* Desktop Menu */}
            <div className="hidden lg:flex flex-1 justify-center space-x-6">
              {menuItems.map(
                ({
                  to,
                  icon: Icon,
                  label,
                  color,
                  hoverColor,
                  hoverBg,
                  underlineColor,
                }) => (
                  <Link
                    key={to + label}
                    to={to}
                    className={`flex items-center space-x-2 text-black ${hoverColor} transition-colors duration-200 py-2 px-3 rounded-full ${hoverBg} relative group`}
                  >
                    <Icon size={20} className={color} />
                    <span className="font-semibold text-1xl">{label}</span>
                    <div
                      className={`absolute bottom-0 left-0 w-0 h-0.5 ${underlineColor} group-hover:w-full transition-all duration-300`}
                    ></div>
                  </Link>
                )
              )}
            </div>

            {/* Account / Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Desktop Account Menu */}
              <div className="hidden md:flex items-center gap-3">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/mypage"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 px-3 py-1.5 rounded-full hover:bg-orange-50 transition-colors duration-200"
                    >
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <FiUser size={14} className="text-orange-600" />
                      </div>
                      <span>마이페이지</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors duration-200"
                    >
                      <FiLogOut size={16} className="text-red-600" />
                      <span>로그아웃</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/member/login"
                    className="text-sm font-semibold text-gray-700 hover:text-orange-600 px-3 py-1.5 rounded-full hover:bg-orange-50 transition-colors duration-200"
                  >
                    회원가입/로그인
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Location Bar + Search */}
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
                  <FiMapPin size={18} className="text-orange-600" />
                  <span className="text-base font-bold text-gray-500">
                    위치
                  </span>
                  <span className="text-base font-bold text-gray-800">
                    {regionName || "지역 미선택"}
                  </span>
                </button>

                <SearchBar />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          className="lg:hidden fixed top-24 left-0 w-full bg-white shadow-lg z-40"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {menuItems.map(
              ({ to, icon: Icon, label, color, hoverColor, hoverBg }) => (
                <Link
                  key={to + label}
                  to={to}
                  className={`flex items-center space-x-3 text-black ${hoverColor} ${hoverBg} py-3 px-4 rounded-lg transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={20} className={color} />
                  <span className="font-semibold text-lg">{label}</span>
                </Link>
              )
            )}
            {isLoggedIn ? (
              <>
                <Link
                  to="/mypage"
                  className="flex items-center space-x-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 py-3 px-4 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUser size={20} className="text-orange-600" />
                  <span className="font-semibold text-lg">마이페이지</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 text-gray-600 hover:text-red-600 hover:bg-red-50 py-3 px-4 rounded-lg transition-colors duration-200 w-full text-left"
                >
                  <FiLogOut size={20} className="text-red-600" />
                  <span className="font-semibold text-lg">로그아웃</span>
                </button>
              </>
            ) : (
              <Link
                to="/member/login"
                className="flex items-center space-x-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 py-3 px-4 rounded-lg transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiUser size={20} className="text-orange-600" />
                <span className="font-semibold text-lg">회원가입/로그인</span>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default MainMenu;
