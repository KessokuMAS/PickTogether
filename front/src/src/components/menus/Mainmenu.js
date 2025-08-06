import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
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
import { FaHandshake } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

const Logo = () => (
  <Link
    to="/"
    className="flex items-center gap-3 text-gray-900 hover:text-blue-600 transition-colors"
  >
    <img src="/logo.png" alt="PickTogether" className="h-24 w-auto" />
  </Link>
);

const MainMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("서울");
  const [selectedDistrict, setSelectedDistrict] = useState("전체");
  const { isLoggedIn, userInfo, logout } = useAuth();
  const navigate = useNavigate();

  const regions = [
    {
      id: "seoul",
      name: "서울",
      districts: [
        "강남구",
        "강동구",
        "강북구",
        "강서구",
        "광진구",
        "노원구",
        "도봉구",
        "동대문구",
        "마포구",
        "서대문구",
        "서초구",
        "성동구",
        "성북구",
        "송파구",
        "양천구",
        "영등포구",
        "용산구",
        "은평구",
        "종로구",
        "중구",
        "중랑구",
      ],
    },
    {
      id: "gyeonggi",
      name: "경기",
      districts: [
        "가평군",
        "고양군",
        "고양시",
        "과천시",
        "광명시",
        "광주시",
        "구리시",
        "김포시",
        "남양주시",
        "동두천시",
        "부천시",
        "성남시",
        "시흥시",
        "안산시",
        "안성시",
        "안양시",
        "양평군",
        "여주시",
        "연천군",
        "오산시",
        "용인시",
        "의왕시",
        "의정부시",
        "이천시",
        "파주시",
        "평택시",
        "포천군",
        "하남시",
        "화성시",
        "수원시",
        "군포시",
      ],
    },
    {
      id: "incheon",
      name: "인천",
      districts: [
        "강화군",
        "계양구",
        "남동구",
        "동구",
        "미추홀구",
        "부평구",
        "서구",
        "연수구",
        "옹진군",
        "중구",
      ],
    },
    {
      id: "busan",
      name: "부산",
      districts: [
        "강서구",
        "금정구",
        "기장군",
        "남구",
        "동구",
        "동래구",
        "부산진구",
        "북구",
        "사상구",
        "사하구",
        "서구",
        "수영구",
        "연제구",
        "영도구",
        "중구",
        "해운대구",
      ],
    },
    {
      id: "daegu",
      name: "대구",
      districts: [
        "달성군",
        "달서구",
        "동구",
        "북구",
        "서구",
        "수성구",
        "중구",
        "남구",
      ],
    },
    {
      id: "daejeon",
      name: "대전",
      districts: ["대덕구", "동구", "서구", "유성구", "중구"],
    },
    {
      id: "gwangju",
      name: "광주",
      districts: ["광산구", "남구", "동구", "북구", "서구"],
    },
    {
      id: "ulsan",
      name: "울산",
      districts: ["남구", "동구", "북구", "울주군", "중구"],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/main");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const selectedRegionData = regions.find(
    (region) => region.name === selectedRegion
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
            : "bg-white"
        }`}
      >
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-32">
            {/* 로고 */}
            <Logo />

            {/* 데스크톱 메뉴 */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                to="/funding"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors menu-font group relative"
              >
                <FiHome
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>펀딩 탐색</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link
                to="/group-buy"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors menu-font group relative"
              >
                <FiShoppingCart
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>공동구매(1인 식사권)</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link
                to="/local-specialty"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors menu-font group relative"
              >
                <FiHeart
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>지역특산품</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link
                to="/community"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors menu-font group relative"
              >
                <FiMessageSquare
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>커뮤니티</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link
                to="/trending"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors menu-font group relative"
              >
                <FiTrendingUp
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>인기펀딩</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link
                to="/trending"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors menu-font group relative"
              >
                <FiTrendingUp
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>펀딩 요청</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link
                to="/trending"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors menu-font group relative"
              >
                <FiTrendingUp
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>AI 추천</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
            </div>

            {/* 우측 아이콘들 */}
            <div className="flex items-center space-x-6">
              {/* 검색 */}
              <button className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 group">
                <FiSearch
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
              </button>

              {/* 로그인 상태에 따른 표시 */}
              <div className="hidden md:flex items-center space-x-4">
                {isLoggedIn ? (
                  <>
                    {/* 사용자 정보 */}
                    <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUser size={16} className="text-blue-600" />
                      </div>
                      <span className="text-sm menu-font text-gray-700">
                        {userInfo?.nickname || userInfo?.email}
                      </span>
                    </div>

                    {/* 내 펀딩 */}
                    <Link
                      to="/my-funding"
                      className="text-sm menu-font text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
                    >
                      내 펀딩
                    </Link>

                    {/* 가게 등록 */}
                    <Link
                      to="/store-register"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm button-font hover:bg-blue-700 transition-colors"
                    >
                      가게 등록
                    </Link>

                    {/* 로그아웃 */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-sm menu-font text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-md hover:bg-red-50"
                    >
                      <FiLogOut size={16} />
                      <span>로그아웃</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* 회원가입 */}
                    <Link
                      to="/member/register"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm button-font hover:bg-blue-700 transition-colors"
                    >
                      회원가입
                    </Link>

                    {/* 로그인 */}
                    <Link
                      to="/member/login"
                      className="text-sm menu-font text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-md hover:bg-blue-50"
                    >
                      로그인
                    </Link>
                  </>
                )}
              </div>

              {/* 모바일 메뉴 버튼 */}
              <button
                className="lg:hidden p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 group"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <FiX
                    size={24}
                    className="group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <FiMenu
                    size={24}
                    className="group-hover:scale-110 transition-transform"
                  />
                )}
              </button>
            </div>
          </div>

          {/* 모바일 메뉴 */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
              <div className="px-4 py-6 space-y-4">
                {/* 메뉴 아이템들 */}
                <div className="space-y-2">
                  <Link
                    to="/funding"
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiHome
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span className="menu-font font-medium">펀딩 프로젝트</span>
                  </Link>
                  <Link
                    to="/group-buy"
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiShoppingCart
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span className="menu-font font-medium">공동구매</span>
                  </Link>
                  <Link
                    to="/local-specialty"
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiHeart
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span className="menu-font font-medium">지역특산품</span>
                  </Link>
                  <Link
                    to="/community"
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiMessageSquare
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span className="menu-font font-medium">커뮤니티</span>
                  </Link>
                  <Link
                    to="/trending"
                    className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiTrendingUp
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span className="menu-font font-medium">인기펀딩</span>
                  </Link>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  {isLoggedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiUser size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm menu-font text-gray-700">
                            {userInfo?.nickname || userInfo?.email}
                          </div>
                          <div className="text-xs text-font text-gray-500">
                            활성 사용자
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/my-funding"
                        className="flex items-center space-x-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiUsers
                          size={18}
                          className="group-hover:scale-110 transition-transform"
                        />
                        <span className="menu-font font-medium">내 펀딩</span>
                      </Link>
                      <Link
                        to="/store-register"
                        className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-sm button-font text-center hover:bg-blue-700 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        가게 등록
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left flex items-center space-x-3 p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                      >
                        <FiLogOut
                          size={18}
                          className="group-hover:scale-110 transition-transform"
                        />
                        <span className="menu-font font-medium">로그아웃</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/member/login"
                        className="block w-full text-center p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors menu-font font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        로그인
                      </Link>
                      <Link
                        to="/member/register"
                        className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-sm button-font text-center hover:bg-blue-700 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        회원가입
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 지역 선택 섹션 */}
      <div className="fixed top-32 left-0 w-full bg-white z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* 현재 선택된 지역 */}
            <div className="flex items-center space-x-3">
              <FiMapPin size={20} className="text-blue-600" />
              <span className="text-sm text-font text-gray-500">
                지역 기반 서비스
              </span>
              <span className="text-lg menu-font font-semibold text-gray-800">
                {selectedRegion}
              </span>
              <span className="text-lg menu-font font-semibold text-gray-800">
                {selectedDistrict}
              </span>
            </div>

            {/* 지역 선택 드롭다운 */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="text-sm menu-font text-gray-700 bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-colors w-32"
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.name}>
                    {region.name}
                  </option>
                ))}
              </select>

              {/* 구/군 선택 (선택된 지역의 하위 행정구역) */}
              {selectedRegionData && (
                <select className="text-sm menu-font text-gray-700 bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-colors w-32">
                  <option>전체</option>
                  {selectedRegionData.districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainMenu;
