import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { FiSearch } from "react-icons/fi";
import NearbyKakaoRestaurants from "../../components/list/NearbyKakaoResturants";
import MainBanner from "../../layouts/MainBanner"; // MainBanner 임포트

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

  return (
    <MainLayout>
      {/* 🔍 검색창 - 메인배너 위로 이동 */}
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

      {/* 배너 */}
      <MainBanner />

      <NearbyKakaoRestaurants />
    </MainLayout>
  );
};

export default MainPage;
