import React from "react";
import { FiX } from "react-icons/fi";

const ImageModal = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative max-w-4xl max-h-full p-4">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all duration-200"
        >
          <FiX size={24} />
        </button>

        {/* 이미지 */}
        <img
          src={imageUrl}
          alt="원본 이미지"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />

        {/* 이미지 정보 */}
        <div className="mt-2 text-center text-white text-sm">
          <p>클릭하여 원본 크기로 확인</p>
        </div>
      </div>

      {/* 배경 클릭 시 닫기 */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default ImageModal;
