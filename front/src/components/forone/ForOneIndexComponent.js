import React from "react";
import { FaUserFriends } from "react-icons/fa";
import { MdOutlineLocalDining } from "react-icons/md";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25 }, // 0.25초 간격으로 자식 순차 실행
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const ForOneUserIntro = () => {
  return (
    <section className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row gap-8 items-center max-w-6xl mx-auto my-12">
      {/* 왼쪽: 텍스트 설명 */}
      <motion.div
        className="flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3"
          variants={itemVariants}
        >
          <MdOutlineLocalDining className="text-pink-500 text-4xl" />
          한그릇 펀딩이란?
        </motion.h2>

        <motion.p
          className="text-gray-700 leading-relaxed mb-4"
          variants={itemVariants}
        >
          <strong className="text-pink-600">한그릇 펀딩</strong>은{" "}
          <span className="font-semibold">소규모·개인 단위</span>로도 쉽게
          참여할 수 있는 음식 펀딩 서비스입니다.
        </motion.p>

        <motion.ul
          className="list-disc list-inside text-gray-700 space-y-2 mb-6"
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
          className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-md flex items-start gap-3"
          variants={itemVariants}
        >
          <FaUserFriends className="text-pink-500 text-xl mt-1" />
          <p className="text-sm text-gray-600">
            현재 <strong>런칭 기념</strong>으로 참여 고객 대상{" "}
            <strong className="text-pink-600">추가 포인트 적립</strong>{" "}
            프로모션이 진행 중입니다. (추가 포인트 적립 비용은 PickTogether
            부담)
          </p>
        </motion.div>
      </motion.div>

      {/* 오른쪽: 이미지 영역 */}
      <motion.div
        className="flex-1 flex justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
      >
        <div className="w-full max-w-sm aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden shadow-md">
          <img
            src="/banner.png"
            alt="한그릇 펀딩 소개 이미지"
            className="object-cover w-full h-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default ForOneUserIntro;
