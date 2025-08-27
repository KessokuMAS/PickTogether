// src/pages/business/BusinessLocationPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { TbCurrentLocation } from "react-icons/tb";
import {
  createMemberLocation,
  listMemberLocations,
  deleteMemberLocation,
} from "../../api/memberApi";
import { KAKAO_MAP_CONFIG } from "../../config/constants";

const BusinessLocationPage = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const overlayRef = useRef(null);

  const [address, setAddress] = useState("");
  const [latLng, setLatLng] = useState({ lat: null, lng: null });
  const [searchAddress, setSearchAddress] = useState("");
  const [label, setLabel] = useState("기본 주소");
  const [showMap, setShowMap] = useState(false);

  // 목록 상태
  const [locations, setLocations] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  // 1) Kakao Maps SDK 로드
  useEffect(() => {
    if (window.kakao?.maps) return;

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_CONFIG.MAP_API_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log("✅ Kakao Maps 로드 완료");
      });
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  // 2) 지도 생성 (showMap=true일 때만)
  useEffect(() => {
    if (!showMap || !mapRef.current) return;
    if (!window.kakao?.maps) return;

    const center = new window.kakao.maps.LatLng(37.5665, 126.978);
    const map = new window.kakao.maps.Map(mapRef.current, {
      center,
      level: 3,
    });

    mapInstanceRef.current = map;

    window.kakao.maps.event.addListener(map, "dragend", () => {
      const c = map.getCenter();
      updateLocation(c.getLat(), c.getLng());
    });

    updateLocation(center.getLat(), center.getLng()); // 초기
  }, [showMap]);

  // 3) 역지오코딩 + 마커/오버레이
  const updateLocation = (lat, lng) => {
    const map = mapInstanceRef.current;
    if (!map || !window.kakao?.maps) return;

    const position = new window.kakao.maps.LatLng(lat, lng);

    if (markerRef.current) markerRef.current.setMap(null);
    markerRef.current = new window.kakao.maps.Marker({ position, map });

    if (overlayRef.current) overlayRef.current.setMap(null);
    overlayRef.current = new window.kakao.maps.CustomOverlay({
      position,
      yAnchor: 2.5,
      content:
        '<div style="padding:6px 14px; font-size:13px; font-weight:600; color:#111; background:#fff; border-radius:14px; border:1.5px solid #000; box-shadow:0 1px 4px rgba(0,0,0,0.06); white-space:nowrap; text-align:center;">표시된 위치가 맞으신가요?</div>',
    });
    overlayRef.current.setMap(map);

    setLatLng({ lat, lng });

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2Address(lng, lat, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        const road = result[0].road_address?.address_name;
        const jibun = result[0].address?.address_name;
        setAddress(road || jibun || "주소 정보 없음");
      } else {
        setAddress("주소 변환 실패");
      }
    });
  };

  // 4) 현재 위치 이동
  const handleLocationClick = () => {
    setShowMap(true);
    if (!navigator.geolocation) {
      alert("브라우저가 현재 위치를 지원하지 않습니다.");
      return;
    }

    // 위치 권한 상태 확인
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "denied") {
          alert(
            "위치 정보 접근이 거부되었습니다.\n\n해결 방법:\n1. 브라우저 주소창 왼쪽의 자물쇠 아이콘 클릭\n2. '위치' 권한을 '허용'으로 변경\n3. 페이지 새로고침 후 다시 시도"
          );
          return;
        }
        getCurrentLocation();
      });
    } else {
      // permissions API를 지원하지 않는 경우 직접 시도
      getCurrentLocation();
    }
  };

  // 현재 위치 가져오기 함수
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        mapInstanceRef.current?.setCenter(
          new window.kakao.maps.LatLng(latitude, longitude)
        );
        // 현재 위치로 마커와 주소 정보 업데이트
        updateLocation(latitude, longitude);
      },
      (error) => {
        console.error("위치 정보를 가져올 수 없습니다:", error);

        let errorMessage = "현재 위치를 가져올 수 없습니다.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "위치 정보 접근이 거부되었습니다.\n\n해결 방법:\n1. 브라우저 주소창 왼쪽의 자물쇠 아이콘 클릭\n2. '위치' 권한을 '허용'으로 변경\n3. 페이지 새로고침 후 다시 시도";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "위치 정보를 사용할 수 없습니다.\n네트워크 연결을 확인해주세요.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "위치 정보 요청 시간이 초과되었습니다.\n다시 시도해주세요.";
            break;
          default:
            errorMessage =
              "알 수 없는 오류가 발생했습니다.\n다시 시도해주세요.";
        }

        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // 5) 주소 검색
  const handleSearch = () => {
    if (!searchAddress.trim()) return;
    if (!window.kakao?.maps) return;

    // 지도가 표시되지 않은 경우 먼저 지도 표시
    if (!showMap) {
      setShowMap(true);
      // 지도가 렌더링될 때까지 잠시 대기 후 검색 실행
      setTimeout(() => {
        performSearch();
      }, 100);
    } else {
      performSearch();
    }
  };

  // 실제 검색 수행 함수
  const performSearch = () => {
    const places = new window.kakao.maps.services.Places();
    places.keywordSearch(searchAddress, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length) {
        const item = result[0];
        const lat = parseFloat(item.y);
        const lng = parseFloat(item.x);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(
            new window.kakao.maps.LatLng(lat, lng)
          );
          // 검색된 위치로 마커와 주소 정보 업데이트
          updateLocation(lat, lng);
        }
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  // 6) 위치 저장 및 확인
  const handleConfirm = async () => {
    if (!latLng.lat || !latLng.lng) {
      alert("위치를 선택해주세요.");
      return;
    }

    try {
      const saved = await createMemberLocation({
        label: label.trim() || "기본 주소",
        address: address,
        lat: latLng.lat,
        lng: latLng.lng,
      });

      // 가게요청 폼으로 메시지 전송 (메인 페이지와 분리)
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "BUSINESS_ADDRESS_SELECTED", // 메인과 다른 메시지 타입 사용
            locationId: saved.id,
            address: saved.address || saved.roadAddress,
            lat: saved.lat,
            lng: saved.lng,
          },
          "*"
        );

        // 메시지 전송 후 팝업 창 닫기
        window.close();
      }

      // 목록 리프레시
      await fetchLocations();
    } catch (e) {
      console.error(e);
      alert("주소 저장에 실패했습니다.");
    }
  };

  // 7) 저장된 위치 목록 불러오기
  const fetchLocations = async () => {
    try {
      setListError("");
      setListLoading(true);
      const list = await listMemberLocations();
      setLocations(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setListError("주소지 목록을 불러오지 못했습니다.");
    } finally {
      setListLoading(false);
    }
  };

  // 초기에 목록 로드
  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-4 text-xl font-bold">가게 위치 설정</h1>

        {/* 라벨 */}
        <div className="mb-3">
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            라벨(선택)
          </label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="예: 집, 회사, 학교"
          />
        </div>

        {/* 검색 바 */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            className="flex-1 rounded border px-3 py-2"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="주소 검색 (도로명, 지번 등)"
          />
          <button
            onClick={handleSearch}
            className="rounded bg-black px-4 py-2 text-white hover:bg-gray-700"
          >
            검색
          </button>
        </div>

        {/* 현재 위치 버튼 */}
        <button
          onClick={handleLocationClick}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-white shadow-md transition-colors duration-200 hover:bg-gray-700"
        >
          <TbCurrentLocation className="text-lg" />
          <span className="font-medium">현재 위치로 찾기</span>
        </button>

        {showMap && (
          <span className="mt-2 block text-sm text-red-600">
            지도 표시와 현재 주소가 맞는지 확인해주세요
          </span>
        )}

        {showMap && (
          <div
            ref={mapRef}
            className="mb-4 h-64 w-full rounded border border-gray-300"
          />
        )}

        {address && latLng.lat && latLng.lng && (
          <div className="mb-4 rounded bg-gray-100 p-2">
            <b>주소:</b> {address}
            <br />
            <b>좌표:</b> 위도: {latLng.lat.toFixed(6)}, 경도:{" "}
            {latLng.lng.toFixed(6)}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => window.close()}
            className="rounded border px-4 py-2 text-gray-700 hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="rounded bg-black px-4 py-2 text-white hover:bg-gray-700"
          >
            주소 등록
          </button>
        </div>
      </div>

      {/* 저장된 주소 목록 */}
      <div className="mx-auto mt-8 max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">저장된 주소지</h2>
          <button
            onClick={fetchLocations}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            새로고침
          </button>
        </div>

        {listLoading ? (
          <p className="text-slate-500">불러오는 중...</p>
        ) : listError ? (
          <p className="text-red-500">{listError}</p>
        ) : locations.length === 0 ? (
          <p className="text-slate-500">저장된 주소지가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {locations.map((loc) => (
              <li
                key={loc.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900">
                    {loc.name || "주소"}
                  </div>
                  <div className="truncate text-xs text-slate-600">
                    {loc.roadAddress || loc.address}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    ({loc.lat?.toFixed?.(6)}, {loc.lng?.toFixed?.(6)})
                  </div>
                </div>
                <div className="ml-3 shrink-0">
                  <button
                    onClick={() => {
                      // 가게요청 폼으로 메시지 전송
                      if (window.opener) {
                        window.opener.postMessage(
                          {
                            type: "BUSINESS_ADDRESS_SELECTED",
                            locationId: loc.id,
                            address: loc.address || loc.roadAddress,
                            lat: loc.lat,
                            lng: loc.lng,
                          },
                          "*"
                        );
                      }
                      alert("주소지를 선택했습니다.");
                      window.close();
                    }}
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                  >
                    이 주소 사용
                  </button>
                  {/* 삭제 버튼 */}
                  <button
                    onClick={async () => {
                      if (!window.confirm("정말 이 주소를 삭제하시겠습니까?"))
                        return;
                      try {
                        await deleteMemberLocation(loc.id);
                        setLocations((prev) =>
                          prev.filter((item) => item.id !== loc.id)
                        );
                        alert("주소가 삭제되었습니다.");
                      } catch (err) {
                        console.error(err);
                        alert("주소 삭제에 실패했습니다.");
                      }
                    }}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BusinessLocationPage;
