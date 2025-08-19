import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { communityApi } from "../../api/communityApi";
import { getCookie } from "../../utils/cookieUtil";
import { useAuth } from "../../context/AuthContext";

import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiMessageSquare,
  FiClock,
  FiUser,
  FiX,
  FiHeart,
  FiCalendar,
  FiTag,
  FiMoreVertical,
  FiShare2,
  FiBookmark,
} from "react-icons/fi";

const CommunityPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [todayRecommendation, setTodayRecommendation] = useState(null);

  // getImageUrl 함수 정의
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    // 백엔드에서 저장하는 경로가 /images/filename.png 형태이므로
    // /uploads/images/filename.png로 접근해야 함
    return `http://localhost:8080/uploads${imageUrl}`;
  };

  // 상태 관리
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCategory, setCurrentCategory] = useState("전체");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "일반",
    imageFile: null,
    imagePreview: null,
  });

  const categories = ["전체", "일반", "맛집추천", "후기", "건강", "질문"];
  // 현재 로그인 사용자 닉네임 (작성자 판별용)
  const memberInfo = getCookie("member");
  const currentNickname =
    (memberInfo && (memberInfo.member?.nickname || memberInfo.nickname)) ||
    null;

  // 초기 데이터 로드
  useEffect(() => {
    loadPosts();
    loadTodayRecommendation();
  }, []);

  // 오늘의 추천 데이터 로드
  const loadTodayRecommendation = async () => {
    try {
      const recommendation = await communityApi.getTodayRecommendation();
      setTodayRecommendation(recommendation);
    } catch (error) {
      console.error("오늘의 추천 로드 실패:", error);
      setTodayRecommendation({
        restaurantName: "추천 맛집",
        mentionCount: 0,
        description: "커뮤니티에서 추천된 맛집을 확인해보세요!",
        imageUrl: "/images/recommendation-placeholder.jpg",
      });
    }
  };

  // 게시글 목록 로드
  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityApi.getPosts(
        0,
        50,
        "createdAt",
        "desc",
        userInfo?.email
      );
      // response가 배열인지 확인하고 안전하게 설정
      if (response && Array.isArray(response.content)) {
        setPosts(response.content);
      } else if (Array.isArray(response)) {
        setPosts(response);
      } else {
        console.warn("예상치 못한 응답 형태:", response);
        setPosts([]);
      }
    } catch (error) {
      console.error("게시글 로드 실패:", error);
      setError(
        error?.response?.data?.message ||
          error.message ||
          "게시글을 불러오는데 실패했습니다."
      );
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 게시글 작성/수정
  const handleSubmitPost = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    // 로그인 상태 확인
    const memberInfo = getCookie("member");
    if (!memberInfo || !memberInfo.accessToken) {
      alert("로그인이 필요합니다. 먼저 로그인해주세요.");
      navigate("/member/login");
      return;
    }

    try {
      setLoading(true);

      // FormData 생성
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("content", formData.content);
      submitData.append("category", formData.category);
      // 작성자 닉네임 함께 전송 (작성자 전용 메뉴 표시를 위해 저장)
      const memberInfoForAuthor = getCookie("member");
      const nicknameToSend =
        (memberInfoForAuthor &&
          (memberInfoForAuthor.member?.nickname ||
            memberInfoForAuthor.nickname)) ||
        "익명사용자";
      submitData.append("author", nicknameToSend);
      if (formData.imageFile) {
        submitData.append("imageFile", formData.imageFile);
      }

      if (editingPost) {
        // 수정
        const updatedPost = await communityApi.updatePost(
          editingPost.id,
          submitData
        );
        setPosts(
          posts.map((post) => (post.id === editingPost.id ? updatedPost : post))
        );
        setEditingPost(null);
      } else {
        // 새 글 작성
        const newPost = await communityApi.createPost(submitData);
        setPosts([newPost, ...posts]);
      }

      // 폼 초기화
      setFormData({
        title: "",
        content: "",
        category: "일반",
        imageFile: null,
        imagePreview: null,
      });
      setShowWriteForm(false);

      // 목록 새로고침
      loadPosts();
    } catch (error) {
      if (error?.response?.status === 403) {
        alert("로그인이 필요하거나 권한이 없습니다. 다시 로그인해주세요.");
        navigate("/member/login");
      } else {
        alert("게시글 저장에 실패했습니다.");
        console.error("게시글 저장 실패:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 게시글 삭제
  const handleDeletePost = async (postId) => {
    if (window.confirm("정말로 이 글을 삭제하시겠습니까?")) {
      try {
        setLoading(true);
        await communityApi.deletePost(postId);
        setPosts(posts.filter((post) => post.id !== postId));
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(null);
        }
      } catch (error) {
        alert("게시글 삭제에 실패했습니다.");
        console.error("게시글 삭제 실패:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // 게시글 좋아요
  const handleLikePost = async (postId) => {
    try {
      // 현재 로그인된 사용자 이메일 가져오기
      const userEmail = userInfo?.email;
      if (!userEmail) {
        alert("로그인이 필요합니다. 로그인 후 이용해 주세요.");
        navigate("/member/login");
        return;
      }

      const updatedPost = await communityApi.toggleLike(postId, userEmail);
      setPosts(posts.map((post) => (post.id === postId ? updatedPost : post)));
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(updatedPost);
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        alert("로그인이 필요합니다. 로그인 후 이용해 주세요.");
        navigate("/member/login");
      } else {
        console.error("좋아요 실패:", error);
      }
    }
  };

  // 게시글 수정 모드
  const handleEditPost = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category,
      imageFile: null,
      imagePreview: post.imageUrl || null,
    });
    setShowWriteForm(true);
  };

  // 검색
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPosts();
      return;
    }

    try {
      setLoading(true);
      const response = await communityApi.searchPosts(searchTerm);
      setPosts(response.content || []);
    } catch (error) {
      console.error("검색 실패:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 필터
  const handleCategoryFilter = async (category) => {
    setCurrentCategory(category);
    if (category === "전체") {
      loadPosts();
      return;
    }

    try {
      setLoading(true);
      const response = await communityApi.getPostsByCategory(category);
      setPosts(response.content || []);
    } catch (error) {
      console.error("카테고리 필터 실패:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷팅 (요청사항)
  // - 오늘(같은 날짜): 1분전 / 5분전 / 10분전 까지, 그 이후는 '1시간전'
  // - 어제부터는 날짜(YYYY/MM/DD)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const now = new Date();

    const sameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    if (sameDay) {
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes <= 1) return "1분전";
      if (diffMinutes <= 5) return "5분전";
      if (diffMinutes <= 10) return "10분전";
      return "1시간전";
    }

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}/${m}/${d}`;
  };

  // 이미지 파일 처리
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 체크 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        alert("이미지 파일 크기는 10MB 이하여야 합니다.");
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
    }));
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 섹션 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">커뮤니티</h1>
            <p className="text-gray-600">다양한 이야기를 나누는 공간입니다</p>
          </div>

          {/* 검색창 */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="커뮤니티에서 검색하세요..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-20 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-400"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FiSearch size={20} />
                </div>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-4 py-1.5 rounded-full hover:bg-green-600 transition-colors text-sm"
                >
                  검색
                </button>
              </form>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currentCategory === category
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* 글쓰기 버튼 */}
          <div className="text-center mb-8">
            <button
              onClick={() => {
                // 로그인 상태 확인
                const memberInfo = getCookie("member");
                if (!memberInfo || !memberInfo.accessToken) {
                  alert("로그인이 필요합니다. 먼저 로그인해주세요.");
                  navigate("/member/login");
                  return;
                }

                setShowWriteForm(true);
                setEditingPost(null);
                setFormData({
                  title: "",
                  content: "",
                  category: "일반",
                  imageFile: null,
                  imagePreview: null,
                });
              }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-medium shadow-md"
            >
              <FiPlus size={18} />
              <span>글쓰기</span>
            </button>
          </div>

          {/* 메인 컨텐츠 영역 */}
          <div className="flex gap-8">
            {/* 왼쪽 사이드바 - 오늘의 추천 */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiTag className="mr-2 text-green-500" />
                  오늘의 추천
                </h3>

                {/* 오늘의 추천 가게 */}
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <div className="w-full h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-3 flex items-center justify-center">
                      {todayRecommendation ? (
                        <div className="text-center">
                          <div className="text-green-600 font-semibold text-lg mb-1">
                            {todayRecommendation.restaurantName}
                          </div>
                          <div className="text-green-500 text-sm">
                            {todayRecommendation.mentionCount}번 추천
                          </div>
                        </div>
                      ) : (
                        <span className="text-green-600 text-sm">
                          로딩 중...
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {todayRecommendation?.description ||
                        "커뮤니티에서 추천된 맛집을 확인해보세요!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 메인 컨텐츠 */}
            <div className="flex-1">
              {/* 게시글 목록 */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="bg-white rounded-lg p-8 shadow-md">
                    <div className="text-red-500 mb-4">
                      <FiMessageSquare size={48} className="mx-auto" />
                    </div>
                    <p className="text-lg text-red-500 mb-2 font-medium">
                      오류가 발생했습니다
                    </p>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={loadPosts}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      다시 시도
                    </button>
                  </div>
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/community/post/${post.id}`)}
                    >
                      {/* 게시글 헤더 */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 line-clamp-2">
                              {post.content}
                            </p>
                          </div>
                          {/* 작성자 전용 메뉴 */}
                          {currentNickname &&
                            post.author === currentNickname && (
                              <div
                                className="relative ml-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                                  onClick={(e) => {
                                    const menu = e.currentTarget.nextSibling;
                                    if (menu) menu.classList.toggle("hidden");
                                  }}
                                >
                                  <FiMoreVertical size={20} />
                                </button>
                                <div className="hidden absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                  <div className="py-1">
                                    <button
                                      type="button"
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      onClick={() => handleEditPost(post)}
                                    >
                                      수정
                                    </button>
                                    <button
                                      type="button"
                                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                      onClick={() => handleDeletePost(post.id)}
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>

                        {/* 이미지 */}
                        {post.imageUrl && (
                          <div className="mb-4">
                            <img
                              src={getImageUrl(post.imageUrl)}
                              alt="게시글 이미지"
                              className="w-full h-48 object-cover rounded-lg"
                              onError={(e) => {
                                console.error(
                                  "이미지 로드 실패:",
                                  post.imageUrl
                                );
                                console.error(
                                  "백엔드 URL:",
                                  getImageUrl(post.imageUrl)
                                );
                                e.target.style.display = "none";
                              }}
                              onLoad={() => {
                                console.log(
                                  "이미지 로드 성공:",
                                  getImageUrl(post.imageUrl)
                                );
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* 게시글 메타 정보 */}
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <FiUser className="mr-1" />
                              {post.author || "익명사용자"}
                            </span>
                            <span className="flex items-center">
                              <FiCalendar className="mr-1" />
                              {formatDate(post.createdAt)}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              {post.category}
                            </span>
                          </div>
                        </div>

                        {/* 통계 정보 및 액션 버튼들 */}
                        <div className="flex items-center justify-between">
                          {/* 왼쪽: 좋아요, 댓글, 조회수 */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {/* 좋아요 버튼 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!post.isLiked) {
                                  handleLikePost(post.id);
                                }
                              }}
                              disabled={post.isLiked}
                              className={`flex items-center gap-1 transition-colors ${
                                post.isLiked
                                  ? "text-red-500 cursor-not-allowed"
                                  : "text-gray-400 hover:text-red-500"
                              }`}
                            >
                              <FiHeart
                                size={16}
                                className={post.isLiked ? "fill-current" : ""}
                              />
                              <span className="font-medium">
                                {post.likes || 0}
                              </span>
                            </button>

                            {/* 댓글 수 */}
                            <span className="flex items-center gap-1">
                              <FiMessageSquare size={16} />
                              {post.commentCount || 0}
                            </span>

                            {/* 조회수 */}
                            <span className="flex items-center gap-1">
                              <FiEye size={16} />
                              {post.views || 0}
                            </span>
                          </div>

                          {/* 오른쪽: 공유, 북마크 */}
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-gray-400 hover:text-green-500 transition-colors">
                              <FiShare2 size={16} />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-green-500 transition-colors">
                              <FiBookmark size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="bg-white rounded-lg p-8 shadow-md">
                    <FiMessageSquare
                      size={48}
                      className="mx-auto mb-4 text-gray-300"
                    />
                    <p className="text-lg text-gray-500 mb-2">
                      게시글이 없습니다
                    </p>
                    <p className="text-gray-400">
                      첫 번째 게시글을 작성해보세요!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 글쓰기/수정 폼 모달 */}
        {showWriteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingPost ? "글 수정하기" : "새 글 작성하기"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowWriteForm(false);
                      setEditingPost(null);
                      setFormData({
                        title: "",
                        content: "",
                        category: "일반",
                        imageFile: null,
                        imagePreview: null,
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="일반">일반</option>
                      <option value="맛집추천">맛집추천</option>
                      <option value="후기">후기</option>
                      <option value="건강">건강</option>
                      <option value="질문">질문</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="제목을 입력하세요"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      내용
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="내용을 입력하세요"
                      rows="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이미지 업로드 (선택사항)
                    </label>

                    {/* 이미지 미리보기 */}
                    {formData.imagePreview && (
                      <div className="mb-3 relative">
                        <img
                          src={formData.imagePreview}
                          alt="이미지 미리보기"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    )}

                    {/* 파일 업로드 */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-center text-gray-700"
                      >
                        {formData.imageFile
                          ? formData.imageFile.name
                          : "이미지 선택"}
                      </label>
                      {formData.imageFile && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          제거
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      지원 형식: JPG, PNG, GIF (최대 10MB)
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSubmitPost}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 font-medium"
                    >
                      {loading
                        ? "처리중..."
                        : editingPost
                        ? "수정하기"
                        : "작성하기"}
                    </button>
                    <button
                      onClick={() => {
                        setShowWriteForm(false);
                        setEditingPost(null);
                        setFormData({
                          title: "",
                          content: "",
                          category: "일반",
                          imageFile: null,
                          imagePreview: null,
                        });
                      }}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CommunityPage;
