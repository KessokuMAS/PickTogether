import jwtAxios from "../utils/jwtAxios";

// 게시글 관련 API
export const boardApi = {
  // 게시글 목록 조회
  getPosts: async (params = {}) => {
    try {
      const response = await jwtAxios.get("/api/posts", { params });
      return response.data;
    } catch (error) {
      console.error("게시글 목록 조회 실패:", error);
      throw error;
    }
  },

  // 게시글 상세 조회
  getPost: async (postId) => {
    try {
      const response = await jwtAxios.get(`/api/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error("게시글 상세 조회 실패:", error);
      throw error;
    }
  },

  // 게시글 작성
  createPost: async (postData) => {
    try {
      const response = await jwtAxios.post("/api/posts", postData);
      return response.data;
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      throw error;
    }
  },

  // 게시글 수정
  updatePost: async (postId, postData) => {
    try {
      const response = await jwtAxios.put(`/api/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      console.error("게시글 수정 실패:", error);
      throw error;
    }
  },

  // 게시글 삭제
  deletePost: async (postId) => {
    try {
      const response = await jwtAxios.delete(`/api/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      throw error;
    }
  },

  // 게시글 좋아요
  toggleLike: async (postId) => {
    try {
      const response = await jwtAxios.post(`/api/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error("게시글 좋아요 실패:", error);
      throw error;
    }
  },

  // 게시글 검색
  searchPosts: async (searchParams) => {
    try {
      const response = await jwtAxios.get("/api/posts/search", {
        params: searchParams,
      });
      return response.data;
    } catch (error) {
      console.error("게시글 검색 실패:", error);
      throw error;
    }
  },

  // 카테고리별 게시글 조회
  getPostsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await jwtAxios.get(
        `/api/categories/${categoryId}/posts`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("카테고리별 게시글 조회 실패:", error);
      throw error;
    }
  },
};

// 댓글 관련 API
export const commentApi = {
  // 댓글 목록 조회
  getComments: async (postId) => {
    try {
      const response = await jwtAxios.get(`/api/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error("댓글 목록 조회 실패:", error);
      throw error;
    }
  },

  // 댓글 작성
  createComment: async (postId, commentData) => {
    try {
      const response = await jwtAxios.post(
        `/api/posts/${postId}/comments`,
        commentData
      );
      return response.data;
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      throw error;
    }
  },

  // 댓글 수정
  updateComment: async (postId, commentId, commentData) => {
    try {
      const response = await jwtAxios.put(
        `/api/posts/${postId}/comments/${commentId}`,
        commentData
      );
      return response.data;
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      throw error;
    }
  },

  // 댓글 삭제
  deleteComment: async (postId, commentId) => {
    try {
      const response = await jwtAxios.delete(
        `/api/posts/${postId}/comments/${commentId}`
      );
      return response.data;
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      throw error;
    }
  },
};

// 카테고리 관련 API
export const categoryApi = {
  // 카테고리 목록 조회
  getCategories: async () => {
    try {
      const response = await jwtAxios.get("/api/categories");
      return response.data;
    } catch (error) {
      console.error("카테고리 목록 조회 실패:", error);
      throw error;
    }
  },
};
