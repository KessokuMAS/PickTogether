import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { FiTrendingUp } from "react-icons/fi";
import { IoRestaurantOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";

// ✅ 원형 게이지 (달성률 색상 변화) - NearbyKakaoRestaurants와 동일
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
      {/* 🔹 퍼센트 텍스트만 크게 */}
      <span
        className="absolute font-bold transition-colors duration-500 ease-out"
        style={{
          fontSize: `${size * 0.3}px`, // 원 크기보다 크게
          color: pct >= 80 ? "#b91c1c" : pct >= 50 ? "#a16207" : "#1e40af",
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

// 펀딩 카드 컴포넌트 - NearbyKakaoRestaurants와 동일한 스타일
const FundingCard = ({ funding }) => {
  const {
    restaurantId,
    name,
    roadAddressName,
    distance,
    fundingAmount,
    fundingGoalAmount,
    fundingPercent,
    totalFundingAmount,
    imageUrl,
    fundingEndDate,
  } = funding;

  // 디버깅을 위한 로그 출력
  console.log(`Restaurant ${name}:`, {
    fundingAmount,
    totalFundingAmount,
    합산결과: (fundingAmount || 0) + (totalFundingAmount || 0),
    restaurantId,
  });

  // 실제 펀딩된 금액 (기본 fundingAmount + 펀딩 테이블 합산 금액)
  const actualFundingAmount = (fundingAmount || 0) + (totalFundingAmount || 0);

  const percent = Number.isFinite(fundingPercent)
    ? Number(fundingPercent)
    : fundingGoalAmount > 0 && actualFundingAmount >= 0
    ? Math.round(
        (Number(actualFundingAmount) * 100) / Number(fundingGoalAmount)
      )
    : 0;

  // 이미지 표시 여부 결정
  const hasCustomImage = imageUrl && imageUrl.includes("uploads/");
  const displayImage = hasCustomImage
    ? `http://localhost:8080/${imageUrl}`
    : `/${restaurantId}.jpg`; // ID 기반으로 일관된 이미지 표시

  const distLabel = Number.isFinite(Number(distance))
    ? `${Math.round(Number(distance)).toLocaleString()}m 거리`
    : "거리 정보 없음";

  const end = fundingEndDate
    ? new Date(fundingEndDate)
    : new Date(Date.now() + 14 * 86400000);
  const daysLeft = Math.max(0, Math.ceil((end - new Date()) / 86400000));

  return (
    <a
      href={`/restaurant/${restaurantId}`}
      className="bg-white overflow-hidden border border-gray-300 transition w-[270px] h-[380px] flex flex-col group rounded-lg"
    >
      {/* 이미지 영역 */}
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden relative group">
        <img
          src={displayImage}
          alt={`${name} 이미지`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* 호버 시 오버레이 */}
        <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/restaurant/${restaurantId}`;
            }}
            className="px-4 py-2 text-white font-bold rounded hover:bg-opacity-80 transition"
          >
            자세히 보기
          </button>
        </div>
      </div>

      <div className="p-1  flex-1 flex flex-col justify-between">
        <div className="min-w-0">
          {/* 이름 + 게이지 */}
          <div className="flex items-center justify-between gap-2 ">
            <h3 className="text-lg font-semibold text-[20px] text-black truncate flex-1">
              {name}
            </h3>
            <div className="shrink-0 mt-4">
              <CircularProgress value={percent} size={50} stroke={3} />
            </div>
          </div>

          <p className="text-sm text-gray-600 truncate">
            {roadAddressName || "-"}
          </p>

          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <TbCurrentLocation className="text-base" />
            {distLabel}
          </p>

          <div className="mt-2 pt-6">
            {/* 구분선 */}
            <div className="border-t border-gray-300 mb-2"></div>

            {/* 남은 일수 + 펀딩금액 */}
            <div className="flex items-center justify-between text-[13px]">
              <span
                className={`inline-flex items-center text-[16px] ${
                  daysLeft <= 5
                    ? "text-red-600 font-bold"
                    : "text-black font-normal"
                }`}
              >
                {daysLeft}일 남음
              </span>
              <span className="inline-flex items-center text-[16px] text-green-600 ">
                {actualFundingAmount.toLocaleString()}원 펀딩
              </span>
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
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 추가 로딩 상태

  // Intersection Observer를 위한 ref
  const observerRef = useRef();
  const loadingRef = useRef();

  // 기존 API 사용하여 데이터 가져오기
  const fetchTrendingFundings = async (nextPage = 0) => {
    try {
      // 첫 번째 페이지가 아닐 때는 추가 로딩 상태로 설정
      if (nextPage === 0) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
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
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTrendingFundings(0);
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || isLoadingMore) return;
    fetchTrendingFundings(page + 1);
  }, [hasMore, loading, isLoadingMore, page]);

  // Intersection Observer 설정
  useEffect(() => {
    if (!hasMore) {
      console.log("Observer setup skipped - no more data:", { hasMore });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loading &&
          !isLoadingMore
        ) {
          console.log("Intersection Observer triggered - loading more data");
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px", // 100px 전에 미리 로드 시작
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
      console.log("Observer attached to loading element");
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        console.log("Observer disconnected");
      }
    };
  }, [hasMore, loading, isLoadingMore, loadMore]);

  // 첫 번째 로딩만 전체 화면 로딩으로 표시
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
          <h2 className="flex items-center gap-2 text-xl mb-3 leading-none">
            <IoRestaurantOutline className="text-[32px] relative top-[1px] shrink-0" />
            <span className="text-[22px]">인기 펀딩 음식점</span>
          </h2>

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

              {/* 무한스크롤을 위한 감지 요소 - 추가 로딩 상태로 변경 */}
              {hasMore && (
                <div ref={loadingRef} className="flex justify-center py-8">
                  {isLoadingMore && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">
                        더 많은 인기 펀딩을 불러오는 중...
                      </p>
                    </div>
                  )}
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
