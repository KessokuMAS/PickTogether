import React, { useState, useEffect } from "react";
import { FiMapPin, FiShoppingBag, FiArrowLeft } from "react-icons/fi";
import { createBusinessRequest } from "../../api/businessRequestApi";
import { getCookie } from "../../utils/cookieUtil";

export default function BusinessRequestPage() {
  // getImageUrl 함수 추가
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    // 백엔드에서 반환된 상대 경로를 절대 URL로 변환
    return `http://localhost:8080/${imageUrl}`;
  };

  const [formData, setFormData] = useState({
    name: "",
    categoryName: "",
    phone: "",
    roadAddressName: "",
    x: null,
    y: null,
    placeUrl: "",
    fundingGoalAmount: "",
    fundingStartDate: "",
    fundingEndDate: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setFormData((prev) => ({
      ...prev,
      name: location.place_name || "",
      roadAddressName: location.road_address_name || "",
      x: location.x || null,
      y: location.y || null,
      placeUrl: location.place_url || "",
      categoryName: location.category_name || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 커스텀 카테고리가 선택된 경우 categoryName에 설정
    if (showCustomCategory && customCategory.trim()) {
      formData.categoryName = customCategory.trim();
    }

    // 이미지 검증
    if (!selectedImage) {
      alert("가게 이미지를 선택해주세요.");
      return;
    }

    try {
      // 회원 정보 가져오기
      const memberCookie = getCookie("member");
      if (!memberCookie) {
        alert("로그인이 필요합니다.");
        return;
      }

      if (!memberCookie?.member?.email) {
        alert("로그인 정보에 이메일이 없습니다. 다시 로그인해주세요.");
        return;
      }
      const memberEmail = memberCookie.member.email;

      console.log("가게 요청 데이터:", formData);
      console.log("선택된 이미지:", selectedImage);

      // API 호출
      const result = await createBusinessRequest(
        formData,
        selectedImage,
        memberEmail
      );

      console.log("요청 결과:", result);
      alert(
        "가게 요청이 성공적으로 제출되었습니다. 관리자 검토 후 승인됩니다."
      );

      // 폼 초기화
      setFormData({
        name: "",
        categoryName: "",
        phone: "",
        roadAddressName: "",
        x: null,
        y: null,
        placeUrl: "",
        fundingGoalAmount: "",
        fundingStartDate: "",
        fundingEndDate: "",
      });
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedLocation(null);
      setCustomCategory("");
      setShowCustomCategory(false);
    } catch (error) {
      console.error("가게 요청 제출 오류:", error);
      alert("가게 요청 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const openLocationSelector = () => {
    // 메인레이아웃의 위치 설정 방식 사용
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      "/location",
      "locationSelector",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    // 팝업에서 주소 선택 시 메시지 수신
    const handleMessage = (e) => {
      if (e.data && e.data.type === "ADDRESS_SELECTED") {
        const locationData = {
          place_name: formData.name || "선택된 위치",
          road_address_name: e.data.address || "",
          x: e.data.lng || null,
          y: e.data.lat || null,
          place_url: `https://map.kakao.com/link/map/${e.data.lat},${e.data.lng}`,
          category_name: "음식점",
        };

        handleLocationSelect(locationData);
        popup.close();
        window.removeEventListener("message", handleMessage);
      }
    };

    window.addEventListener("message", handleMessage);
  };

  // 이미지 선택 처리
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 검증 (5MB 이하)
      if (file.size > 5 * 1024 * 1024) {
        alert("이미지 파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 파일 타입 검증
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setSelectedImage(file);

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 제거
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 헤더 */}
        <section className="rounded-2xl bg-gradient-to-br from-green-500 via-green-400 to-green-300 p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/40 bg-white/20">
              <FiShoppingBag className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold leading-tight">
                가게 요청 등록
              </h1>
              <p className="mt-2 text-lg opacity-90">
                새로운 레스토랑 등록을 요청합니다
              </p>
            </div>
          </div>
        </section>

        {/* 폼 */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 가게명 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                가게명 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="가게명을 입력하세요"
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                카테고리
              </label>
              <select
                name="categoryName"
                value={formData.categoryName}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, categoryName: value }));
                  setShowCustomCategory(value === "기타");
                  if (value !== "기타") {
                    setCustomCategory("");
                  }
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">카테고리 선택</option>
                <option value="음식점 > 한식">한식</option>
                <option value="음식점 > 중식">중식</option>
                <option value="음식점 > 일식">일식</option>
                <option value="음식점 > 양식">양식</option>
                <option value="음식점 > 카페">카페</option>
                <option value="음식점 > 디저트">디저트</option>
                <option value="기타">기타</option>
              </select>

              {/* 커스텀 카테고리 입력 필드 */}
              {showCustomCategory && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="커스텀 카테고리를 입력하세요"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="전화번호를 입력하세요 (예: 02-1234-5678)"
              />
            </div>

            {/* 가게 이미지 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                가게 이미지 *
              </label>
              <div className="space-y-3">
                {/* 이미지 업로드 버튼 */}
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    이미지 선택하기
                  </label>
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="px-3 py-2 text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      제거
                    </button>
                  )}
                </div>

                {/* 이미지 미리보기 */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="가게 이미지 미리보기"
                      className="w-full h-48 object-cover rounded-xl border border-slate-200"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {selectedImage?.name}
                    </div>
                  </div>
                )}

                {/* 이미지 가이드라인 */}
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                  <div className="font-medium mb-1">이미지 가이드라인:</div>
                  <div>• 메인 썸네일로 사용될 이미지입니다</div>
                  <div>
                    • 가게의 분위기나 대표 메뉴를 보여주는 이미지를 선택해주세요
                  </div>
                  <div>• 파일 크기: 5MB 이하, 권장 형식: JPG, PNG</div>
                  <div>• 권장 비율: 16:9 또는 4:3</div>
                </div>
              </div>
            </div>

            {/* 위치 선택 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                위치 *
              </label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={openLocationSelector}
                  className="w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:border-green-500 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                >
                  <FiMapPin className="h-5 w-5" />
                  {selectedLocation
                    ? "위치 변경하기"
                    : "위치 설정에서 위치 선택하기"}
                </button>

                {selectedLocation && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-sm font-semibold text-green-800 mb-2">
                      선택된 위치
                    </div>
                    <div className="text-sm text-green-700">
                      <div>주소: {selectedLocation.road_address_name}</div>
                      <div>
                        좌표: {selectedLocation.y}, {selectedLocation.x}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 펀딩 목표 금액 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                펀딩 목표 금액 *
              </label>
              <input
                type="number"
                name="fundingGoalAmount"
                value={formData.fundingGoalAmount}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="목표 금액을 입력하세요 (원)"
              />
            </div>

            {/* 펀딩 기간 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  펀딩 시작일
                </label>
                <input
                  type="date"
                  name="fundingStartDate"
                  value={formData.fundingStartDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  펀딩 종료일
                </label>
                <input
                  type="date"
                  name="fundingEndDate"
                  value={formData.fundingEndDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-green-700 transition-colors text-lg"
              >
                가게 요청하기
              </button>
            </div>
          </form>
        </section>

        {/* 뒤로가기 버튼 */}
        <section className="mt-8 text-center">
          <a
            href="/mypage"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-600 px-6 py-3 font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            <FiArrowLeft className="h-4 w-4" />
            마이페이지로 돌아가기
          </a>
        </section>
      </div>
    </div>
  );
}
