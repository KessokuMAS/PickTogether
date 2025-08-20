import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { FiSearch } from "react-icons/fi";
import NearbyKakaoRestaurants from "../../components/list/NearbyKakaoResturants";
import MainBanner from "../../layouts/MainBanner"; // MainBanner 임포트
import ChatBot from "../../components/chatbot/ChatBot";

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
      {/* 배너 */}
      <MainBanner />

      <NearbyKakaoRestaurants />
      <ChatBot />
    </MainLayout>
  );
};

export default MainPage;
