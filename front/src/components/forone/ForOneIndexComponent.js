import React from "react";
import { IoRestaurantOutline } from "react-icons/io5";
import { FaFire } from "react-icons/fa";
import { motion } from "framer-motion";
import Test from "../test/Test";

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

const ForOneUserIntro = () => {
  return (
    <div className="bg-gray-50 py-8">
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

          {/* ✅ Right: 지도 컴포넌트로 교체 */}
          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
          >
            <div className="w-full max-w-[800px] h-[400px] rounded-lg overflow-hidden shadow-md relative">
              <Test />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForOneUserIntro;
