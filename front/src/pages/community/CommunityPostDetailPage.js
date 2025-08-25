import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { communityApi } from "../../api/communityApi";
import { useAuth } from "../../context/AuthContext";

import {
  FiArrowLeft,
  FiHeart,
  FiMessageSquare,
  FiEye,
  FiEdit,
  FiTrash2,
  FiShare2,
  FiBookmark,
  FiUser,
  FiCalendar,
  FiTag,
  FiMoreVertical,
} from "react-icons/fi";

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
  const getCurrentUserEmail = () =>
    currentUser?.email || currentUser?.username || "";

  useEffect(() => {
    loadPost();
    loadComments();
    // TODO: 실제 사용자 정보 로드
    setCurrentUser({ id: 1, username: "테스트사용자" });
  }, [postId]);

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

      const updatedPost = await communityApi.toggleLike(postId, userEmail);
      setPost(updatedPost);
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
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
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
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
      <div className="min-h-screen bg-gray-50">
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
                    <span className="font-medium">{post.likes || 0}</span>
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
                  <button className="p-2 text-gray-400 hover:text-green-500 transition-colors rounded-full hover:bg-green-50">
                    <FiShare2 size={18} />
                  </button>
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
