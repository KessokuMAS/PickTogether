// src/components/common/SearchBar.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCamera } from "react-icons/fi";
import ImageUploadOverlay from "./ImageUploadOverlay"; // 🔥 오버레이 임포트

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [showOverlay, setShowOverlay] = useState(false); // 📌 오버레이 상태
  const navigate = useNavigate();

  // 텍스트 검색
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/search?query=${encodeURIComponent(search)}`);
    }
  };

  // 이미지 검색 실행
  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/search/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("이미지 검색 결과:", data);

      setShowOverlay(false); // ✅ 업로드 후 오버레이 닫기
      navigate("/image-search", {
        state: {
          results: data.results,
          previewUrl: URL.createObjectURL(file),
        },
      });
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
    }
  };

  return (
    <>
      <div className="flex items-center w-full max-w-2xl">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="원하는 상품을 검색하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-full border border-gray-300 pl-4 pr-20 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {/* 검색 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-10 top-2.5 h-5 w-5 text-gray-400"
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

          {/* 카메라 아이콘 → 오버레이 열기 */}
          <button
            type="button"
            onClick={() => setShowOverlay(true)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-emerald-500"
          >
            <FiCamera size={20} />
          </button>
        </div>
      </div>

      {/* 이미지 업로드 오버레이 */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[400px]">
            <ImageUploadOverlay onUpload={handleImageUpload} />
            <button
              className="mt-4 w-full py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
              onClick={() => setShowOverlay(false)}
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
