// src/components/layout/MainMenu.js
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiMapPin,
  FiHome,
  FiUsers,
  FiShoppingCart,
  FiHeart,
  FiTrendingUp,
  FiMessageSquare,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import { listMemberLocations } from "../../api/memberApi";

const Logo = () => (
  <Link
    to="/"
    className="flex items-center gap-2 text-gray-900 hover:text-emerald-600 transition-colors duration-200 "
  >
    <img src="/logo.png" alt="PickTogether" className="h-[95px] w-auto " />
  </Link>
);

const MainMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 위치 상태
  const [regionName, setRegionName] = useState("");
  const [locations, setLocations] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  // 위치바 드롭다운
  const [isLocationBarOpen, setIsLocationBarOpen] = useState(false);
  const locationBarRef = useRef(null);

  const { isLoggedIn, userInfo, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/main");
  };

  // 스크롤 헤더 효과
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 초기 지역명 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem("selectedLocation");
      if (saved) {
        const { address } = JSON.parse(saved);
        setRegionName(address || "");
      }
    } catch {
      /* noop */
    }
  }, []);

  // 저장된 위치 목록 로드
  const fetchLocations = async () => {
    try {
      setListError("");
      setListLoading(true);
      const list = await listMemberLocations();
      setLocations(Array.isArray(list) ? list : []);
      console.log("로케이션 정보", list);
    } catch (e) {
      console.error(e);
      setListError("주소지 목록을 불러오지 못했습니다.");
    } finally {
      setListLoading(false);
    }
  };

  // 팝업에서 postMessage 수신
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

  // 위치바 클릭 → 드롭다운 토글
  const toggleLocationBar = async () => {
    const next = !isLocationBarOpen;
    setIsLocationBarOpen(next);
    if (next) {
      await fetchLocations();
    }
  };

  // 드롭다운 외부 클릭 닫기
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

  // 위치 설정 팝업(버튼 전용)
  const openLocationPopup = () => {
    window.open("/location", "위치 설정", "width=800,height=700");
  };

  return (
    <>
      {/* 메인 네비게이션 */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100"
            : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 pt-6 pb-5">
            <Logo />

            {/* 데스크톱 메뉴 */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* 위치 설정 버튼 → 팝업만 */}
              <button
                onClick={openLocationPopup}
                className="flex items-center space-x-1 text-black hover:text-emerald-600 transition-colors duration-200 group relative py-2 px-3 rounded-full hover:bg-emerald-50"
              >
                <img src="/location.png" alt="" className="w-9 h-9" />
                <span className="text-base font-bold">위치 설정</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></div>
              </button>

              {/* 메뉴 링크 (퍼블릭 이미지 사용) */}
              {[
                { to: "/for-one", icon: "/bowl.png", label: "한 그릇" },
                {
                  to: "/local-specialty",
                  icon: "/prawn.png",
                  label: "지역특산품",
                },
                { to: "/trending", icon: "/fire.png", label: "인기펀딩" },
                {
                  to: "/trending",
                  icon: "/artificial-intelligence.png",
                  label: "AI 추천",
                },
                {
                  to: "/community",
                  icon: "/conversation.png",
                  label: "커뮤니티",
                },
              ].map(({ to, icon, label }) => (
                <Link
                  key={to + label}
                  to={to}
                  className="flex items-center space-x-1 text-black hover:text-emerald-600 transition-colors duration-200 group relative py-2 px-3 rounded-full hover:bg-emerald-50"
                >
                  <img
                    src={icon}
                    alt={label}
                    className="w-8 h-8 object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                  <span className="text-base font-bold">{label}</span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></div>
                </Link>
              ))}
            </div>

            {/* 우측 아이콘/계정 */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors duration-200">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                        <FiUser size={14} className="text-emerald-600" />
                      </div>
                      <span className="text-base font-bold text-gray-700 truncate max-w-[140px]">
                        {userInfo?.nickname || userInfo?.email}
                      </span>
                    </div>

                    <Link
                      to="/mypage"
                      className="text-base font-bold text-gray-600 hover:text-emerald-600 transition-colors duration-200 px-3 py-1.5 rounded-full hover:bg-emerald-50"
                    >
                      내 펀딩
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-base font-bold text-gray-600 hover:text-red-500 transition-colors duration-200 px-3 py-1.5 rounded-full hover:bg-red-50"
                    >
                      <FiLogOut size={16} />
                      <span>로그아웃</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/member/login"
                    className="text-base font-bold text-gray-700 hover:text-emerald-600 transition-colors duration-200 px-3 py-1.5 rounded-full hover:bg-emerald-50"
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
                {isMenuOpen ? (
                  <FiX
                    size={24}
                    className="transition-transform duration-200"
                  />
                ) : (
                  <FiMenu
                    size={24}
                    className="transition-transform duration-200"
                  />
                )}
              </button>
            </div>
          </div>

          {/* 동그란 모바일 메뉴 */}
          {isMenuOpen && (
            <div className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
              <div className="relative bg-white rounded-full w-80 h-80 flex items-center justify-center shadow-xl">
                {/* 닫기 버튼 */}
                <button
                  className="absolute top-3 right-3 p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-red-50 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiX size={20} />
                </button>

                {/* 원형 메뉴 아이템 */}
                <div className="absolute w-full h-full flex items-center justify-center">
                  {[
                    { to: "/funding", icon: FiHome, label: "펀딩", angle: 0 },
                    {
                      to: "/group-buy",
                      icon: FiShoppingCart,
                      label: "공동구매",
                      angle: 60,
                    },
                    {
                      to: "/local-specialty",
                      icon: FiHeart,
                      label: "특산품",
                      angle: 120,
                    },
                    {
                      to: "/community",
                      icon: FiMessageSquare,
                      label: "커뮤니티",
                      angle: 180,
                    },
                    {
                      to: "/trending",
                      icon: FiTrendingUp,
                      label: "인기펀딩",
                      angle: 240,
                    },
                    {
                      to: "/my-funding",
                      icon: FiUsers,
                      label: "내 펀딩",
                      angle: 300,
                    },
                  ].map(({ to, icon: Icon, label, angle }) => (
                    <Link
                      key={to}
                      to={to}
                      className="absolute flex flex-row items-center justify-center w-24 h-12 bg-emerald-100 rounded-full hover:bg-emerald-200 transition-all duration-300 hover:scale-110"
                      style={{
                        transform: `rotate(${angle}deg) translate(110px) rotate(-${angle}deg)`,
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon size={20} className="text-emerald-600" />
                      <span className="text-sm font-bold text-gray-700 ml-2">
                        {label}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* 사용자 정보/로그인 */}
                <div className="absolute bottom-3 w-full text-center">
                  {isLoggedIn ? (
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                        <FiUser size={16} className="text-emerald-600" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 truncate max-w-[120px]">
                        {userInfo?.nickname || userInfo?.email}
                      </span>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-full transition-all duration-200"
                      >
                        로그아웃
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/member/login"
                      className="text-sm font-bold text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-full transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      로그인
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 현재 선택 위치 표시 바 + 드롭다운 (여기가 선택 UI) */}
        <div
          className="fixed top-16 left-0 w-full bg-gray-50 z-40 border-b border-gray-100"
          ref={locationBarRef}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 mt-6">
            <button
              type="button"
              onClick={toggleLocationBar}
              className="flex items-center space-x-2 w-fit text-left"
              aria-expanded={isLocationBarOpen}
              aria-controls="location-dropdown"
              title="저장된 위치 선택"
            >
              <FiMapPin size={18} className="text-emerald-600" />
              <span className="text-base font-bold text-gray-500">위치</span>
              <span className="text-base font-bold text-gray-800">
                {regionName || "지역 미선택"}
              </span>
            </button>

            {/* 드롭다운 */}
            {isLocationBarOpen && (
              <div
                id="location-dropdown"
                className="mt-2 w-full max-w-xl bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="px-4 py-3 border-b bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700">
                    저장된 위치 선택
                  </p>
                </div>

                <div className="max-h-72 overflow-auto">
                  {listLoading ? (
                    <div className="p-4 text-sm text-gray-500">
                      불러오는 중…
                    </div>
                  ) : listError ? (
                    <div className="p-4 text-sm text-red-500">{listError}</div>
                  ) : locations.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">
                      저장된 위치가 없습니다. 상단의 '위치 설정' 버튼으로
                      추가하세요.
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {locations.map((loc) => (
                        <li
                          key={loc.id || loc.address || Math.random()}
                          className="p-3 hover:bg-emerald-50 cursor-pointer"
                          onClick={() => selectSavedLocation(loc)}
                        >
                          <p className="text-sm font-bold text-gray-800 truncate">
                            ({loc.name}){loc.address}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center justify-end px-3 py-2 bg-gray-50 border-t">
                  <button
                    onClick={() => setIsLocationBarOpen(false)}
                    className="text-sm px-3 py-1.5 rounded-full hover:bg-gray-100 text-gray-600 font-semibold"
                  >
                    닫기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default MainMenu;
