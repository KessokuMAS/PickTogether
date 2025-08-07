// ✅ Kakao 지도 SDK가 로드되었다는 가정 하에 사용
// 이 컴포넌트는 selectedLocation이 localStorage에 저장된 뒤 mount되어야 함

import React, { useEffect, useState } from "react";
import { TbCurrentLocation } from "react-icons/tb";

const NearbyKakaoRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("selectedLocation");
    if (!saved) {
      console.warn("📦 위치 정보 없음");
      setError("위치 정보가 없습니다.");
      setLoading(false);
      return;
    }

    const data = JSON.parse(saved);
    const lat = parseFloat(data.lat);
    const lng = parseFloat(data.lng);

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.error("❌ 좌표 형식이 잘못됨");
      setError("좌표 형식이 잘못되었습니다.");
      setLoading(false);
      return;
    }

    const waitForKakao = () => {
      if (window.kakao?.maps?.services && window.kakao?.maps?.LatLng) {
        const ps = new window.kakao.maps.services.Places();
        const loc = new window.kakao.maps.LatLng(lat, lng);
        let allResults = [];
        let page = 1;

        const searchMore = () => {
          ps.categorySearch(
            "FD6",
            (data, status, pagination) => {
              console.log("🔍 검색 상태:", status);
              if (status === window.kakao.maps.services.Status.OK) {
                allResults = allResults.concat(data);
                console.log(allResults);

                if (pagination.hasNextPage && page < 3) {
                  page++;
                  pagination.nextPage();
                } else {
                  setRestaurants(allResults);
                  setLoading(false);
                }
              } else {
                setRestaurants([]);
                setLoading(false);
              }
            },
            {
              location: loc,
              radius: 2000,
              sort: "distance",
              page: page,
            }
          );
        };

        searchMore();
      } else {
        console.log("⌛ Kakao Maps SDK 로딩 대기 중...");
        setTimeout(waitForKakao, 300);
      }
    };

    waitForKakao();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">🍱 주변 음식점</h2>

      {loading ? (
        <p className="text-gray-400">음식점을 불러오는 중입니다...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : restaurants.length === 0 ? (
        <p className="text-gray-500">근처 음식점을 찾지 못했습니다.</p>
      ) : (
        <ul className="space-y-3">
          {restaurants.map((store) => (
            <li
              key={store.id}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="font-semibold text-lg text-pink-700">
                {store.place_name}
              </div>
              {store.phone && (
                <div className="text-sm text-gray-500">📞 {store.phone}</div>
              )}
              {store.category_name && (
                <div className="text-sm text-gray-400">
                  🏷️ {store.category_name}
                </div>
              )}
              <div className="text-sm text-gray-600">{store.address_name}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <TbCurrentLocation className="text-base" /> 거리:{" "}
                {parseInt(store.distance).toLocaleString()}m
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NearbyKakaoRestaurants;
