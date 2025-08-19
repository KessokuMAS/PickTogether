import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  FiSearch,
  FiPlus,
  FiMessageSquare,
  FiHeart,
  FiEye,
  FiClock,
  FiTrendingUp,
  FiFilter,
} from "react-icons/fi";

const BoardPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]); // ✅ 빈 배열로 초기화
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true); // ✅ true로 시작 (데이터 로딩 중)
  const [error, setError] = useState(null); // ✅ 에러 상태 추가

  // 카테고리 목록
  const categories = [
    {
      id: "all",
      name: "전체",
      icon: "✨",
      color: "from-purple-400 to-pink-400",
    },
    {
      id: "free",
      name: "자유게시판",
      icon: "💬",
      color: "from-blue-400 to-cyan-400",
    },
    {
      id: "review",
      name: "리뷰",
      icon: "⭐",
      color: "from-yellow-400 to-orange-400",
    },
    {
      id: "question",
      name: "질문",
      icon: "❓",
      color: "from-green-400 to-teal-400",
    },
    {
      id: "share",
      name: "정보공유",
      icon: "📢",
      color: "from-indigo-400 to-purple-400",
    },
    {
      id: "event",
      name: "이벤트",
      icon: "🎉",
      color: "from-pink-400 to-rose-400",
    },
  ];

  // 임시 게시글 데이터 (백엔드 연결 전)
  const mockPosts = [
    {
      id: 1,
      title: "오늘 점심 메뉴 추천해주세요!",
      content: "근처에 맛있는 점심집이 있을까요?",
      author: "맛집탐험가",
      authorAvatar: "🍜",
      category: "question",
      createdAt: "2시간 전",
      viewCount: 45,
      likeCount: 12,
      commentCount: 8,
      isLiked: false,
      tags: ["맛집", "점심", "추천"],
    },
    {
      id: 2,
      title: "신촌 맛집 리뷰 - 김밥천국",
      content: "신촌역 근처 김밥천국 다녀왔어요. 가성비 최고!",
      author: "맛집리뷰어",
      authorAvatar: "🍽️",
      category: "review",
      createdAt: "5시간 전",
      viewCount: 128,
      likeCount: 34,
      commentCount: 15,
      isLiked: true,
      tags: ["신촌", "맛집", "리뷰"],
    },
    {
      id: 3,
      title: "공동구매 모집합니다",
      content: "신촌 치킨집 공동구매 하실 분 있나요?",
      author: "공동구매러",
      authorAvatar: "🛒",
      category: "share",
      createdAt: "1일 전",
      viewCount: 89,
      likeCount: 23,
      commentCount: 12,
      isLiked: false,
      tags: ["공동구매", "치킨", "모집"],
    },
    {
      id: 4,
      title: "맛집 정보 공유합니다",
      content: "홍대 근처 숨겨진 맛집들을 정리해봤어요",
      author: "맛집정보원",
      authorAvatar: "📚",
      category: "share",
      createdAt: "2일 전",
      viewCount: 256,
      likeCount: 67,
      commentCount: 28,
      isLiked: false,
      tags: ["홍대", "맛집", "정보"],
    },
    {
      id: 5,
      title: "오늘 날씨가 좋네요",
      content: "점심 먹고 산책하기 좋은 날씨입니다",
      author: "자유인",
      authorAvatar: "🌤️",
      category: "free",
      createdAt: "3일 전",
      viewCount: 34,
      likeCount: 8,
      commentCount: 5,
      isLiked: false,
      tags: ["날씨", "산책", "일상"],
    },
  ];

  useEffect(() => {
    // 컴포넌트 마운트 시 게시글 로드
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: 백엔드 API 연결 시 주석 해제
      // const response = await boardApi.getPosts();
      // console.log('API 응답:', response); // ✅ 응답 구조 확인용 로그
      // setPosts(response.content || response.data || response || []); // ✅ 안전한 데이터 추출

      // 임시로 목 데이터 사용
      setTimeout(() => {
        setPosts(mockPosts);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("게시글 로드 실패:", error);
      setError(error.message || "게시글을 불러오는데 실패했습니다.");
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: 검색 API 호출
    console.log("검색어:", searchTerm);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    // TODO: 카테고리별 게시글 필터링 API 호출
  };

  const handleLike = async (postId) => {
    try {
      // TODO: 백엔드 좋아요 API 호출
      // await fetch(`/api/posts/${postId}/like`, { method: 'POST' });

      // 임시로 로컬 상태만 변경
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked
                  ? post.likeCount - 1
                  : post.likeCount + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  const handleWritePost = () => {
    navigate("/board/write");
  };

  const handlePostClick = (postId) => {
    navigate(`/board/${postId}`);
  };

  // ✅ 안전한 필터링 - posts가 배열인지 확인
  const filteredPosts = Array.isArray(posts)
    ? posts.filter(
        (post) =>
          selectedCategory === "all" || post.category === selectedCategory
      )
    : [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 섹션 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
              커뮤니티
            </h1>
            <p className="text-gray-600 text-lg">
              맛집 정보를 공유하고 소통해보세요
            </p>
          </div>

          {/* 🔍 검색창 */}
          <div className="flex flex-col justify-center items-center mb-10">
            <div className="relative w-full max-w-2xl">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="커뮤니티에서 검색하세요..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-16 py-4 rounded-3xl border-0 shadow-2xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-purple-200 focus:bg-white text-gray-800 placeholder-gray-400 text-lg"
                />
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-purple-400">
                  <FiSearch size={24} />
                </div>
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  검색
                </button>
              </form>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                  selectedCategory === category.id
                    ? "shadow-2xl scale-105"
                    : "shadow-lg hover:shadow-xl"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-90`}
                />
                <div className="relative flex items-center gap-3 px-6 py-4 text-white font-semibold">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-lg">{category.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 게시글 작성 버튼 */}
          <div className="flex justify-center mb-10">
            <button
              onClick={handleWritePost}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-8 py-4 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-3 text-lg font-semibold">
                <FiPlus size={24} />
                <span>새 게시글 작성</span>
              </div>
            </button>
          </div>

          {/* 게시글 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-20">
                <div className="bg-red-50 border border-red-200 rounded-3xl p-12 shadow-xl">
                  <p className="text-xl text-red-600 mb-2">
                    오류가 발생했습니다
                  </p>
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={loadPosts}
                    className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            ) : !Array.isArray(filteredPosts) || filteredPosts.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl">
                  <FiMessageSquare
                    size={64}
                    className="mx-auto mb-6 text-gray-300"
                  />
                  <p className="text-xl text-gray-500 mb-2">
                    게시글이 없습니다
                  </p>
                  <p className="text-gray-400">
                    첫 번째 게시글을 작성해보세요!
                  </p>
                </div>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post.id)}
                  className="group bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
                >
                  {/* 카테고리 헤더 */}
                  <div className="relative h-32 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 p-6">
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                        {categories.find((c) => c.id === post.category)?.name}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm opacity-90">{post.createdAt}</p>
                    </div>
                  </div>

                  {/* 게시글 내용 */}
                  <div className="p-6">
                    {/* 제목 */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* 내용 미리보기 */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.content}
                    </p>

                    {/* 태그 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* 작성자 */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-lg">
                        {post.authorAvatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {post.author}
                        </p>
                        <p className="text-sm text-gray-500">게시글 작성자</p>
                      </div>
                    </div>

                    {/* 통계 정보 */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiEye size={16} />
                          <span>{post.viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiMessageSquare size={16} />
                          <span>{post.commentCount}</span>
                        </div>
                      </div>

                      {/* 좋아요 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                        className={`p-2 rounded-full transition-all duration-200 ${
                          post.isLiked
                            ? "bg-red-100 text-red-500 hover:bg-red-200"
                            : "bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-purple-500"
                        }`}
                      >
                        <FiHeart
                          size={20}
                          className={post.isLiked ? "fill-current" : ""}
                        />
                      </button>
                    </div>

                    {/* 좋아요 수 표시 */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">{post.likeCount}</span>
                        명이 좋아합니다
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 (백엔드 연결 시 구현) */}
          <div className="flex justify-center mt-16">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl">
              <button className="px-4 py-2 text-gray-500 hover:text-purple-600 transition-colors rounded-xl hover:bg-purple-50">
                이전
              </button>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={`px-3 py-2 rounded-xl transition-all duration-200 ${
                      page === 1
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button className="px-4 py-2 text-gray-500 hover:text-purple-600 transition-colors rounded-xl hover:bg-purple-50">
                다음
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BoardPage;
