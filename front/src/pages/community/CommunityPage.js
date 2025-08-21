import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { communityApi } from "../../api/communityApi";
import { getCookie } from "../../utils/cookieUtil";
import { useAuth } from "../../context/AuthContext";

// 아이콘들
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
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";
import { SiKakaotalk } from "react-icons/si";

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

  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10; // 페이지당 게시글 수

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "일반",
    imageFile: null,
    imagePreview: null,
    address: "",
    restaurantName: "",
  });

  const categories = [
    "전체",
    "일반",
    "펀딩추천",
    "후기",
    "숨은 맛집추천",
    "질문",
  ];
  // 현재 로그인 사용자 닉네임 (작성자 판별용)
  const memberInfo = getCookie("member");
  const currentNickname =
    (memberInfo && (memberInfo.member?.nickname || memberInfo.nickname)) ||
    null;

  // 초기 데이터 로드
  useEffect(() => {
    loadPosts(0); // 첫 페이지부터 로드
    loadTodayRecommendation();
  }, []);

  // 오늘의 추천 데이터 로드
  const loadTodayRecommendation = async () => {
    try {
      const recommendation = await communityApi.getTodayRecommendation();
      setTodayRecommendation(recommendation);
    } catch (error) {
      console.error("오늘의 펀딩 로드 실패:", error);
      setTodayRecommendation({
        restaurantName: "추천 펀딩",
        mentionCount: 0,
        description: "커뮤니티에서 추천된 펀딩을 확인해보세요!",
        imageUrl: "/images/recommendation-placeholder.jpg",
      });
    }
  };

  // 게시글 목록 로드 (페이지네이션 적용)
  const loadPosts = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityApi.getPosts(
        page,
        pageSize, // 10개씩 가져오기
        "createdAt",
        "desc",
        userInfo?.email
      );

      // 페이지네이션 정보 설정
      if (response && response.content) {
        setPosts(response.content);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
        setCurrentPage(page);
      } else if (Array.isArray(response)) {
        setPosts(response);
        setTotalPages(1);
        setTotalElements(response.length);
        setCurrentPage(0);
      } else {
        console.warn("예상치 못한 응답 형태:", response);
        setPosts([]);
        setTotalPages(0);
        setTotalElements(0);
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("게시글 로드 실패:", error);
      setError(
        error?.response?.data?.message ||
          error.message ||
          "게시글을 불러오는데 실패했습니다."
      );
      setPosts([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      if (currentCategory === "전체") {
        loadPosts(newPage);
      } else {
        handleCategoryFilter(currentCategory, newPage);
      }
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

      // 목록 새로고침 (첫 페이지로)
      loadPosts(0);
      setCurrentPage(0);
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

        // 현재 페이지에서 게시글이 하나만 남았고, 첫 페이지가 아닌 경우 이전 페이지로
        const remainingPosts = posts.filter((post) => post.id !== postId);
        if (remainingPosts.length === 0 && currentPage > 0) {
          handlePageChange(currentPage - 1);
        } else {
          // 현재 페이지 새로고침
          if (currentCategory === "전체") {
            loadPosts(currentPage);
          } else {
            handleCategoryFilter(currentCategory, currentPage);
          }
        }

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

  // 게시글 공유
  const handleSharePost = async (post) => {
    console.log("공유 시작:", post);

    if (!post || !post.id) {
      console.error("유효하지 않은 게시글 데이터:", post);
      alert("공유할 수 없는 게시글입니다.");
      return;
    }

    const shareUrl = `${window.location.origin}/community/post/${post.id}`;
    const shareText =
      post.content && post.content.length > 100
        ? post.content.substring(0, 100) + "..."
        : post.content || "흥미로운 게시글을 확인해보세요!";

    console.log("공유 URL:", shareUrl);
    console.log("공유 텍스트:", shareText);

    try {
      // 1. Web Share API 시도 (모바일에서 네이티브 공유)
      // localhost 환경에서는 Web Share API가 불안정하므로 클립보드 복사 우선
      if (navigator.share && !window.location.hostname.includes("localhost")) {
        console.log("Web Share API 사용 시도...");
        try {
          const shareResult = await navigator.share({
            title: post.title || "커뮤니티 게시글",
            text: shareText,
            url: shareUrl,
          });
          console.log("Web Share API 공유 성공:", shareResult);
          return;
        } catch (shareError) {
          console.log("Web Share API 실패, 클립보드 복사로 전환:", shareError);
          // Web Share API 실패 시 자동으로 클립보드 복사로 진행
        }
      } else {
        console.log(
          "Web Share API 미지원 또는 localhost 환경, 클립보드 복사로 진행"
        );
      }

      // 2. 클립보드 복사 시도
      console.log("클립보드 복사 시도...");

      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          console.log("클립보드 복사 성공!");

          // 컴퓨터에서 공유할 때는 링크를 직접 보여주기
          const shareMessage = `🔗 공유 링크가 클립보드에 복사되었습니다!\n\n📋 링크: ${shareUrl}\n\n이제 다른 곳에 붙여넣기(Ctrl+V)할 수 있습니다.`;
          alert(shareMessage);
          return;
        } catch (clipboardError) {
          console.log(
            "navigator.clipboard 실패, fallback 사용:",
            clipboardError
          );
        }
      }

      // 3. Fallback: document.execCommand 사용
      console.log("document.execCommand fallback 사용...");
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        console.log("document.execCommand 복사 성공!");

        // 컴퓨터에서 공유할 때는 링크를 직접 보여주기
        const shareMessage = `🔗 공유 링크가 클립보드에 복사되었습니다!\n\n📋 링크: ${shareUrl}\n\n이제 다른 곳에 붙여넣기(Ctrl+V)할 수 있습니다.`;
        alert(shareMessage);
      } else {
        throw new Error("document.execCommand 실패");
      }
    } catch (error) {
      console.error("모든 공유 방법 실패:", error);

      // 4. 최종 fallback: 사용자에게 링크 직접 표시
      const finalMessage = `📋 공유 링크:\n${shareUrl}\n\n링크를 복사하여 공유해주세요.`;
      alert(finalMessage);
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

      // 게시글 목록 업데이트 (백엔드에서 받은 isLiked 상태 사용)
      setPosts(posts.map((post) => (post.id === postId ? updatedPost : post)));

      // 선택된 게시글도 업데이트
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(updatedPost);
      }

      console.log("좋아요 성공:", updatedPost);
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

  // 소셜미디어 공유 함수들
  const shareToKakaoTalk = (post) => {
    const shareUrl = `${window.location.origin}/community/post/${post.id}`;
    const shareText = post.title || "커뮤니티 게시글";

    // 카카오톡 공유 URL (카카오톡 앱이 설치되어 있어야 함)
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(kakaoUrl, "_blank");
  };

  const shareToInstagram = (post) => {
    const shareUrl = `${window.location.origin}/community/post/${post.id}`;
    const shareText = post.title || "커뮤니티 게시글";

    // 인스타그램은 링크 공유가 제한적이므로 클립보드에 복사
    const instagramText = `${shareText}\n\n${shareUrl}`;
    navigator.clipboard
      .writeText(instagramText)
      .then(() => {
        alert(
          "📸 인스타그램 공유용 텍스트가 클립보드에 복사되었습니다!\n\n인스타그램 앱에서 붙여넣기(Ctrl+V)하여 공유해주세요."
        );
      })
      .catch(() => {
        alert(
          `📸 인스타그램 공유용 텍스트:\n\n${instagramText}\n\n위 텍스트를 복사하여 인스타그램에 공유해주세요.`
        );
      });
  };

  const shareToFacebook = (post) => {
    const shareUrl = `${window.location.origin}/community/post/${post.id}`;
    const shareText = post.title || "커뮤니티 게시글";

    // 페이스북 공유 URL
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const shareToTwitter = (post) => {
    const shareUrl = `${window.location.origin}/community/post/${post.id}`;
    const shareText = post.title || "커뮤니티 게시글";

    // 트위터 공유 URL
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
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

  // 검색 (페이지네이션 적용)
  const handleSearch = async (page = 0) => {
    if (!searchTerm.trim()) {
      loadPosts(page);
      return;
    }

    try {
      setLoading(true);
      const response = await communityApi.searchPosts(
        searchTerm,
        page,
        pageSize
      );

      if (response && response.content) {
        setPosts(response.content);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
        setCurrentPage(page);
      } else {
        setPosts(response || []);
        setTotalPages(1);
        setTotalElements((response || []).length);
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("검색 실패:", error);
      setPosts([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 필터 (페이지네이션 적용)
  const handleCategoryFilter = async (category, page = 0) => {
    setCurrentCategory(category);
    setCurrentPage(0); // 카테고리 변경 시 첫 페이지로

    if (category === "전체") {
      loadPosts(page);
      return;
    }

    try {
      setLoading(true);
      const response = await communityApi.getPostsByCategory(
        category,
        page,
        pageSize
      );

      if (response && response.content) {
        setPosts(response.content);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
        setCurrentPage(page);
      } else {
        setPosts(response || []);
        setTotalPages(1);
        setTotalElements((response || []).length);
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("카테고리 필터 실패:", error);
      setPosts([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷팅 (요청사항)
  // - 1~59분: n분전
  // - 1~23시간: n시간전
  // - 그 이후: n일전
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // 1분 미만
    if (diffMinutes < 1) {
      return "방금전";
    }
    // 1~59분
    else if (diffMinutes < 60) {
      return `${diffMinutes}분전`;
    }
    // 1~23시간
    else if (diffHours < 24) {
      return `${diffHours}시간전`;
    }
    // 1일 이상
    else {
      return `${diffDays}일전`;
    }
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
      <div className="min-h-screen bg-white">
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
                  handleSearch(0); // 검색 시 첫 페이지부터
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

          {/* ✔ 글쓰기 버튼: 페이지 전체 기준 중앙 */}
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => {
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
                  address: "",
                  restaurantName: "",
                });
              }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-medium shadow-md"
            >
              <FiPlus size={18} />
              <span>글쓰기</span>
            </button>
          </div>

          {/* 오늘의 추천 섹션 */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 🔥 오늘의 펀딩 */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-[300px] flex flex-col">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h3 className="text-lg font-bold flex items-center text-gray-800">
                    <FiTag className="mr-2 text-green-500" />
                    🔥 오늘의 펀딩
                  </h3>
                  <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    HOT
                  </div>
                </div>

                {/* 인기 펀딩 게시물 */}
                <div className="flex-1 mb-4 overflow-hidden">
                  {posts
                    .filter((post) => post.category === "펀딩추천")
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 1)
                    .map((post, index) => (
                      <div
                        key={post.id}
                        className="bg-gray-50 border border-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-all duration-200 h-full flex flex-col"
                        onClick={() => navigate(`/community/post/${post.id}`)}
                      >
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              👑
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <h4 className="text-gray-800 font-semibold text-sm mb-2 leading-tight">
                              {post.title.length > 30
                                ? post.title.substring(0, 30) + "..."
                                : post.title}
                            </h4>
                            <p className="text-gray-600 text-xs mb-3 leading-relaxed flex-1">
                              {post.content.length > 70
                                ? post.content.substring(0, 70) + "..."
                                : post.content}
                            </p>
                            <div className="flex items-center justify-between text-xs mt-auto">
                              <span className="text-green-600 font-medium">
                                ❤️ {post.likes || 0}
                              </span>
                              <span className="text-gray-500">
                                👁️ {post.views || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* 더보기 버튼 */}
                <button
                  onClick={() => handleCategoryFilter("펀딩추천")}
                  className="w-full bg-green-500 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm flex-shrink-0"
                >
                  더 많은 펀딩 보기 →
                </button>
              </div>

              {/* 🍜 오늘의 숨은 맛집 */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-[300px] flex flex-col">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h3 className="text-lg font-bold flex items-center text-gray-800">
                    <FiTag className="mr-2 text-orange-500" />
                    🍜 오늘의 숨은 맛집
                  </h3>
                  <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    BEST
                  </div>
                </div>

                {/* 인기 숨은 맛집 게시물 */}
                <div className="flex-1 mb-4 overflow-hidden">
                  {posts
                    .filter((post) => post.category === "숨은 맛집추천")
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 1)
                    .map((post, index) => (
                      <div
                        key={post.id}
                        className="bg-orange-50 border border-orange-100 rounded-lg p-4 cursor-pointer hover:bg-orange-100 transition-all duration-200 h-full flex flex-col"
                        onClick={() => navigate(`/community/post/${post.id}`)}
                      >
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              👑
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <h4 className="text-gray-800 font-semibold text-sm mb-2 leading-tight">
                              {post.title.length > 30
                                ? post.title.substring(0, 30) + "..."
                                : post.title}
                            </h4>
                            <p className="text-gray-600 text-xs mb-2 leading-relaxed">
                              {post.content.length > 50
                                ? post.content.substring(0, 50) + "..."
                                : post.content}
                            </p>
                            <div className="space-y-1 mb-3 flex-1">
                              {post.restaurantName && (
                                <div className="text-orange-600 text-xs font-medium">
                                  🏪{" "}
                                  {post.restaurantName.length > 20
                                    ? post.restaurantName.substring(0, 20) +
                                      "..."
                                    : post.restaurantName}
                                </div>
                              )}
                              {post.address && (
                                <div className="text-gray-500 text-xs">
                                  📍{" "}
                                  {post.address.length > 25
                                    ? post.address.substring(0, 25) + "..."
                                    : post.address}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-xs mt-auto">
                              <span className="text-orange-600 font-medium">
                                ❤️ {post.likes || 0}
                              </span>
                              <span className="text-gray-500">
                                👁️ {post.views || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* 더보기 버튼 */}
                <button
                  onClick={() => handleCategoryFilter("숨은 맛집추천")}
                  className="w-full bg-orange-500 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200 text-sm flex-shrink-0"
                >
                  더 많은 숨은 맛집 보기 →
                </button>
              </div>
            </div>
          </div>

          {/* ▼ 게시글 리스트 - 페이지 전체 기준 중앙 */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-lg p-8 shadow-md max-w-4xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto mb-12">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden h-[400px] flex flex-col"
                  onClick={() => navigate(`/community/post/${post.id}`)}
                >
                  {/* 게시글 헤더 - 고정 높이 */}
                  <div className="p-3 border-b border-gray-100 flex-shrink-0">
                    <div className="relative mb-2">
                      <div className="h-[80px] overflow-hidden">
                        <h3 className="text-base font-semibold text-gray-900 mb-1 hover:text-green-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {post.content}
                        </p>
                      </div>
                      {/* 작성자 전용 메뉴 */}
                      {currentNickname && post.author === currentNickname && (
                        <div
                          className="absolute top-0 right-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                            onClick={(e) => {
                              const menu = e.currentTarget.nextSibling;
                              if (menu) menu.classList.toggle("hidden");
                            }}
                          >
                            <FiMoreVertical size={16} />
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

                    {/* 이미지 - 고정 높이 영역 */}
                    <div className="h-[180px] mb-3 flex-shrink-0">
                      {post.imageUrl ? (
                        <img
                          src={getImageUrl(post.imageUrl)}
                          alt="게시글 이미지"
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            console.error("이미지 로드 실패:", post.imageUrl);
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
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            이미지 없음
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 게시글 메타 정보 - 하단 고정 */}
                  <div className="px-3 py-2 bg-gray-50 mt-auto flex-shrink-0">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center">
                          <FiUser className="mr-1" size={10} />
                          {post.author || "익명사용자"}
                        </span>
                        <span className="flex items-center">
                          <FiCalendar className="mr-1" size={10} />
                          {formatDate(post.createdAt)}
                        </span>
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* 통계 정보 및 액션 버튼들 */}
                    <div className="flex items-center justify-between">
                      {/* 왼쪽: 좋아요, 댓글, 조회수 */}
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {/* 좋아요 버튼 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikePost(post.id);
                          }}
                          className={`flex items-center gap-1 transition-colors ${
                            post.isLiked
                              ? "text-red-500 hover:text-red-600"
                              : "text-gray-400 hover:text-red-500"
                          }`}
                          title={post.isLiked ? "좋아요 취소" : "좋아요"}
                        >
                          <FiHeart
                            size={12}
                            className={post.isLiked ? "fill-current" : ""}
                          />
                          <span className="font-medium">{post.likes || 0}</span>
                        </button>

                        {/* 댓글 수 */}
                        <span className="flex items-center gap-1">
                          <FiMessageSquare size={12} />
                          {post.commentCount || 0}
                        </span>

                        {/* 조회수 */}
                        <span className="flex items-center gap-1">
                          <FiEye size={12} />
                          {post.views || 0}
                        </span>
                      </div>

                      {/* 오른쪽: 공유, 북마크 */}
                      <div className="flex items-center gap-1">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const button = e.currentTarget;
                              const rect = button.getBoundingClientRect();
                              const menu = button.nextSibling;

                              if (menu) {
                                // 현재 메뉴가 보이는 상태라면 숨기기
                                if (!menu.classList.contains("hidden")) {
                                  menu.classList.add("hidden");
                                  console.log("공유 메뉴 숨김");
                                  return;
                                }

                                // 모든 다른 메뉴를 숨기기
                                document
                                  .querySelectorAll(".share-menu")
                                  .forEach((m) => m.classList.add("hidden"));

                                // 메뉴를 버튼 위치에 고정 (스크롤과 무관)
                                menu.style.top = rect.bottom + 5 + "px";
                                menu.style.left = rect.left + "px";

                                // 현재 메뉴 표시
                                menu.classList.remove("hidden");
                                console.log("공유 메뉴 표시");
                              }
                            }}
                            className="p-0.5 text-gray-400 hover:text-green-500 transition-colors"
                            title="게시글 공유"
                          >
                            <FiShare2 size={12} />
                          </button>
                          {/* 소셜미디어 공유 메뉴 */}
                          <div className="share-menu hidden fixed w-48 rounded-md bg-white shadow-2xl ring-2 ring-black ring-opacity-20 z-[99999] border-2 border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  shareToKakaoTalk(post);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 transition-colors"
                              >
                                <SiKakaotalk
                                  className="mr-2 text-yellow-400"
                                  size={16}
                                />
                                카카오톡으로 공유
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  shareToInstagram(post);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 transition-colors"
                              >
                                <FaInstagram
                                  className="mr-2 text-pink-500"
                                  size={16}
                                />
                                인스타그램으로 공유
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  shareToFacebook(post);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                              >
                                <FaFacebook
                                  className="mr-2 text-blue-600"
                                  size={16}
                                />
                                페이스북으로 공유
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  shareToTwitter(post);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                              >
                                <FaTwitter
                                  className="mr-2 text-blue-400"
                                  size={16}
                                />
                                트위터로 공유
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSharePost(post);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <FiShare2
                                  className="mr-2 text-gray-500"
                                  size={16}
                                />
                                링크 복사
                              </button>
                            </div>
                          </div>
                        </div>
                        <button className="p-0.5 text-gray-400 hover:text-green-500 transition-colors">
                          <FiBookmark size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-lg p-6 shadow-sm max-w-3xl mx-auto border border-gray-100">
                <FiMessageSquare
                  size={40}
                  className="mx-auto mb-3 text-gray-300"
                />
                <p className="text-base text-gray-500 mb-2">
                  게시글이 없습니다
                </p>
                <p className="text-sm text-gray-400">
                  첫 번째 게시글을 작성해보세요!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center space-x-2">
              {/* 이전 페이지 버튼 */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft size={16} className="mr-1" />
                이전
              </button>

              {/* 페이지 번호들 */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === pageNum
                          ? "bg-green-500 text-white"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              {/* 다음 페이지 버튼 */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
                <FiChevronRight size={16} className="ml-1" />
              </button>
            </div>

            {/* 페이지 정보 */}
            <div className="ml-4 text-sm text-gray-500">
              총 {totalElements}개 게시글
            </div>
          </div>
        )}

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
                        address: "",
                        restaurantName: "",
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
                      <option value="펀딩추천">펀딩추천</option>
                      <option value="후기">후기</option>
                      <option value="숨은 맛집추천">숨은 맛집추천</option>
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

                  {/* 숨은 맛집추천 카테고리 선택 시 추가 필드 */}
                  {formData.category === "숨은 맛집추천" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          가게 이름
                        </label>
                        <input
                          type="text"
                          value={formData.restaurantName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              restaurantName: e.target.value,
                            })
                          }
                          placeholder="가게 이름을 입력하세요"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          주소
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          placeholder="가게 주소를 입력하세요"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </>
                  )}

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
                          address: "",
                          restaurantName: "",
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
