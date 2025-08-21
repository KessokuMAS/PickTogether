import React from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

const ImageSearchResultPage = () => {
  const location = useLocation();
  const { results = [], previewUrl } = location.state || {};

  return (
    <MainLayout>
      <div className="flex gap-6 p-6">
        {/* 왼쪽: 업로드한 이미지 */}
        <div className="w-1/3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Uploaded"
              className="w-full rounded-lg shadow"
            />
          ) : (
            <p className="text-gray-500">업로드한 이미지 없음</p>
          )}
        </div>

        {/* 오른쪽: 검색 결과 */}
        <div className="w-2/3">
          <h2 className="text-xl font-bold mb-4">검색 결과</h2>
          {results.length > 0 ? (
            <ul className="grid grid-cols-2 gap-4">
              {results.map((item) => (
                <li
                  key={item.id}
                  className="border rounded-lg p-3 shadow hover:shadow-md transition"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded mb-2"
                  />

                  <p className="font-semibold text-lg">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    카테고리: {item.category_name}
                  </p>

                  <p className="text-sm text-gray-600">
                    펀딩:{" "}
                    <span className="font-semibold text-emerald-600">
                      {item.funding_amount.toLocaleString()}원
                    </span>{" "}
                    / {item.funding_goal_amount.toLocaleString()}원
                  </p>

                  <p className="text-xs text-gray-500">
                    기간: {item.funding_start_date} ~ {item.funding_end_date}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    유사도: {(item.score * 100).toFixed(1)}%
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ImageSearchResultPage;
