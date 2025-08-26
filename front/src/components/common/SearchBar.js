import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCamera, FiChevronDown, FiChevronUp } from "react-icons/fi";
import ImageUploadOverlay from "./ImageUploadOverlay";

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const trendingKeywords = [
    "냉면",
    "찜닭",
    "삼계탕",
    "벌꿀",
    "누룽지",
    "초밥",
    "치킨",
    "펀딩",
    "김치찜",
    "중국집",
  ];

  // 롤링 (3초마다 변경, 접혀있을 때만 동작)
  useEffect(() => {
    if (!expanded) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % trendingKeywords.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [expanded, trendingKeywords.length]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/search?query=${encodeURIComponent(search)}`);
    }
  };

  const handleKeywordClick = (keyword) => {
    navigate(`/search?query=${encodeURIComponent(keyword)}`);
  };

  const handleImageUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/search/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setTimeout(() => {
        setShowOverlay(false);
        navigate("/image-search", {
          state: {
            results: data.results,
            previewUrl: URL.createObjectURL(file),
          },
        });
        setLoading(false);
      }, 2000);
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-5xl mx-auto p-4">
        {/* 검색창 */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="원하는 상품을 검색하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-full border border-gray-300 pl-5 pr-24 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-300 hover:border-blue-400"
          />

          {/* 검색 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
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

          {/* 카메라 아이콘 */}
          <button
            type="button"
            onClick={() => setShowOverlay(true)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-300"
          >
            <FiCamera size={22} />
          </button>
        </div>
        {/* 🔥 인기 검색어 */}
        <div className="relative">
          {/* 버튼 (롤링 키워드 표시) */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 
             rounded-lg shadow-sm hover:border-blue-400 hover:shadow-md transition-all w-48"
          >
            <span
              onClick={(e) => {
                e.stopPropagation(); // 버튼 토글 막고 검색만 실행
                handleKeywordClick(trendingKeywords[currentIndex]);
              }}
              className="cursor-pointer text-sm font-semibold flex items-center gap-1"
            >
              {/* 숫자만 색 다르게 */}
              <span className="text-blue-500 font-bold">
                {currentIndex + 1}.
              </span>
              <span className="text-black hover:text-blue-600 transition">
                {trendingKeywords[currentIndex]}
              </span>
            </span>

            {expanded ? (
              <FiChevronUp size={18} className="text-gray-500" />
            ) : (
              <FiChevronDown size={18} className="text-gray-500" />
            )}
          </button>

          {/* 펼쳐진 리스트 */}
          {expanded && (
            <ul className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {/* 헤더 */}
              <li className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-50 border-b border-gray-200">
                실시간 검색어
              </li>

              {trendingKeywords.map((keyword, idx) => (
                <li
                  key={idx}
                  onClick={() => handleKeywordClick(keyword)}
                  className="cursor-pointer px-3 py-2 text-sm text-gray-700 
               hover:text-blue-600 hover:bg-blue-50 transition-colors 
               flex items-center gap-2"
                >
                  {/* 숫자만 색 다르게 */}
                  <span className="text-blue-500 font-bold">{idx + 1}.</span>
                  <span>{keyword}</span>
                </li>
              ))}
              <li className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-50 border-b border-gray-200">
                최근 2시간마다 갱신하고 있어요
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* 이미지 업로드 오버레이 */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <ImageUploadOverlay
              onUpload={handleImageUpload}
              loading={loading}
            />
            <button
              className="mt-4 w-full py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium text-gray-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowOverlay(false)}
              disabled={loading}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
