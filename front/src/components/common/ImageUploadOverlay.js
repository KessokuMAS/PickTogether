// src/components/common/ImageUploadOverlay.js
import React, { useState, useRef, useEffect } from "react";
import { FiUploadCloud, FiCamera } from "react-icons/fi";

const ImageUploadOverlay = ({ onUpload }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onUpload(file);
  };

  // 드래그 앤 드롭
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  // 붙여넣기 (CTRL+V)
  useEffect(() => {
    const handlePaste = (e) => {
      const file = e.clipboardData.files[0];
      if (file) onUpload(file);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onUpload]);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition"
      onClick={() => fileInputRef.current.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {dragOver ? (
        <div className="text-emerald-600 font-semibold flex flex-col items-center gap-2">
          <FiUploadCloud size={40} />
          <p>이곳으로 이미지를 드래그하기</p>
        </div>
      ) : (
        <div className="text-gray-500 flex flex-col items-center gap-2">
          <FiCamera size={40} className="text-emerald-500" />
          <p className="font-semibold">이미지로 검색하기</p>
          <p className="text-sm">이미지를 통해서 원하는 펀딩을 찾아보세요!</p>
          <button className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
            사진을 업로드하기
          </button>
          <p className="text-xs mt-2 text-gray-400">
            * 빠른 검색을 위해 <strong>CTRL + V</strong>를 누르고 검색 상자에
            이미지를 붙여 넣으세요
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadOverlay;
