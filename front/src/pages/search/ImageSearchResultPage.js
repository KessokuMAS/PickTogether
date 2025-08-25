import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "../../layouts/MainLayout";
import { IoRestaurantOutline } from "react-icons/io5";
import { FaFire } from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const ImageSearchResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results = [], previewUrl } = location.state || {};

  return (
    <MainLayout>
      <motion.div
        className=" min-h-screen p-4 sm:p-6 md:p-8 "
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-[1440px] mx-auto">
          <motion.h1
            className="text-3xl font-bold text-gray-800 mb-6 tracking-tight"
            variants={itemVariants}
          >
            이미지 검색 결과
          </motion.h1>
          <motion.p className="mb-4" variants={itemVariants}>
            업로드한 이미지와 유사한 맛집 펀딩을 확인해보세요!
          </motion.p>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* 왼쪽: 업로드한 이미지 */}
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  업로드한 이미지
                </h2>
                {previewUrl ? (
                  <motion.img
                    src={previewUrl}
                    alt="Uploaded"
                    whileHover={{ scale: 1.05 }}
                  />
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">
                    업로드한 이미지 없음
                  </p>
                )}
              </div>
            </motion.div>

            {/* 오른쪽: 검색 결과 */}
            <motion.div className="w-full lg:w-2/3" variants={itemVariants}>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                검색 결과
              </h2>
              {results.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
                  variants={containerVariants}
                >
                  {results.map((item) => {
                    const percent =
                      item.funding_goal_amount > 0
                        ? Math.round(
                            (item.funding_amount * 100) /
                              item.funding_goal_amount
                          )
                        : 0;
                    const end = new Date(item.funding_end_date);
                    const daysLeft = Math.max(
                      0,
                      Math.ceil((end - new Date()) / 86400000)
                    );

                    return (
                      <motion.div
                        key={item.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl hover:ring-2 hover:ring-red-400 transition-all duration-300 group flex flex-col
                        w-64"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="relative h-48 overflow-hidden">
                          {percent >= 80 && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-sm">
                              인기{" "}
                            </span>
                          )}
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-red-600 bg-opacity-0 group-hover:bg-opacity-15 flex items-center justify-center transition-all duration-300">
                            <button
                              onClick={() => navigate(`/restaurant/${item.id}`)}
                              className="px-4 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700 shadow-md"
                            >
                              자세히 보기
                            </button>
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 truncate flex items-center gap-1.5">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-600 truncate mt-1.5 font-medium">
                              카테고리: {item.category_name || "-"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1.5">
                              유사도: {(item.score * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between text-xs">
                              <span
                                className={`flex items-center gap-1.5 ${
                                  daysLeft <= 5
                                    ? "text-red-600 font-semibold"
                                    : "text-gray-600"
                                }`}
                              >
                                {daysLeft === 0 ? "종료" : `${daysLeft}일 남음`}
                              </span>
                              <span className="text-green-600 font-semibold">
                                {item.funding_amount.toLocaleString()}원 /{" "}
                                {item.funding_goal_amount.toLocaleString()}원
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  className="text-center py-16"
                  variants={itemVariants}
                >
                  <div className="text-5xl mb-3">🍴</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-gray-600 text-sm">
                    다른 이미지를 업로드해 보세요!
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ImageSearchResultPage;
