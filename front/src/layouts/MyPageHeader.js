import React from "react";
import { Link } from "react-router-dom";
import { FiSettings, FiFileText, FiLogOut } from "react-icons/fi";

const MyPageHeader = ({ isAdmin, isBusinessOwner, onLogout }) => {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-lg shadow-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* 로고 */}
          <Link to="/main" className="inline-block">
            <img
              alt="PickTogether"
              className="h-[95px] w-auto"
              src="/logo2.png"
            />
          </Link>

          {/* 오른쪽 버튼들 */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <a
                href="/mypage/admin/settings"
                className="flex items-center space-x-2 text-black hover:text-gray-500 transition-colors duration-200 py-2 px-3 rounded-full hover:bg-yellow-50 relative group"
              >
                <FiSettings size={20} className="text-yellow-600" />
                <span className="font-semibold text-1xl">관리자 설정</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-600 group-hover:w-full transition-all duration-300"></div>
              </a>
            )}

            {isBusinessOwner && (
              <a
                href="/mypage/business/requests"
                className="flex items-center space-x-2 text-black hover:text-gray-500 transition-colors duration-200 py-2 px-3 rounded-full hover:bg-green-50 relative group"
              >
                <FiFileText size={20} className="text-green-600" />
                <span className="font-semibold text-1xl">가게 요청</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></div>
              </a>
            )}

            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-black hover:text-gray-500 transition-colors duration-200 py-2 px-3 rounded-full hover:bg-red-50 relative group"
            >
              <FiLogOut size={20} className="text-red-600" />
              <span className="font-semibold text-1xl">로그아웃</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPageHeader;
