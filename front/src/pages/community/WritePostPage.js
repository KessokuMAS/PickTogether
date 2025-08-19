import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { FiArrowLeft, FiSave, FiX, FiImage, FiTag } from "react-icons/fi";
import { communityApi } from "../../api/communityApi";

const WritePostPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "일반",
    tags: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    {
      id: "일반",
      name: "일반",
      icon: "💬",
      color: "from-blue-400 to-cyan-400",
    },
    {
      id: "맛집추천",
      name: "맛집추천",
      icon: "🍽️",
      color: "from-yellow-400 to-orange-400",
    },
    {
      id: "후기",
      name: "후기",
      icon: "⭐",
      color: "from-green-400 to-teal-400",
    },
    {
      id: "건강",
      name: "건강",
      icon: "💪",
      color: "from-indigo-400 to-purple-400",
    },
    {
      id: "질문",
      name: "질문",
      icon: "❓",
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
      // const response = await communityApi.createPost(formData);
      // console.log('게시글 작성 응답:', response); // ✅ 응답 구조 확인용 로그

      // 임시로 성공 처리
      setTimeout(() => {
        alert("게시글이 작성되었습니다.");
        navigate("/community");
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
        navigate("/community");
      }
    } else {
      navigate("/community");
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
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiArrowLeft className="text-xl" />
              <span className="text-lg font-medium">뒤로가기</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">게시글 작성</h1>
            <div className="w-24"></div> {/* 균형 맞추기 */}
          </div>

          {/* 작성 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 카테고리 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                카테고리
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.category === category.id
                        ? `border-transparent bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className="text-sm font-medium">{category.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 입력 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                제목
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="게시글 제목을 입력하세요"
                maxLength={100}
                required
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.title.length}/100
              </div>
            </div>

            {/* 내용 입력 */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                내용
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                placeholder="게시글 내용을 입력하세요"
                maxLength={2000}
                required
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.content.length}/2000
              </div>
            </div>

            {/* 태그 입력 */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                태그 (선택사항)
              </label>
              <div className="relative">
                <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 맛집,후기,추천)"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                태그는 쉼표(,)로 구분하여 입력하세요
              </p>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <FiX className="text-lg" />
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiSave className="text-lg" />
                {isSubmitting ? "작성 중..." : "게시글 작성"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default WritePostPage;
