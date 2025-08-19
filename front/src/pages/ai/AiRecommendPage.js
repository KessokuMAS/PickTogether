import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../layouts/MainLayout";
import { getCookie } from "../../utils/cookieUtil";

const AiRecommendPage = () => {
  const [userEmail, setUserEmail] = useState("");
  const [recommend, setRecommend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 쿠키에서 사용자 정보 가져오기
    const memberCookie = getCookie("member");
    if (memberCookie?.member?.email) {
      setUserEmail(memberCookie.member.email);
    } else {
      setError("로그인이 필요합니다.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    setLoading(true);
    setError("");

    axios
      .get(
        `http://localhost:8000/recommend/top-restaurants?user_email=${userEmail}`
      )
      .then((res) => {
        console.log("추천 응답:", res.data);
        setRecommend(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("추천 에러:", err);
        setError("추천 데이터를 불러오는데 실패했습니다.");
        setLoading(false);
      });
  }, [userEmail]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">AI 추천을 준비하고 있습니다...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => (window.location.href = "/member/login")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              로그인하기
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="ml-12">AI OverView</h1>

      {/* ✅ 카테고리 차트 + 추천 음식점을 가로로 배치 */}
      <div className="flex gap-8 ml-12">
        {/* 카테고리별 주문 비율 차트 */}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">카테고리별 주문 비율</h2>
          <iframe
            src={`http://localhost:8000/chart/category?user_email=${userEmail}`}
            title="카테고리"
            className="border rounded-lg shadow-md w-[600px] h-[600px]"
            scrolling="no"
          />
        </div>

        {/* 👉 추천 음식점 섹션 */}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">
            가장 많이 펀딩한 {recommend?.topCategory || "데이터 없음"} 주변
            펀딩중인 음식점 이예요!
          </h2>

          {recommend &&
          Array.isArray(recommend.recommended) &&
          recommend.recommended.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 max-w-lg">
              {recommend.recommended.map((r) => (
                <div
                  key={r.id}
                  className="p-4 border rounded-lg shadow hover:shadow-lg transition"
                >
                  <p className="font-semibold text-lg">{r.name}</p>
                  <p className="text-sm text-gray-600">{r.address}</p>
                  <p className="text-xs text-pink-500">
                    카테고리: {r.category_name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>추천 데이터가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 식당 TOP5 차트 */}
      <div className="py-8 ml-12">
        <h2 className="text-xl font-bold mb-4">자주 주문한 식당</h2>
        <iframe
          src={`http://localhost:8000/chart/restaurant?user_email=${userEmail}`}
          title="주문"
          className="border rounded-lg shadow-md w-[600px] h-[600px]"
        />
      </div>
    </MainLayout>
  );
};

export default AiRecommendPage;
