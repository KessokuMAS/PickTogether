import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { FiArrowLeft, FiSave, FiX, FiImage, FiTag } from "react-icons/fi";
import { boardApi } from "../../api/boardApi";

const WritePostPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "free",
    tags: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: 백엔드 API 연결 시 주석 해제
      // const response = await boardApi.createPost(formData);
      // console.log('게시글 작성 응답:', response); // ✅ 응답 구조 확인용 로그

      // 임시로 성공 처리
      setTimeout(() => {
        alert("게시글이 작성되었습니다.");
        navigate("/board");
      }, 1000);
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      alert("게시글 작성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.content) {
      if (window.confirm("작성 중인 내용이 있습니다. 정말 나가시겠습니까?")) {
        navigate("/board");
      }
    } else {
      navigate("/board");
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl hover:bg-white"
            >
              <FiArrowLeft size={20} />
              <span>목록으로 돌아가기</span>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              새 게시글 작성
            </h1>
            <div className="w-32"></div> {/* 균형을 위한 빈 공간 */}
          </div>

          {/* 작성 폼 */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-2xl"
          >
            {/* 카테고리 선택 */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                📝 카테고리 선택
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        category: category.id,
                      }))
                    }
                    className={`group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      formData.category === category.id
                        ? "scale-105 shadow-2xl"
                        : "shadow-lg hover:shadow-xl"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${
                        category.color
                      } ${
                        formData.category === category.id
                          ? "opacity-100"
                          : "opacity-80"
                      }`}
                    />
                    <div className="relative flex flex-col items-center gap-2 px-4 py-6 text-white">
                      <span className="text-3xl">{category.icon}</span>
                      <span className="font-semibold text-sm text-center">
                        {category.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 입력 */}
            <div className="mb-8">
              <label
                htmlFor="title"
                className="block text-lg font-semibold text-gray-800 mb-3"
              >
                ✏️ 제목
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="게시글 제목을 입력하세요"
                className="w-full px-6 py-4 border-0 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:bg-white text-gray-800 placeholder-gray-400 text-lg shadow-lg"
                maxLength={100}
              />
              <div className="flex justify-end mt-2">
                <span className="text-sm text-gray-500">
                  {formData.title.length}/100
                </span>
              </div>
            </div>

            {/* 태그 입력 */}
            <div className="mb-8">
              <label
                htmlFor="tags"
                className="block text-lg font-semibold text-gray-800 mb-3"
              >
                🏷️ 태그 (선택사항)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 맛집, 점심, 추천)"
                  className="w-full pl-12 pr-6 py-4 border-0 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:bg-white text-gray-800 placeholder-gray-400 text-lg shadow-lg"
                  maxLength={200}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400">
                  <FiTag size={20} />
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <span className="text-sm text-gray-500">
                  {formData.tags.length}/200
                </span>
              </div>
            </div>

            {/* 내용 입력 */}
            <div className="mb-10">
              <label
                htmlFor="content"
                className="block text-lg font-semibold text-gray-800 mb-3"
              >
                📝 내용
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="게시글 내용을 자세히 작성해주세요"
                rows={15}
                className="w-full px-6 py-4 border-0 rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:bg-white text-gray-800 placeholder-gray-400 text-lg shadow-lg resize-none"
                maxLength={2000}
              />
              <div className="flex justify-end mt-2">
                <span className="text-sm text-gray-500">
                  {formData.content.length}/2000
                </span>
              </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex justify-end gap-6">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-8 py-4 border-0 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                <FiX size={20} />
                <span>취소</span>
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.title.trim() ||
                  !formData.content.trim()
                }
                className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-3">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>작성 중...</span>
                    </>
                  ) : (
                    <>
                      <FiSave size={20} />
                      <span>게시글 작성</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>

          {/* 작성 가이드 */}
          <div className="mt-10 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              게시글 작성 가이드
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  제목은 명확하고 이해하기 쉽게 작성해주세요
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  내용은 구체적이고 자세하게 작성해주세요
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  태그를 활용하여 검색이 쉽게 만들어주세요
                </li>
              </ul>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  다른 사용자에게 도움이 되는 정보를 공유해주세요
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  욕설, 비방, 스팸성 내용은 금지됩니다
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  작성 후에는 수정이 어려우니 신중하게 작성해주세요
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default WritePostPage;
