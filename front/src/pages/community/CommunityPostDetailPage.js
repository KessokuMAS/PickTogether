import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { communityApi } from "../../api/communityApi";
import { useAuth } from "../../context/AuthContext";

// 아이콘들
import {
  FiArrowLeft,
  FiHeart,
  FiMessageSquare,
  FiEye,
  FiShare2,
  FiBookmark,
  FiUser,
  FiCalendar,
  FiTag,
  FiMoreVertical,
} from "react-icons/fi";

import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";
import { SiKakaotalk } from "react-icons/si";

const CommunityPostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

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

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [shareMenuPosition, setShareMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  // 사용자가 좋아요를 누른 게시글 ID들을 저장 (로컬 상태)
  const [likedPosts, setLikedPosts] = useState(new Set());

  const shareMenuRef = useRef(null);
  const shareButtonRef = useRef(null);

  // 공유 메뉴 위치를 버튼 위치에 맞게 계산해 갱신
  const updateShareMenuPosition = useCallback(() => {
    const buttonEl = shareButtonRef.current;
    if (!buttonEl) return;

    const rect = buttonEl.getBoundingClientRect();
    const MENU_WIDTH = 192; // w-48
    const PADDING = 8;
    const menuEl = shareMenuRef.current;
    const menuHeight = menuEl ? menuEl.offsetHeight : 0;

    let left = Math.min(rect.left, window.innerWidth - MENU_WIDTH - PADDING);
    let top = rect.bottom + PADDING; // 기본적으로 버튼 아래

    if (menuHeight && top + menuHeight > window.innerHeight - PADDING) {
      // 아래 공간이 부족하면 위쪽에 배치
      top = Math.max(PADDING, rect.top - menuHeight - PADDING);
    }

    setShareMenuPosition({ top, left });
  }, []);

  const getCurrentUserEmail = () =>
    currentUser?.email || currentUser?.username || "";

  // 통합된 useEffect: 게시글 로드, 댓글 로드, 조회수 증가를 한 번에 처리
  useEffect(() => {
    const currentPostId = parseInt(postId);

    // React Strict Mode 이중 실행 방지를 위한 플래그
    let isInitialized = false;

    // 1. 게시글과 댓글 로드
    const loadData = async () => {
      await loadPost();
      await loadComments();
    };

    // 2. 조회수 증가 처리 (세션 스토리지 제거 - 매번 증가)
    const handleViewIncrement = async () => {
      // 이미 처리되었는지 확인 (React Strict Mode 방지)
      if (isInitialized) {
        console.log(
          `조회수 증가 스킵: 이미 초기화됨 (게시글 ${currentPostId})`
        );
        return;
      }

      console.log(`조회수 증가 시작: 게시글 ${currentPostId}`);

      // 조회수 증가 실행 (백엔드 + 로컬)
      await incrementViewCount();

      // 초기화 완료 표시
      isInitialized = true;
    };

    // 3. 순차적으로 실행
    const initializePage = async () => {
      // 먼저 조회수 증가 처리 (async 함수이므로 await 필요)
      await handleViewIncrement();

      // 그 다음 데이터 로드
      await loadData();

      // 사용자 정보 설정
      setCurrentUser({ id: 1, username: "테스트사용자" });
    };

    initializePage();

    // Cleanup 함수: 컴포넌트 언마운트 시 정리
    return () => {
      isInitialized = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]); // postId가 변경될 때만 실행

  // 공유 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isShareMenuOpen) return;
      const menuEl = shareMenuRef.current;
      const buttonEl = shareButtonRef.current;
      if (
        menuEl &&
        !menuEl.contains(event.target) &&
        buttonEl &&
        !buttonEl.contains(event.target)
      ) {
        setIsShareMenuOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside, true);
    return () => window.removeEventListener("click", handleClickOutside, true);
  }, [isShareMenuOpen]);

  // 메뉴가 열려있는 동안 스크롤/리사이즈 시 위치 재계산
  useEffect(() => {
    if (!isShareMenuOpen) return;

    // 처음 열릴 때 한 번 계산
    updateShareMenuPosition();

    const handleScroll = () => updateShareMenuPosition();
    const handleResize = () => updateShareMenuPosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isShareMenuOpen, updateShareMenuPosition]);

  const loadPost = async () => {
    setIsLoading(true);
    try {
      // 현재 로그인된 사용자 이메일 가져오기
      const userEmail = userInfo?.email;
      const response = await communityApi.getPost(postId, userEmail);
      setPost(response);
    } catch (error) {
      console.error("게시글 로드 실패:", error);
      // 임시 데이터로 대체
      setPost({
        id: parseInt(postId),
        title: "커뮤니티 게시글 제목",
        content: `안녕하세요! 커뮤니티에 글을 남깁니다.

오늘은 맛있는 음식에 대해 이야기하고 싶어요. 
특히 최근에 방문한 맛집이나 추천하고 싶은 메뉴가 있다면 
함께 공유해보는 건 어떨까요?

맛집 정보, 요리 팁, 음식 후기 등 
다양한 이야기를 나눌 수 있는 공간이 되었으면 좋겠습니다.

여러분의 소중한 경험과 정보를 기다리고 있어요! 😊`,
        author: "커뮤니티맨",
        authorId: 1,
        category: "일반",
        createdAt: "2024-01-15T10:30:00",
        viewCount: 25,
        likes: 8,
        commentCount: 3,
        imageUrl: "",
        tags: ["맛집", "커뮤니티", "음식"],
        isLiked: false, // 임시 데이터에도 isLiked 추가
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 조회수 증가 함수 (백엔드 + 로컬 동기화)
  const incrementViewCount = async () => {
    try {
      const currentPostId = parseInt(postId);

      // 먼저 로컬 상태 업데이트 (사용자 경험 향상)
      setPost((prev) => {
        if (!prev) return null;

        // 현재 조회수 확인
        const currentViews = prev.views || 0;
        console.log(`조회수 업데이트: ${currentViews} → ${currentViews + 1}`);

        return { ...prev, views: currentViews + 1 };
      });

      console.log(`조회수 증가 완료 (로컬): 게시글 ${currentPostId}`);

      // 백엔드 API 호출 시도 (실패해도 로컬은 업데이트됨)
      try {
        await communityApi.incrementViews(currentPostId);
        console.log(`조회수 증가 백엔드 성공: 게시글 ${currentPostId}`);
      } catch (backendError) {
        console.warn(
          `백엔드 조회수 증가 실패 (로컬은 업데이트됨):`,
          backendError
        );
        // 백엔드 실패해도 로컬 상태는 이미 업데이트됨
      }
    } catch (error) {
      console.error("조회수 증가 처리 실패:", error);
    }
  };

  const loadComments = async () => {
    try {
      const list = await communityApi.getComments(postId);
      setComments(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("댓글 로드 실패:", error);
    }
  };

  const handleLike = async () => {
    try {
      // 현재 로그인된 사용자 이메일 가져오기
      const userEmail = userInfo?.email;
      if (!userEmail) {
        alert("로그인이 필요합니다. 로그인 후 이용해 주세요.");
        navigate("/member/login");
        return;
      }

      console.log("좋아요 버튼 클릭:", postId);
      console.log("현재 likedPosts:", Array.from(likedPosts));
      console.log(
        "이 게시글에 좋아요를 눌렀나요?",
        likedPosts.has(parseInt(postId))
      );

      // 로컬 상태 즉시 업데이트 (즉시 반응)
      if (likedPosts.has(parseInt(postId))) {
        // 좋아요 취소
        console.log("좋아요 취소 처리");
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(parseInt(postId));
          console.log("새로운 likedPosts (취소 후):", Array.from(newSet));
          return newSet;
        });

        // 게시글의 좋아요 수 감소
        setPost((prev) => ({
          ...prev,
          likes: Math.max(0, (prev.likes || 1) - 1),
        }));
      } else {
        // 좋아요 추가
        console.log("좋아요 추가 처리");
        setLikedPosts((prev) => {
          const newSet = new Set([...prev, parseInt(postId)]);
          console.log("새로운 likedPosts (추가 후):", Array.from(newSet));
          return newSet;
        });

        // 게시글의 좋아요 수 증가
        setPost((prev) => ({
          ...prev,
          likes: (prev.likes || 0) + 1,
        }));
      }

      // 백엔드 API 호출 (백그라운드에서 처리)
      try {
        await communityApi.toggleLike(postId, userEmail);
        console.log("좋아요 백엔드 처리 성공");
      } catch (error) {
        console.error("백엔드 좋아요 처리 실패:", error);
        // 백엔드 실패 시에도 프론트엔드는 유지 (사용자 경험 향상)
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      alert("좋아요 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const saved = await communityApi.addComment(postId, {
        content: newComment,
        author: currentUser?.username || "익명",
        authorEmail: getCurrentUserEmail(),
      });
      setComments((prev) => [saved, ...prev]);
      setPost((prev) => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1,
      }));
      setNewComment("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await communityApi.deleteComment(
        postId,
        commentId,
        getCurrentUserEmail()
      );
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setPost((prev) => ({
        ...prev,
        commentCount: (prev.commentCount || 1) - 1,
      }));
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  const handleEditPost = () => {
    navigate(`/community/write?edit=${postId}`);
  };

  const handleDeletePost = async () => {
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;

    try {
      await communityApi.deletePost(postId);
      alert("게시글이 삭제되었습니다.");
      navigate("/community");
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  // 게시글 공유
  const handleSharePost = async () => {
    if (!post) {
      console.log("post 데이터가 없습니다.");
      return;
    }

    console.log("공유 시작:", post);

    const shareUrl = window.location.href;
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

  // 소셜미디어 공유 함수들
  const shareToKakaoTalk = () => {
    if (!post) return;

    const shareUrl = window.location.href;
    const shareText = post.title || "커뮤니티 게시글";

    // 카카오톡 공유 URL (카카오톡 앱이 설치되어 있어야 함)
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(kakaoUrl, "_blank");
  };

  const shareToInstagram = () => {
    if (!post) return;

    const shareUrl = window.location.href;
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

  const shareToFacebook = () => {
    if (!post) return;

    const shareUrl = window.location.href;
    const shareText = post.title || "커뮤니티 게시글";

    // 페이스북 공유 URL
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const shareToTwitter = () => {
    if (!post) return;

    const shareUrl = window.location.href;
    const shareText = post.title || "커뮤니티 게시글";

    // 트위터 공유 URL
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  // 날짜 포맷팅 (요청사항)
  // - 오늘: 1분전 / 5분전 / 10분전 / 이후는 1시간전
  // - 어제부터는 YYYY/MM/DD
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex justify-center items-center">
          <div className="text-center">
            <p className="text-xl text-gray-500">게시글을 찾을 수 없습니다.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isAuthor = currentUser && post.authorId === currentUser.id;

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/community")}
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors bg-white px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm"
            >
              <FiArrowLeft size={20} />
              <span>목록으로 돌아가기</span>
            </button>

            {/* 게시글 관리 메뉴 (작성자인 경우만) */}
            {isAuthor && (
              <div className="relative">
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
                      onClick={handleEditPost}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      수정
                    </button>
                    <button
                      onClick={handleDeletePost}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 게시글 내용 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            {/* 게시글 헤더 */}
            <div className="p-6 border-b border-gray-100">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <FiTag className="mr-1" />
                  {post.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* 이미지 */}
            {post.imageUrl && (
              <div className="p-6 pt-0">
                <img
                  src={getImageUrl(post.imageUrl)}
                  alt="게시글 이미지"
                  className="w-full max-h-96 object-cover rounded-lg"
                  onError={(e) => {
                    console.error("이미지 로드 실패:", post.imageUrl);
                    console.error("백엔드 URL:", getImageUrl(post.imageUrl));
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* 게시글 메타 정보 */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <FiUser className="mr-1" />
                    {post.author}
                  </span>
                  <span className="flex items-center">
                    <FiCalendar className="mr-1" />
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>

              {/* 통계 및 액션 */}
              <div className="flex items-center justify-between">
                {/* 왼쪽: 좋아요, 댓글, 조회수 */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {/* 좋아요 버튼 */}
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 transition-all duration-200 ${
                      likedPosts.has(parseInt(postId))
                        ? "text-red-500 hover:text-red-600 scale-105"
                        : "text-gray-400 hover:text-red-500 hover:scale-105"
                    }`}
                  >
                    <FiHeart
                      size={16}
                      className={`transition-all duration-200 ${
                        likedPosts.has(parseInt(postId))
                          ? "fill-current text-red-500"
                          : "hover:scale-110"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        likedPosts.has(parseInt(postId))
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
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

                {/* 오른쪽 끝: 공유, 북마크 */}
                <div className="flex items-center gap-3">
                  <div>
                    <button
                      ref={shareButtonRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const MENU_WIDTH = 192; // w-48
                        const PADDING = 8;
                        const left = Math.min(
                          rect.left,
                          window.innerWidth - MENU_WIDTH - PADDING
                        );
                        const top = rect.bottom + PADDING;
                        setShareMenuPosition({ top, left });
                        setIsShareMenuOpen((prev) => !prev);
                      }}
                      className="p-2 text-gray-400 hover:text-green-500 transition-colors rounded-full hover:bg-green-50"
                      title="게시글 공유"
                    >
                      <FiShare2 size={18} />
                    </button>
                    {isShareMenuOpen && (
                      <div
                        ref={shareMenuRef}
                        className="fixed z-[99999] w-48 rounded-md bg-white shadow-2xl ring-2 ring-black ring-opacity-20 border-2 border-gray-200"
                        style={{
                          top: shareMenuPosition.top,
                          left: shareMenuPosition.left,
                        }}
                      >
                        <div className="py-1">
                          <button
                            onClick={() => {
                              shareToKakaoTalk();
                              setIsShareMenuOpen(false);
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
                            onClick={() => {
                              shareToInstagram();
                              setIsShareMenuOpen(false);
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
                            onClick={() => {
                              shareToFacebook();
                              setIsShareMenuOpen(false);
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
                            onClick={() => {
                              shareToTwitter();
                              setIsShareMenuOpen(false);
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
                            onClick={() => {
                              handleSharePost();
                              setIsShareMenuOpen(false);
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
                    )}
                  </div>
                  <button className="p-2 text-gray-400 hover:text-green-500 transition-colors rounded-full hover:bg-green-50">
                    <FiBookmark size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FiMessageSquare className="text-green-500" />
              댓글 ({post.commentCount}개)
            </h3>

            {/* 댓글 작성 */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                  <FiUser size={18} />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 작성하세요..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-400 resize-none"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {newComment.length}/500
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingComment ? "작성 중..." : "댓글 작성"}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* 댓글 목록 */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <FiMessageSquare
                    size={32}
                    className="mx-auto mb-2 text-gray-300"
                  />
                  <p className="text-gray-500">아직 댓글이 없습니다</p>
                  <p className="text-gray-400 text-sm">
                    첫 번째 댓글을 작성해보세요!
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-100 pb-4 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">
                        <FiUser size={16} />
                      </div>
                      <div className="flex-1">
                        {/* 상단: 작성자/시간 + 우측 메뉴 */}
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 text-sm">
                              {comment.author}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                          {currentUser && (
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                className="p-1 rounded hover:bg-gray-100 text-gray-400"
                                onClick={(e) => {
                                  const menu = e.currentTarget.nextSibling;
                                  if (menu) menu.classList.toggle("hidden");
                                }}
                              >
                                <FiMoreVertical size={16} />
                              </button>
                              <div className="hidden absolute right-0 mt-2 w-28 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1">
                                  {/* 수정 */}
                                  <button
                                    className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                    onClick={() =>
                                      alert("댓글 수정 기능은 곧 연결됩니다.")
                                    }
                                  >
                                    수정
                                  </button>
                                  {/* 삭제: 작성자만 */}
                                  {(comment.authorId === currentUser.id ||
                                    comment.authorEmail ===
                                      getCurrentUserEmail()) && (
                                    <button
                                      className="block w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                                      onClick={() =>
                                        handleDeleteComment(comment.id)
                                      }
                                    >
                                      삭제
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 본문 */}
                        <p className="text-gray-800 text-sm">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CommunityPostDetailPage;
