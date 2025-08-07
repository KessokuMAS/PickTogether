import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { FiSearch } from "react-icons/fi";
import NearbyKakaoRestaurants from "../../components/list/NearbyKakaoResturants";

const MainPage = () => {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [coordinates, setCoordinates] = useState("");

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "ADDRESS_SELECTED") {
        setSelectedAddress(event.data.address);
        setCoordinates(event.data.coordinates);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleOpenLocationPopup = () => {
    window.open(
      "/location", // 라우터 경로에 맞게 수정
      "위치 설정",
      "width=800,height=700"
    );
  };

  return (
    <MainLayout>
      {/* 📍 위치 설정 버튼 */}
      <div className="flex justify-center items-center px-4 mt-6">
        <button
          onClick={handleOpenLocationPopup}
          className="px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500 transition"
        >
          위치 설정
        </button>
        {selectedAddress && (
          <span className="ml-4 text-sm text-gray-700">
            선택된 위치: {selectedAddress}
          </span>
        )}
      </div>

      {/* 🔍 검색창 */}
      <div className="flex flex-col justify-center items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="원하는 상품을 검색하세요"
            className="w-[1200px] pl-12 pr-12 py-3 rounded-2xl border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400 cursor-pointer transition-colors">
            <FiSearch size={20} />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center">
        <img src="/products3.PNG" />
        <img src="/products.PNG" />
        <img src="/products2.PNG" />
      </div>
      <NearbyKakaoRestaurants />
    </MainLayout>
  );
};

export default MainPage;
