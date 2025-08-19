import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  FiArrowLeft,
  FiHeart,
  FiMessageSquare,
  FiEye,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiShare2,
  FiBookmark,
} from "react-icons/fi";
import { boardApi, commentApi } from "../../api/boardApi";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // 임시 게시글 데이터 (백엔드 연결 전)
  const mockPost = {
    id: parseInt(postId),
    title: "오늘 점심 메뉴 추천해주세요!",
    content: `안녕하세요! 오늘 점심 메뉴로 뭘 먹을지 고민 중입니다.

근처에 맛있는 점심집이 있을까요? 특히 한식이나 분식류를 선호하는데, 가성비도 좋고 맛있는 곳을 추천해주세요.

신촌역 근처라면 더 좋겠고, 혹시 혼자 먹기 좋은 곳이 있다면 그런 곳도 알려주세요.

오늘 날씨가 좋아서 밖에서 먹고 싶은데, 테이크아웃도 가능한 곳이면 더 좋겠어요.

추천해주시는 분들께 감사드립니다! 😊`,
    author: "맛집탐험가",
    authorAvatar: "🍜",
    category: "question",
    createdAt: "2시간 전",
    viewCount: 45,
    likeCount: 12,
    commentCount: 8,
    isLiked: false,
    isAuthor: false, // TODO: 실제 사용자 정보와 비교
    tags: ["맛집", "점심", "추천", "신촌"],
  };

  const mockComments = [
    {
      id: 1,
      content: "신촌역 1번 출구 근처에 김밥천국이 있어요! 가성비 최고입니다.",
      author: "맛집러버",
      authorAvatar: "🍽️",
      createdAt: "1시간 전",
      isAuthor: false,
      likeCount: 3,
    },
    {
      id: 2,
      content:
        "홍대입구역 근처에 맛있는 분식집이 많아요. 특히 '맛있는분식' 추천합니다.",
      author: "분식마스터",
      authorAvatar: "🥘",
      createdAt: "30분 전",
      isAuthor: false,
      likeCount: 5,
    },
    {
      id: 3,
      content: "신촌 치킨거리도 좋아요! 혼자 먹기 좋은 치킨집들이 많습니다.",
      author: "치킨러버",
      authorAvatar: "🍗",
      createdAt: "15분 전",
      isAuthor: false,
      likeCount: 2,
    },
  ];

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  const loadPost = async () => {
    setIsLoading(true);
    try {
      // TODO: 백엔드 API 호출로 변경
      // const response = await boardApi.getPost(postId);
      // console.log('게시글 상세 응답:', response); // ✅ 응답 구조 확인용 로그
      // setPost(response.data || response || mockPost);

      // 임시로 목 데이터 사용
      setTimeout(() => {
        setPost(mockPost);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("게시글 로드 실패:", error);
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      // TODO: 백엔드 API 호출로 변경
      // const response = await commentApi.getComments(postId);
      // console.log('댓글 목록 응답:', response); // ✅ 응답 구조 확인용 로그
      // setComments(response.data || response || mockComments);

      // 임시로 목 데이터 사용
      setComments(mockComments);
    } catch (error) {
      console.error("댓글 로드 실패:", error);
    }
  };

  const handleLike = async () => {
    try {
      // TODO: 백엔드 API 호출로 변경
      // await boardApi.toggleLike(postId);

      // 임시로 로컬 상태만 변경
      setPost((prev) => ({
        ...prev,
        isLiked: !prev.isLiked,
        likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
      }));
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      // TODO: 백엔드 API 호출로 변경
      // await commentApi.createComment(postId, { content: newComment });

      // 임시로 로컬 상태만 변경
      const newCommentObj = {
        id: Date.now(),
        content: newComment,
        author: "나", // TODO: 실제 사용자 정보
        authorAvatar: "👤",
        createdAt: "방금 전",
        isAuthor: true,
        likeCount: 0,
      };

      setComments((prev) => [newCommentObj, ...prev]);
      setPost((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
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
      // TODO: 백엔드 API 호출로 변경
      // await commentApi.deleteComment(postId, commentId);

      // 임시로 로컬 상태만 변경
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setPost((prev) => ({ ...prev, commentCount: prev.commentCount - 1 }));
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  const handleEditPost = () => {
    // TODO: 게시글 수정 페이지로 이동
    console.log("게시글 수정 페이지로 이동");
  };

  const handleDeletePost = () => {
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;

    try {
      // TODO: 백엔드 API 호출로 변경
      // await boardApi.deletePost(postId);

      alert("게시글이 삭제되었습니다.");
      navigate("/board");
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex justify-center items-center">
          <div className="text-center">
            <p className="text-xl text-gray-500">게시글을 찾을 수 없습니다.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/board")}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl hover:bg-white"
            >
              <FiArrowLeft size={20} />
              <span>목록으로 돌아가기</span>
            </button>

            {/* 게시글 관리 버튼 (작성자인 경우) */}
            {post.isAuthor && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEditPost}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-white"
                >
                  <FiEdit size={16} />
                  <span>수정</span>
                </button>
                <button
                  onClick={handleDeletePost}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-white"
                >
                  <FiTrash2 size={16} />
                  <span>삭제</span>
                </button>
              </div>
            )}
          </div>

          {/* 게시글 내용 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-2xl mb-8">
            {/* 카테고리 헤더 */}
            <div className="relative h-40 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-2xl p-6 mb-6">
              <div className="absolute top-4 right-4">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                  {post.category === "free" && "자유게시판"}
                  {post.category === "review" && "리뷰"}
                  {post.category === "question" && "질문"}
                  {post.category === "share" && "정보공유"}
                  {post.category === "event" && "이벤트"}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm opacity-90">{post.createdAt}</p>
              </div>
            </div>

            {/* 제목 */}
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* 태그 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-600 text-sm rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 작성자 정보 */}
            <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl">
                {post.authorAvatar}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{post.author}</p>
                <p className="text-gray-600">게시글 작성자</p>
              </div>
            </div>

            {/* 내용 */}
            <div className="mb-8">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                {post.content}
              </div>
            </div>

            {/* 통계 및 액션 */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FiEye size={18} />
                  <span>조회 {post.viewCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMessageSquare size={18} />
                  <span>댓글 {post.commentCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="p-3 text-gray-400 hover:text-purple-500 transition-colors rounded-full hover:bg-purple-50">
                  <FiShare2 size={20} />
                </button>
                <button className="p-3 text-gray-400 hover:text-purple-500 transition-colors rounded-full hover:bg-purple-50">
                  <FiBookmark size={20} />
                </button>
                <button
                  onClick={handleLike}
                  className={`p-3 rounded-full transition-all duration-200 ${
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
            </div>

            {/* 좋아요 수 표시 */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-lg text-gray-700">
                <span className="font-bold text-purple-600">
                  {post.likeCount}
                </span>
                명이 좋아합니다
              </p>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <FiMessageSquare className="text-purple-500" />
              댓글 ({post.commentCount}개)
            </h3>

            {/* 댓글 작성 */}
            <form onSubmit={handleCommentSubmit} className="mb-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-lg">
                  👤
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 작성하세요..."
                    rows={3}
                    className="w-full px-4 py-3 border-0 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:bg-white text-gray-800 placeholder-gray-400 resize-none shadow-lg"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {newComment.length}/500
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isSubmittingComment ? "작성 중..." : "댓글 작성"}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* 댓글 목록 */}
            <div className="space-y-6">
              {!Array.isArray(comments) || comments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMessageSquare size={32} className="text-gray-400" />
                  </div>
                  <p className="text-lg text-gray-500 mb-2">
                    아직 댓글이 없습니다
                  </p>
                  <p className="text-gray-400">첫 번째 댓글을 작성해보세요!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-100 pb-6 last:border-b-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-lg">
                        {comment.authorAvatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-gray-900">
                            {comment.author}
                          </p>
                          <p className="text-sm text-gray-500">
                            {comment.createdAt}
                          </p>
                        </div>
                        <p className="text-gray-800 mb-3">{comment.content}</p>
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-gray-400 hover:text-purple-500 transition-colors text-sm">
                            <FiHeart size={14} />
                            <span>{comment.likeCount}</span>
                          </button>
                          {comment.isAuthor && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                            >
                              삭제
                            </button>
                          )}
                        </div>
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

export default PostDetailPage;
