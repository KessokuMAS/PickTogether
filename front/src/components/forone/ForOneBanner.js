// src/components/forone/ForOneBanner.jsx
import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

export default function ForOneBanner({
  filteredMenus, // 데이터를 안 넘기면 undefined
  renderArrowPrev,
  renderArrowNext,
}) {
  // ✅ props 방어 처리
  const menus = Array.isArray(filteredMenus) ? filteredMenus : [];

  // ✅ 데이터가 없으면 Intro 모드
  if (menus.length === 0) {
    return (
      <div className="mb-10 text-center bg-gradient-to-b from-teal-100 to-white p-10 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold text-teal-700 mb-4 tracking-tight">
          한그릇 펀딩으로 맛있는 한 끼를!
        </h1>
        <p className="text-gray-600 max-w-[600px] mx-auto text-lg font-medium">
          서초동 근처에서 할인된 가격으로 맛있는 메뉴를 즐겨보세요!
        </p>
        <div className="w-full max-w-[640px] mx-auto mt-6 rounded-2xl shadow-xl overflow-hidden">
          <img
            src="/5_menu.jpg"
            alt="한그릇 펀딩 소개"
            className="w-full h-[300px] object-cover brightness-90"
          />
        </div>
      </div>
    );
  }

  // ✅ 데이터가 있으면 List 모드
  return (
    <div className="mb-10 text-center bg-gradient-to-b from-teal-100 to-white p-10 rounded-2xl shadow-lg">
      <h1 className="text-4xl font-bold text-teal-700 mb-4 tracking-tight">
        한그릇 펀딩으로 맛있는 한 끼를!
      </h1>
      <p className="text-gray-600 max-w-[600px] mx-auto text-lg font-medium">
        서초동 근처에서 할인된 가격으로 맛있는 메뉴를 즐겨보세요!
      </p>

      <div className="w-full max-w-[640px] mx-auto mt-6 rounded-2xl shadow-xl overflow-hidden">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          showIndicators={false}
          interval={3000}
          transitionTime={600}
          renderArrowPrev={renderArrowPrev}
          renderArrowNext={renderArrowNext}
        >
          {menus.map((menu) => (
            <div key={menu.slotId} className="relative">
              <img
                src={menu.imageUrl || "/1.png"}
                alt={`${menu.menuName} 배너`}
                className="w-full h-[300px] object-cover brightness-90 transition-all duration-300"
              />
              {menu.discountPercent >= 30 && (
                <span className="absolute top-4 right-4 bg-yellow-400 text-gray-900 text-sm font-bold px-3 py-1.5 rounded-full z-10 shadow-md">
                  🔥 Hot Deal
                </span>
              )}
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
