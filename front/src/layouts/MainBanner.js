// src/components/layout/MainBanner.js
import React from "react";
import { motion } from "framer-motion"; // 애니메이션 라이브러리 (npm install framer-motion)
import Slider from "react-slick"; // 슬라이더 라이브러리 (npm install react-slick slick-carousel)
import "slick-carousel/slick/slick.css"; // 슬라이더 스타일 임포트
import "slick-carousel/slick/slick-theme.css";

const MainBanner = () => {
  // 비디오/GIF 배열 (/public/videos/에 저장하거나 CDN URL)
  const media = [
    { type: "video", src: "/videos/food-serving.mp4" }, // 음식 서빙
    { type: "video", src: "/videos/local-market.mp4" }, // 지역 시장 음식
    { type: "video", src: "/videos/restaurant-vibe.mp4" }, // 식당 분위기
    { type: "video", src: "/videos/food-prep.mp4" }, // 음식 준비 (GIF 폴백)
  ];

  // 슬라이더 설정: 자동 슬라이드(3초 간격), 무한 루프
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000, // 3초 간격
    arrows: false,
  };

  // 슬라이드 애니메이션 설정
  const slideVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  };

  return (
    <div className="relative w-[70%] h-[350px] mx-auto overflow-hidden">
      <Slider {...sliderSettings}>
        {media.map((item, index) => (
          <motion.div
            key={index}
            className="relative h-[350px]"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {item.type === "video" ? (
              <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={item.src} type="video/mp4" />
                {/* 대체 GIF 폴백 */}
                <img
                  src="/videos/fallback-food.gif"
                  alt="Fallback"
                  className="w-full h-full object-cover"
                />
              </video>
            ) : (
              <img
                src={item.src}
                alt="Banner"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-white text-center">
              <motion.h1
                className="text-4xl font-bold mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: { delay: 0.2, duration: 0.5 },
                }}
              >
                1인 식사권 펀딩으로 WIN-WIN!
              </motion.h1>
              <motion.p
                className="text-lg mb-5 px-4 max-w-[600px]"
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: { delay: 0.3, duration: 0.5 },
                }}
              >
                1인 가구를 위한 식사권 펀딩! 지역 식당과 함께 상생하는
                PickTogether
              </motion.p>
              <motion.button
                className="px-6 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: { delay: 0.4, duration: 0.5 },
                }}
              >
                펀딩 시작하기
              </motion.button>
            </div>
          </motion.div>
        ))}
      </Slider>
    </div>
  );
};

export default MainBanner;
