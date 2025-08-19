import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { FiTrendingUp } from "react-icons/fi";

// ✅ 심플 원형 게이지 (SVG) - NearbyKakaoResturants와 동일한 스타일
function CircularProgress({ value = 0, size = 36, stroke = 4 }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

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
          className="text-blue-400"
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold text-gray-800">
        {pct}%
      </span>
    </div>
  );
}

// 펀딩 카드 컴포넌트 - NearbyKakaoResturants와 동일한 스타일
const FundingCard = ({ funding }) => {
  const {
    restaurantId,
    name,
    roadAddressName,
    fundingAmount,
    fundingGoalAmount,
    fundingPercent,
    totalFundingAmount,
    imageUrl,
    fundingStartDate,
    fundingEndDate,
  } = funding;

  // 총 펀딩 금액 = 원래 펀딩 금액 + 실제 결제된 총 금액
  const totalAmount = (fundingAmount || 0) + (totalFundingAmount || 0);

  // 디버깅용 콘솔 출력
  console.log(`Restaurant ${name}:`, {
    fundingAmount,
    totalFundingAmount,
    restaurantId,
    calculatedTotal: totalAmount,
  });

  // 진행률 계산 (서버에서 내려온 값 우선, 없으면 계산)
  const percent = Number.isFinite(fundingPercent)
    ? Number(fundingPercent)
    : fundingGoalAmount > 0 && totalAmount >= 0
    ? Math.round((Number(totalAmount) * 100) / Number(fundingGoalAmount))
    : 0;

  // 이미지 URL 처리
  const imgSrc = imageUrl || `/${Math.floor(Math.random() * 45 + 1)}.png`;

  // D-day 계산 (서버에서 내려온 날짜 우선, 없으면 14일 고정)
  const end = fundingEndDate
    ? new Date(fundingEndDate)
    : new Date(Date.now() + 14 * 86400000);
  const daysLeft = Math.max(0, Math.ceil((end - new Date()) / 86400000));

  return (
    <a
      href={`/restaurant/${restaurantId}`}
      className="bg-white overflow-hidden border border-gray-300 transition w-[270px] h-[380px] flex flex-col group rounded-lg"
    >
      <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
        <img
          src={imgSrc}
          alt={`${name} 이미지`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-1 flex-1 flex flex-col justify-between">
        <div className="min-w-0">
          {/* 이름 + 게이지 우측 배치 */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-black truncate flex-1">
              {name}
            </h3>
            <div className="shrink-0 mt-4">
              <CircularProgress value={percent} size={40} stroke={4} />
            </div>
          </div>

          <p className="text-sm text-gray-600 truncate">
            {roadAddressName || "-"}
          </p>

          {/* 펀딩 기간 / D-day */}
          <div className="mt-2 flex items-center justify-between text-[13px]">
            <div className="text-gray-800 truncate font-semibold">
              {fundingStartDate && fundingEndDate
                ? `${new Date(fundingStartDate).toLocaleDateString(
                    "ko-KR"
                  )} ~ ${new Date(fundingEndDate).toLocaleDateString("ko-KR")}`
                : "기간 정보 없음"}
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-md font-bold border-blue-200 ${
                daysLeft <= 3
                  ? "bg-white-50 text-blue-600 border-red-200"
                  : "bg-white-100 text-blue-700 border-pink-200"
              }`}
            >
              D-{daysLeft}
            </span>
          </div>
        </div>

        <div className="">
          <hr className="border-gray-300" />
          <div className="flex justify-between text-sm text-gray-700 pt-2">
            <div className="font-semibold">
              {Number(totalAmount).toLocaleString("ko-KR")}원 모임
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};

const TrendingFundingPage = () => {
  const [fundings, setFundings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 기존 API 사용하여 데이터 가져오기
  const fetchTrendingFundings = async (nextPage = 0) => {
    try {
      setLoading(true);
      setError("");

      // 서울 강남역 좌표 (기본값)
      const lat = 37.5027;
      const lng = 127.0352;
      const radius = 10000; // 10km 반경
      const size = 24;

      const params = new URLSearchParams({
        lat: lat,
        lng: lng,
        radius: radius,
        page: nextPage,
        size: size,
      }).toString();

      // 백엔드 서버 URL 확인
      const API_BASE =
        import.meta?.env?.VITE_API_BASE || "http://localhost:8080";
      const url = `${API_BASE}/api/restaurants/nearby?${params}`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`예상치 못한 응답 형식: ${contentType}`);
      }

      const data = await res.json();

      // 진행률 순으로 정렬하여 인기펀딩으로 만들기
      let sortedContent = data.content || [];
      sortedContent.sort((a, b) => {
        const aProgress = Number.isFinite(a.fundingPercent)
          ? Number(a.fundingPercent)
          : a.fundingGoalAmount > 0 && a.totalFundingAmount >= 0
          ? Math.round(
              (Number(a.totalFundingAmount) * 100) / Number(a.fundingGoalAmount)
            )
          : 0;

        const bProgress = Number.isFinite(b.fundingPercent)
          ? Number(b.fundingPercent)
          : b.fundingGoalAmount > 0 && b.totalFundingAmount >= 0
          ? Math.round(
              (Number(b.totalFundingAmount) * 100) / Number(b.fundingGoalAmount)
            )
          : 0;

        // 진행률 높은 순서로 정렬 (내림차순)
        return bProgress - aProgress;
      });

      if (nextPage === 0) {
        setFundings(sortedContent);
      } else {
        setFundings((prev) => [...prev, ...sortedContent]);
      }

      setHasMore(data.last === false);
      setPage(data.number || nextPage);
    } catch (err) {
      console.error("API 호출 에러:", err);
      setError(`인기펀딩을 불러오는데 실패했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingFundings(0);
  }, []);

  const loadMore = () => {
    if (!hasMore || loading) return;
    fetchTrendingFundings(page + 1);
  };

  if (loading && page === 0) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-2 flex justify-center bg-white min-h-screen">
        <div className="w-full max-w-[1200px]">
          {/* 헤더 섹션 - NearbyKakaoResturants와 동일한 스타일 */}
          <div className="flex items-center gap-2 text-xl mb-3 leading-none">
            <FiTrendingUp className="text-[32px] relative top-[1px] shrink-0" />
            <span className="text-[22px]">인기 펀딩</span>
          </div>

          {/* 펀딩 목록 */}
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <button
                onClick={() => fetchTrendingFundings(0)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                다시 시도
              </button>
            </div>
          ) : fundings.length === 0 ? (
            <p className="text-gray-500 text-center">
              인기 펀딩을 찾을 수 없습니다.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {fundings.map((funding) => (
                  <FundingCard
                    key={funding.restaurantId || funding.id}
                    funding={funding}
                  />
                ))}
              </div>

              {/* 더보기 버튼 - NearbyKakaoResturants와 동일한 스타일 */}
              {hasMore && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                  >
                    {loading ? "불러오는 중…" : "더 보기"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default TrendingFundingPage;
