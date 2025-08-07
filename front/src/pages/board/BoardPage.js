import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

const BoardPage = () => {
  const [testData] = useState([
    {
      id: 1,
      title: "첫 번째 게시글",
      author: "작성자1",
      date: "2024-01-15",
      views: 150,
    },
    {
      id: 2,
      title: "두 번째 게시글",
      author: "작성자2",
      date: "2024-01-14",
      views: 89,
    },
    {
      id: 3,
      title: "세 번째 게시글",
      author: "작성자3",
      date: "2024-01-13",
      views: 234,
    },
    {
      id: 4,
      title: "네 번째 게시글",
      author: "작성자4",
      date: "2024-01-12",
      views: 67,
    },
    {
      id: 5,
      title: "다섯 번째 게시글",
      author: "작성자5",
      date: "2024-01-11",
      views: 189,
    },
  ]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">게시판</h1>
                <p className="mt-2 text-gray-600">커뮤니티 게시판입니다.</p>
              </div>
              <Link
                to="/main"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                메인으로 돌아가기
              </Link>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="게시글 검색..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>전체</option>
                  <option>제목</option>
                  <option>작성자</option>
                  <option>내용</option>
                </select>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  검색
                </button>
              </div>
            </div>
          </div>

          {/* 게시글 목록 */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  게시글 목록
                </h2>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                  글쓰기
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작성자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작성일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      조회수
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testData.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                          {post.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.views}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 페이지네이션 */}
          <div className="bg-white rounded-lg shadow mt-6 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                총 <span className="font-medium">{testData.length}</span>개의
                게시글
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  이전
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">
                  1
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  다음
                </button>
              </div>
            </div>
          </div>

          {/* 테스트 정보 */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              테스트 페이지 정보
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • 이 페이지는 Suspense와 lazy loading이 적용된 테스트
                페이지입니다.
              </li>
              <li>
                • 게시글 목록, 검색, 페이지네이션 기능이 포함되어 있습니다.
              </li>
              <li>• 반응형 디자인으로 모바일에서도 잘 보입니다.</li>
              <li>• Tailwind CSS를 사용하여 스타일링되었습니다.</li>
              <li>• MainMenu가 상단에 표시되어 네비게이션이 가능합니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BoardPage;
