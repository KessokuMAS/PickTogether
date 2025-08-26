import React, { useEffect, useState } from "react";

// 간단한 모달 (원하면 react-modal, headlessui 등 교체 가능)
function Modal({ restaurant, onClose }) {
  if (!restaurant) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <h2 className="text-xl font-bold mb-2">{restaurant.name}</h2>
        <p className="text-gray-600">이곳에서 펀딩이 가능합니다!</p>
      </div>
    </div>
  );
}

const OnePersonHouseholdMap = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=0c50b8431459022d257f7e8c2909f2ed&autoload=false";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById("map");
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 9,
        };

        const map = new window.kakao.maps.Map(container, options);

        // ✅ 자치구별 데이터
        const data = {
          종로구: 29779,
          중구: 28968,
          용산구: 40445,
          성동구: 48442,
          광진구: 72933,
          동대문구: 72355,
          중랑구: 69149,
          성북구: 70230,
          강북구: 53705,
          도봉구: 43347,
          노원구: 67182,
          은평구: 70568,
          서대문구: 56770,
          마포구: 73327,
          양천구: 47886,
          강서구: 106748,
          구로구: 62632,
          금천구: 53858,
          영등포구: 79698,
          동작구: 75148,
          관악구: 153605,
          서초구: 49443,
          강남구: 79274,
          송파구: 89720,
          강동구: 65601,
        };

        // ✅ 색상 구간
        function getColor(name, value) {
          if (name === "관악구" || name === "서초구") return "#ff0000";
          if (value > 120000) return "#800026";
          if (value > 90000) return "#BD0026";
          if (value > 70000) return "#E31A1C";
          if (value > 50000) return "#FC4E2A";
          if (value > 30000) return "#FD8D3C";
          return "#FEB24C";
        }

        // ✅ 음식점 데이터
        const restaurants = [
          {
            name: "한그릇 불고기 덮밥",
            lat: 37.51,
            lng: 127.042,
            image: "/korean.png",
          },
          {
            name: "한그릇 김치찌개",
            lat: 37.5,
            lng: 127.035,
            image: "/china.png",
          },
          {
            name: "한그릇 제육볶음",
            lat: 37.49,
            lng: 127.032,
            image: "/fastfood.png",
          },
          {
            name: "한그릇 비빔밥",
            lat: 37.5,
            lng: 127.043,
            image: "/susii.png",
          },
          {
            name: "한그릇 치킨카레",
            lat: 37.49,
            lng: 127.032,
            image: "/japan.png",
          },
          {
            name: "한그릇 치킨카레",
            lat: 37.476,
            lng: 126.952,
            image: "/korean.png",
          },
          {
            name: "한그릇 김치찌개",
            lat: 37.478,
            lng: 126.946,
            image: "/fastfood.png",
          },
          {
            name: "한그릇 제육볶음",
            lat: 37.474,
            lng: 126.944,
            image: "/japan.png",
          },
          {
            name: "한그릇 비빔밥",
            lat: 37.472,
            lng: 126.939,
            image: "/china.png",
          },
          {
            name: "한그릇 치킨카레",
            lat: 37.471,
            lng: 126.955,
            image: "/susii.png",
          },
          {
            name: "한그릇 김치찌개",
            lat: 37.469,
            lng: 126.948,
            image: "/korean.png",
          },
          {
            name: "한그릇 제육볶음",
            lat: 37.467,
            lng: 126.942,
            image: "/china.png",
          },
          {
            name: "한그릇 비빔밥",
            lat: 37.465,
            lng: 126.936,
            image: "/fastfood.png",
          },
          {
            name: "한그릇 치킨카레",
            lat: 37.463,
            lng: 126.954,
            image: "/susii.png",
          },
          {
            name: "한그릇 김치찌개",
            lat: 37.462,
            lng: 126.947,
            image: "/japan.png",
          },
          {
            name: "한그릇 제육볶음",
            lat: 37.468,
            lng: 126.951,
            image: "/china.png",
          },
          {
            name: "한그릇 비빔밥",
            lat: 37.466,
            lng: 126.939,
            image: "/fastfood.png",
          },
          {
            name: "한그릇 순두부찌개",
            lat: 37.467,
            lng: 126.935,
            image: "/susii.png",
          },
          {
            name: "한그릇 된장찌개",
            lat: 37.465,
            lng: 126.941,
            image: "/korean.png",
          },
          {
            name: "한그릇 불백정식",
            lat: 37.463,
            lng: 126.944,
            image: "/japan.png",
          },
          {
            name: "한그릇 카레덮밥",
            lat: 37.462,
            lng: 126.938,
            image: "/china.png",
          },
          {
            name: "한그릇 고등어구이",
            lat: 37.461,
            lng: 126.947,
            image: "/susii.png",
          },
          {
            name: "한그릇 돈까스",
            lat: 37.459,
            lng: 126.943,
            image: "/fastfood.png",
          },
          {
            name: "한그릇 냉면",
            lat: 37.457,
            lng: 126.936,
            image: "/korean.png",
          },
          {
            name: "한그릇 삼겹살정식",
            lat: 37.456,
            lng: 126.949,
            image: "/china.png",
          },
          {
            name: "한그릇 제육덮밥",
            lat: 37.454,
            lng: 126.941,
            image: "/fastfood.png",
          },
          {
            name: "한그릇 치즈라면",
            lat: 37.452,
            lng: 126.934,
            image: "/susii.png",
          },
        ];

        // ✅ 음식점 오버레이 (동그란 아이콘 + 클릭 이벤트)
        const restaurantOverlays = [];
        restaurants.forEach((r) => {
          const position = new window.kakao.maps.LatLng(r.lat, r.lng);

          const overlayEl = document.createElement("div");
          overlayEl.style.cssText = `
            display:flex;align-items:center;justify-content:center;
            width:30px;height:30px;
            border-radius:50%;
            overflow:hidden;
            cursor:pointer;
            box-shadow:2px 2px 5px rgba(0,0,0,0.3);
            background:white;
          `;
          overlayEl.innerHTML = `
            <img src="${r.image}" style="width:100%;height:100%;object-fit:cover;" />
          `;

          overlayEl.onclick = () => {
            setSelectedRestaurant(r); // ✅ React 모달 띄우기
          };

          new window.kakao.maps.CustomOverlay({
            position,
            content: overlayEl,
            yAnchor: 1,
          }).setMap(map);

          restaurantOverlays.push(overlayEl);
        });

        // ✅ 줌 레벨에 따라 음식점 아이콘 크기 변경
        window.kakao.maps.event.addListener(map, "zoom_changed", () => {
          const level = map.getLevel();
          let scale = 1;
          if (level <= 5) scale = 1.6;
          else if (level <= 8) scale = 1.2;
          else if (level <= 10) scale = 1.0;
          else scale = 0.8;

          restaurantOverlays.forEach((el) => {
            el.style.transform = `scale(${scale})`;
          });
        });

        // ✅ GeoJSON (구 경계 + 인구 표시)
        fetch(
          "https://raw.githubusercontent.com/southkorea/seoul-maps/master/kostat/2013/json/seoul_municipalities_geo_simple.json"
        )
          .then((res) => res.json())
          .then((geojson) => {
            geojson.features.forEach((feature) => {
              const name = feature.properties.name;
              const value = data[name] || 0;
              const color = getColor(name, value);

              let polygons = [];
              if (feature.geometry.type === "Polygon") {
                polygons.push(feature.geometry.coordinates);
              } else if (feature.geometry.type === "MultiPolygon") {
                polygons = feature.geometry.coordinates;
              }

              polygons.forEach((coordsArray) => {
                const path = coordsArray[0].map(
                  ([lng, lat]) => new window.kakao.maps.LatLng(lat, lng)
                );

                new window.kakao.maps.Polygon({
                  map,
                  path,
                  strokeWeight: 2,
                  strokeColor: "#333",
                  fillColor: color,
                  fillOpacity: 0.6,
                });

                // 중심좌표 계산
                let sumLat = 0,
                  sumLng = 0;
                path.forEach((p) => {
                  sumLat += p.getLat();
                  sumLng += p.getLng();
                });
                const centerLatLng = new window.kakao.maps.LatLng(
                  sumLat / path.length,
                  sumLng / path.length
                );

                // CustomOverlay로 인구수 표시
                const label = document.createElement("div");
                label.style.cssText = `
                  background:rgba(255,255,255,0.9);
                  border:1px solid #333;
                  border-radius:8px;
                  padding:3px 6px;
                  font-size:11px;
                  white-space:nowrap;
                  transform-origin:center center;
                `;
                label.innerHTML = `${name}<br/><b>${value.toLocaleString()}</b>`;

                const overlay = new window.kakao.maps.CustomOverlay({
                  position: centerLatLng,
                  content: label,
                  yAnchor: 1,
                });
                overlay.setMap(map);

                // 확대/축소 대응
                window.kakao.maps.event.addListener(map, "zoom_changed", () => {
                  const level = map.getLevel();
                  let scale = 1;
                  if (level <= 5) scale = 1.6;
                  else if (level <= 8) scale = 1.2;
                  else if (level <= 10) scale = 1.0;
                  else scale = 0.8;
                  label.style.transform = `scale(${scale})`;
                });
              });
            });
          });
      });
    };
  }, []);

  return (
    <>
      <div id="map" style={{ width: "100%", height: "700px" }} />
      {/* ✅ 클릭 시 열리는 React 모달 */}
      <Modal
        restaurant={selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
      />
    </>
  );
};

export default OnePersonHouseholdMap;
