 
ㅇ// src/pages/ai/AiRecommendPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../layouts/MainLayout";
import { IoRestaurantOutline } from "react-icons/io5";

// 원형 게이지 컴포넌트
function CircularProgress({ value = 0, size = 50, stroke = 4 }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  let strokeColor;
  if (pct >= 80) strokeColor = "#ef4444";
  else if (pct >= 50) strokeColor = "#facc15";
  else strokeColor = "#3b82f6";

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center"
      title={`${pct}%`}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="text-gray-200"
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={strokeColor}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-colors duration-500 ease-out"
        />
      </svg>
      <span
        className="absolute font-bold"
        style={{
          fontSize: `${size * 0.3}px`,
          color: pct >= 80 ? "#b91c1c" : pct >= 50 ? "#a16207" : "#1e40af",
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

const AiRecommendPage = () => {
  const userEmail = "ish979797@naver.com"; // 👉 로그인 유저 이메일로 교체
  const [recommend, setRecommend] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/report/summary?user_email=${userEmail}`)
      .then((res) => {
        console.log("리포트 응답:", res.data);
        setReport(res.data);
      })
      .catch((err) => console.error("리포트 에러:", err));
  }, [userEmail]);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/recommend/deep?user_email=${userEmail}`)
      .then((res) => {
        console.log("추천 응답:", res.data);
        setRecommend(res.data);
      })
      .catch((err) => console.error("추천 에러:", err));
  }, [userEmail]);

  return (
    <MainLayout>
      {/* 2. 차트 */}
      <section className="flex gap-8 justify-center mb-12">
        {/* 카테고리 차트 */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">
            카테고리별 펀딩 비율
          </h2>
          <iframe
            src={`http://localhost:8000/chart/category?user_email=${userEmail}`}
            title="카테고리"
            className="border rounded-lg shadow-md w-[600px] h-[600px] mx-auto"
            scrolling="no"
          />
        </div>

        {/* 식당 TOP5 */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">
            자주펀딩한 식당 TOP5
          </h2>
          <iframe
            src={`http://localhost:8000/chart/restaurant?user_email=${userEmail}`}
            title="주문"
            className="border rounded-lg shadow-md w-[600px] h-[600px] mx-auto"
            scrolling="no"
          />
        </div>
      </section>

      {/* 3. AI 추천 음식점 */}
      <section className="flex flex-col items-center mb-12">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-6">
          <IoRestaurantOutline className="text-[28px]" />
          AI 기반 추천 음식점
        </h2>

        {recommend &&
        Array.isArray(recommend.recommended) &&
        recommend.recommended.length > 0 ? (
          <div className="grid grid-cols-5 gap-6 justify-center">
            {recommend.recommended.map((r) => {
              const {
                id,
                name,
                category_name,
                funding_amount,
                funding_goal_amount,
                funding_end_date,
                image_url,
                address,
              } = r;

              const percent =
                funding_goal_amount > 0
                  ? Math.round(
                      (Number(funding_amount) * 100) /
                        Number(funding_goal_amount)
                    )
                  : 0;

              const imgSrc =
                image_url || `/${Math.floor(Math.random() * 45 + 1)}.png`;

              const end = funding_end_date
                ? new Date(funding_end_date)
                : new Date(Date.now() + 14 * 86400000);
              const daysLeft = Math.max(
                0,
                Math.ceil((end - new Date()) / 86400000)
              );

              return (
                <a
                  key={id}
                  href={`/restaurant/${id}`}
                  className="bg-white overflow-hidden border border-gray-300 transition w-[270px] h-[360px] flex flex-col group rounded-lg"
                >
                  {/* 이미지 */}
                  <div className="w-full h-40 bg-gray-100 overflow-hidden relative group">
                    <img
                      src={imgSrc}
                      alt={`${name} 이미지`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* 본문 */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-semibold text-black truncate flex-1">
                          {name}
                        </h3>
                        <CircularProgress
                          value={percent}
                          size={45}
                          stroke={3}
                        />
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {address || "-"}
                      </p>
                      <p className="text-xs text-pink-500 mt-1">
                        카테고리: {category_name}
                      </p>

                      {/* 남은 일수 + 펀딩 금액 */}
                      <div className="mt-3 pt-2 border-t border-gray-300 flex items-center justify-between text-sm">
                        <span
                          className={`${
                            daysLeft <= 5
                              ? "text-red-600 font-bold"
                              : "text-gray-800"
                          }`}
                        >
                          {daysLeft}일 남음
                        </span>
                        <span className="text-green-600 font-semibold">
                          {funding_amount?.toLocaleString() || 0}원 펀딩
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <p>추천 데이터가 없습니다.</p>
        )}
      </section>
    </MainLayout>
  );
};

export default AiRecommendPage;
