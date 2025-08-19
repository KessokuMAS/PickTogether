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
import { communityApi } from "../../api/communityApi";

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
    category: "질문",
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
      // const response = await communityApi.getPost(postId);
      // console.log('게시글 상세 응답:', response); // ✅ 응답 구조 확인용 로그
      // setPost(response.data || response || mockPost);

      // 임시로 목 데이터 사용
      setTimeout(() => {
        setPost(mockPost);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("게시글 로드 실패:", error);
      setPost(mockPost);
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      // TODO: 백엔드 API 호출로 변경
      // const response = await communityApi.getComments(postId);
      // console.log('댓글 목록 응답:', response); // ✅ 응답 구조 확인용 로그
      // setComments(response.data || response || mockComments);

      // 임시로 목 데이터 사용
      setComments(mockComments);
    } catch (error) {
      console.error("댓글 로드 실패:", error);
      setComments(mockComments);
    }
  };

  const handleLike = async () => {
    try {
      // TODO: 백엔드 API 호출로 변경
      // const response = await communityApi.likePost(postId);
      // console.log('좋아요 응답:', response); // ✅ 응답 구조 확인용 로그

      // 임시로 좋아요 상태 변경
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
      // const response = await communityApi.addComment(postId, { content: newComment });
      // console.log('댓글 작성 응답:', response); // ✅ 응답 구조 확인용 로그

      // 임시로 댓글 추가
      const newCommentObj = {
        id: Date.now(),
        content: newComment,
        author: "현재사용자", // TODO: 실제 사용자 정보 사용
        authorAvatar: "👤",
        createdAt: "방금 전",
        isAuthor: true,
        likeCount: 0,
      };

      setComments((prev) => [newCommentObj, ...prev]);
      setPost((prev) => ({
        ...prev,
        commentCount: prev.commentCount + 1,
      }));
      setNewComment("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEdit = () => {
    navigate(`/community/write?edit=${postId}`);
  };

  const handleDelete = () => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      // TODO: 백엔드 API 호출로 변경
      // communityApi.deletePost(postId);
      navigate("/community");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 100) + "...",
        url: window.location.href,
      });
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 클립보드에 복사되었습니다.");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              게시글을 찾을 수 없습니다
            </h1>
            <button
              onClick={() => navigate("/community")}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              커뮤니티로 돌아가기
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/community")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiArrowLeft className="text-xl" />
              <span>뒤로가기</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="공유하기"
              >
                <FiShare2 className="text-xl" />
              </button>
              <button
                onClick={handleEdit}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="수정하기"
              >
                <FiEdit className="text-xl" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:text-red-800 transition-colors"
                title="삭제하기"
              >
                <FiTrash2 className="text-xl" />
              </button>
            </div>
          </div>

          {/* 게시글 내용 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            {/* 카테고리 */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {post.category}
              </span>
            </div>

            {/* 제목 */}
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {post.title}
            </h1>

            {/* 메타 정보 */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{post.authorAvatar}</span>
                  <span className="font-medium">{post.author}</span>
                </div>
                <span>{post.createdAt}</span>
                <div className="flex items-center gap-1">
                  <FiEye className="text-lg" />
                  <span>{post.viewCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    post.isLiked
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FiHeart
                    className={`text-lg ${post.isLiked ? "fill-current" : ""}`}
                  />
                  <span>{post.likeCount}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiMessageSquare className="text-lg" />
                  <span>{post.commentCount}</span>
                </div>
              </div>
            </div>

            {/* 내용 */}
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 댓글 섹션 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              댓글 ({post.commentCount})
            </h3>

            {/* 댓글 작성 폼 */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? "작성 중..." : "댓글 작성"}
                </button>
              </div>
            </form>

            {/* 댓글 목록 */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b border-gray-100 pb-4 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{comment.authorAvatar}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-800">
                          {comment.author}
                        </span>
                        <span className="text-sm text-gray-500">
                          {comment.createdAt}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                          <FiHeart className="text-sm" />
                          <span>{comment.likeCount}</span>
                        </button>
                        <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                          답글
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostDetailPage;
