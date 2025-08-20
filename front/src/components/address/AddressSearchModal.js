import React, { useEffect, useRef, useState } from "react";
import { TbCurrentLocation, TbX } from "react-icons/tb";
import { FiMapPin, FiSearch } from "react-icons/fi";
import { KAKAO_MAP_CONFIG } from "../../config/constants";

const AddressSearchModal = ({ isOpen, onClose, onAddressSelect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const overlayRef = useRef(null);

  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [latLng, setLatLng] = useState({ lat: null, lng: null });
  const [searchAddress, setSearchAddress] = useState("");
  const [showMap, setShowMap] = useState(false);

  // Kakao Maps SDK 로드
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  // 지도 생성
  useEffect(() => {
    if (!isOpen || !showMap || !mapRef.current) return;
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

    updateLocation(center.getLat(), center.getLng());
  }, [isOpen, showMap]);

  // 역지오코딩 + 마커/오버레이
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
        const fullAddress = road || jibun || "주소 정보 없음";
        setAddress(fullAddress);

        // 우편번호 추출 (도로명주소에서)
        if (result[0].road_address?.zone_no) {
          setZipCode(result[0].road_address.zone_no);
        } else if (result[0].address?.postal_code) {
          setZipCode(result[0].address.postal_code);
        }
      } else {
        setAddress("주소 변환 실패");
      }
    });
  };

  // 현재 위치 이동
  const handleLocationClick = () => {
    setShowMap(true);
    if (!navigator.geolocation) {
      alert("브라우저가 현재 위치를 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        mapInstanceRef.current?.setCenter(
          new window.kakao.maps.LatLng(latitude, longitude)
        );
        updateLocation(latitude, longitude);
      },
      () => {
        alert("현재 위치를 가져올 수 없습니다.");
      }
    );
  };

  // 주소 검색 이동
  const handleSearch = () => {
    if (!searchAddress.trim()) return;
    setShowMap(true);
    const places = new window.kakao.maps.services.Places();
    places.keywordSearch(searchAddress, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length) {
        const item = result[0];
        const lat = parseFloat(item.y);
        const lng = parseFloat(item.x);
        mapInstanceRef.current?.setCenter(
          new window.kakao.maps.LatLng(lat, lng)
        );
        updateLocation(lat, lng);
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  // 주소 선택 확인
  const handleConfirm = () => {
    if (!address || !zipCode) {
      alert("주소를 검색하여 선택해주세요.");
      return;
    }

    if (!detailAddress.trim()) {
      alert("상세 주소를 입력해주세요.");
      return;
    }

    // 부모 컴포넌트에 주소 정보 전달
    onAddressSelect({
      zipCode: zipCode,
      address: address,
      detailAddress: detailAddress.trim(),
      fullAddress: `${address} ${detailAddress.trim()}`,
    });

    // 모달 닫기
    onClose();
  };

  // 모달 초기화
  const handleClose = () => {
    setAddress("");
    setDetailAddress("");
    setZipCode("");
    setSearchAddress("");
    setShowMap(false);
    setLatLng({ lat: null, lng: null });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <FiMapPin /> 배송 주소 검색
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <TbX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* 검색 바 */}
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="주소 검색 (도로명, 지번 등)"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
            >
              <FiSearch /> 검색
            </button>
          </div>

          {/* 현재 위치 버튼 */}
          <button
            onClick={handleLocationClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
          >
            <TbCurrentLocation className="text-lg" />
            <span className="font-medium">현재 위치로 찾기</span>
          </button>

          {showMap && (
            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
              💡 지도를 드래그하여 정확한 위치를 선택할 수 있습니다.
            </div>
          )}

          {/* 지도 */}
          {showMap && (
            <div
              ref={mapRef}
              className="w-full h-64 rounded-lg border border-gray-300"
            />
          )}

          {/* 주소 정보 */}
          {address && zipCode && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-700">
                  우편번호:
                </span>
                <span className="ml-2 font-mono">{zipCode}</span>
              </div>
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700">
                  기본 주소:
                </span>
                <span className="ml-2">{address}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 주소 입력 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="동/호수, 건물명 등 상세 주소를 입력하세요"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!address || !zipCode}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            주소 선택
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressSearchModal;
