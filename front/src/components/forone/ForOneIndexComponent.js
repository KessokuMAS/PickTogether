import React, { useState, useEffect } from "react";
import { IoRestaurantOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { FaFire } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const mapImageVariants = {
  initial: { scale: 1, opacity: 0 },
  zoom: {
    scale: [1, 1.2, 1.5],
    opacity: 1,
    transition: { duration: 3, ease: "easeInOut" },
  },
  exit: {
    scale: 1.8,
    opacity: 0,
    transition: { duration: 1, ease: "easeInOut" },
  },
};

const noZoomVariants = {
  initial: { scale: 1, opacity: 0 },
  zoom: {
    opacity: 1,
    transition: { duration: 1, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 1, ease: "easeInOut" },
  },
};

const foodOverlayVariants = {
  initial: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { delay: 1.5, duration: 1 } },
};

const ForOneUserIntro = () => {
  const images = ["1bowl.png", "2bowl.png", "3bowl.png", "4bowl.png"];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [images.length]);

  const getImageVariants = (index) => {
    if (index === 2 || index === 3) return noZoomVariants;
    return mapImageVariants;
  };

  const getOverlayContent = (index) => {
    if (index === 0) {
      return (
        <motion.div
          className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-2 rounded shadow-md flex items-center gap-2"
          variants={foodOverlayVariants}
          initial="initial"
          animate="visible"
        >
          <IoRestaurantOutline className="text-emerald-600 text-xl" />
          <div>
            <h3 className="text-md font-semibold text-emerald-600">
              서울 전역 탐색
            </h3>
            <p className="text-xs text-gray-600">펀딩 가능 지역 확인</p>
          </div>
        </motion.div>
      );
    }
    if (index === 1) {
      return (
        <motion.div
          className="absolute top-4 left-4 bg-white bg-opacity-90 p-2 rounded shadow-md flex items-center gap-2"
          variants={foodOverlayVariants}
          initial="initial"
          animate="visible"
        >
          <TbCurrentLocation className="text-emerald-600 text-xl" />
          <div>
            <h3 className="text-md font-semibold text-emerald-600">
              서초구 확대
            </h3>
            <p className="text-xs text-gray-600">근처 펀딩 가게 찾기</p>
          </div>
        </motion.div>
      );
    }
    if (index === 2) {
      return (
        <motion.div
          className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-2 rounded shadow-md"
          variants={foodOverlayVariants}
          initial="initial"
          animate="visible"
        >
          <h3 className="text-md font-semibold text-emerald-600">펀딩 가게</h3>
          <ul className="text-xs text-gray-600 list-disc list-inside">
            <li>대우부대찌개 강남점</li>
            <li>마디노셰프 강남점</li>
            <li>신동궁 감자탕</li>
          </ul>
        </motion.div>
      );
    }
    if (index === 3) {
      return (
        <motion.div
          className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded shadow-md flex items-center gap-2"
          variants={foodOverlayVariants}
          initial="initial"
          animate="visible"
        >
          <FaFire className="text-emerald-600 text-xl" />
          <div>
            <h3 className="text-md font-semibold text-emerald-600">
              인기 메뉴
            </h3>
            <p className="text-xs text-gray-600">비빔밥, 할인 중</p>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 py-8">
      {" "}
      {/* Reduced pt-24 to py-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 flex flex-col lg:flex-row gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left: Text Description */}
          <motion.div className="flex-1" variants={containerVariants}>
            <motion.h2
              className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2 pt-4"
              variants={itemVariants}
            >
              <IoRestaurantOutline className="text-emerald-600 text-3xl" />
              한그릇 펀딩이란?
            </motion.h2>

            <motion.p
              className="text-gray-600 text-base mb-4"
              variants={itemVariants}
            >
              <span className="font-medium text-emerald-600">한그릇 펀딩</span>
              은 <span className="font-medium">소규모·개인 단위</span>로도 쉽게
              참여할 수 있는 음식 펀딩 서비스입니다.
            </motion.p>

            <motion.ul
              className="list-disc list-inside text-gray-600 text-base space-y-2 mb-4"
              variants={containerVariants}
            >
              {[
                "최소 인원 제한 없이 1인분만 펀딩 가능",
                "근처 식당 메뉴를 할인된 가격으로 예약",
                "빠르고 간편한 참여 프로세스",
              ].map((text, i) => (
                <motion.li key={i} variants={itemVariants}>
                  {text}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded-md flex items-center gap-2"
              variants={itemVariants}
            >
              <FaFire className="text-emerald-600 text-lg" />
              <p className="text-sm text-gray-600">
                현재 <span className="font-bold">런칭 기념</span>으로 참여 고객
                대상{" "}
                <span className="text-emerald-600 font-bold">
                  추가 포인트 적립
                </span>{" "}
                프로모션이 진행 중입니다. (추가 포인트 적립 비용은 PickTogether
                부담)
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Animated Map Zoom Sequence */}
          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
          >
            <div className="w-full max-w-[800px] h-[300px] rounded-lg overflow-hidden shadow-md relative">
              {" "}
              {/* Reduced h-[400px] to h-[300px] */}
              <AnimatePresence>
                <motion.img
                  key={images[currentImageIndex]}
                  src={`/${images[currentImageIndex]}`}
                  alt={`한그릇 펀딩 지도 단계 ${currentImageIndex + 1}`}
                  className="object-cover w-full h-full absolute top-0 left-0"
                  variants={getImageVariants(currentImageIndex)}
                  initial="initial"
                  animate="zoom"
                  exit="exit"
                />
              </AnimatePresence>
              {getOverlayContent(currentImageIndex)}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForOneUserIntro;
