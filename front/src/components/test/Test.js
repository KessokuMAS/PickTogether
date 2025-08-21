import React, { useEffect } from "react";

const OnePersonHouseholdMap = () => {
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
            image: "1_menu.jpg",
          },
          {
            name: "한그릇 김치찌개",
            lat: 37.5,
            lng: 127.035,
            image: "2_menu.jpg",
          },
          {
            name: "한그릇 제육볶음",
            lat: 37.49,
            lng: 127.032,
            image: "3_menu.jpg",
          },
          {
            name: "한그릇 비빔밥",
            lat: 37.5,
            lng: 127.043,
            image: "4_menu.jpg",
          },
          {
            name: "한그릇 치킨카레",
            lat: 37.49,
            lng: 127.032,
            image: "5_menu.jpg",
          },
        ];

        // ✅ 음식점 마커 + 오버레이
        const restaurantOverlays = [];
        restaurants.forEach((r) => {
          const position = new window.kakao.maps.LatLng(r.lat, r.lng);

          // 마커
          new window.kakao.maps.Marker({ map, position });

          // Overlay DOM 생성
          const overlayEl = document.createElement("div");
          overlayEl.style.cssText = `
            display:flex;align-items:center;
            background:white;border:1px solid #333;
            border-radius:8px;padding:5px;
            box-shadow:2px 2px 5px rgba(0,0,0,0.3);
            width:150px;
            transform-origin:center center;
          `;
          overlayEl.innerHTML = `
            <img src="${r.image}" style="width:40px;height:40px;border-radius:6px;margin-right:6px;" />
            <div style="font-size:12px;font-weight:bold;">${r.name}</div>
          `;

          const overlay = new window.kakao.maps.CustomOverlay({
            position,
            content: overlayEl,
            yAnchor: 1,
          });
          overlay.setMap(map);
          restaurantOverlays.push(overlayEl);
        });

        // ✅ 줌 레벨에 따라 Overlay 크기 변경
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

                // 폴리곤
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

  return <div id="map" style={{ width: "100%", height: "700px" }} />;
};

export default OnePersonHouseholdMap;
