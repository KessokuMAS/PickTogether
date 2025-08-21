// src/pages/ai/SearchResultPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { IoRestaurantOutline } from "react-icons/io5";

// 🔵 원형 게이지 (AiRecommendPage와 동일)
function CircularProgress({ value = 0, size = 45, stroke = 3 }) {
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

const SearchResultPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  const [results, setResults] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/search?query=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(data.results || []);
        setRelated(data.related_keywords || []);
      } catch (err) {
        console.error("검색 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
          <IoRestaurantOutline className="text-[28px]" />
          🔍 "{query}" 검색 결과
        </h2>

        {loading && <p className="text-gray-500">검색 중...</p>}

        {/* 연관검색어 */}
        {related.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-3">연관 검색어</h3>
            <div className="flex flex-wrap gap-2">
              {related.map((kw, idx) => (
                <span
                  key={idx}
                  className="cursor-pointer px-3 py-1 bg-gray-100 rounded-full hover:bg-emerald-100"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 검색 결과 카드 */}
        {results.length === 0 ? (
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {results.map((r) => {
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
                        <CircularProgress value={percent} />
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
        )}
      </div>
    </MainLayout>
  );
};

export default SearchResultPage;
