import jwtAxios from "../utils/jwtAxios";
import axios from "axios";

const API_SERVER_HOST = "http://localhost:8080";
const API_BASE_URL = "/api/community";

// 게시글 관련 API
export const communityApi = {
  // 게시글 목록 조회 (인증 불필요)
  getPosts: async (
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc"
  ) => {
    try {
      const response = await axios.get(
        `${API_SERVER_HOST}${API_BASE_URL}/posts`,
        {
          params: {
            page,
            size,
            sort: `${sortBy},${sortDir}`, // 스프링 Pageable 형식으로 변경
          },
        }
      );
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error("게시글 목록 조회 실패", {
        status,
        data,
        url: `${API_SERVER_HOST}${API_BASE_URL}/posts`,
        params: { page, size, sort: `${sortBy},${sortDir}` },
      });
      throw error;
    }
  },

  // 카테고리별 게시글 조회 (인증 불필요)
  getPostsByCategory: async (category, page = 0, size = 10) => {
    try {
      const response = await axios.get(
        `${API_SERVER_HOST}${API_BASE_URL}/posts/category/${category}`,
        {
          params: { page, size },
        }
      );
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error("카테고리별 게시글 조회 실패", {
        status,
        data,
        url: `${API_SERVER_HOST}${API_BASE_URL}/posts/category/${category}`,
        params: { page, size },
      });
      throw error;
    }
  },

  // 키워드로 게시글 검색 (인증 불필요)
  searchPosts: async (keyword, page = 0, size = 10) => {
    try {
      const response = await axios.get(
        `${API_SERVER_HOST}${API_BASE_URL}/posts/search`,
        {
          params: { keyword, page, size },
        }
      );
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error("게시글 검색 실패", {
        status,
        data,
        url: `${API_SERVER_HOST}${API_BASE_URL}/posts/search`,
        params: { keyword, page, size },
      });
      throw error;
    }
  },

  // 게시글 상세 조회 (인증 불필요)
  getPost: async (id) => {
    try {
      const response = await axios.get(
        `${API_SERVER_HOST}${API_BASE_URL}/posts/${id}`
      );
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error("게시글 조회 실패", {
        status,
        data,
        url: `${API_SERVER_HOST}${API_BASE_URL}/posts/${id}`,
      });
      throw error;
    }
  },

  // 게시글 생성 (인증 필요)
  createPost: async (postData) => {
    try {
      // FormData인 경우 Content-Type을 자동으로 설정
      const config =
        postData instanceof FormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : {};

      const response = await jwtAxios.post(
        `${API_BASE_URL}/posts`,
        postData,
        config
      );
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error("게시글 생성 실패", {
        status,
        data,
        url: `${API_BASE_URL}/posts`,
        postData,
      });
      throw error;
    }
  },

  // 게시글 수정 (인증 필요)
  updatePost: async (id, postData) => {
    try {
      // FormData인 경우 Content-Type을 자동으로 설정
      const config =
        postData instanceof FormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : {};

      const response = await jwtAxios.put(
        `${API_BASE_URL}/posts/${id}`,
        postData,
        config
      );
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error("게시글 수정 실패", {
        status,
        data,
        url: `${API_BASE_URL}/posts/${id}`,
        postData,
      });
      throw error;
    }
  },

  // 게시글 삭제 (인증 필요)
  deletePost: async (id) => {
    try {
      await jwtAxios.delete(`${API_BASE_URL}/posts/${id}`);
      return true;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error("게시글 삭제 실패", {
        status,
        data,
        url: `${API_BASE_URL}/posts/${id}`,
      });
      throw error;
    }
  },

  // 게시글 좋아요 (인증 필요)
  likePost: async (id) => {
    try {
      const response = await jwtAxios.post(`${API_BASE_URL}/posts/${id}/like`);
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error("게시글 좋아요 실패", {
        status,
        data,
        url: `${API_BASE_URL}/posts/${id}/like`,
      });
      throw error;
    }
  },

  // 댓글 API
  getComments: async (postId) => {
    const url = `${API_SERVER_HOST}${API_BASE_URL}/posts/${postId}/comments`;
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      console.error("댓글 조회 실패", {
        status: error?.response?.status,
        data: error?.response?.data,
        url,
      });
      throw error;
    }
  },

  addComment: async (postId, { content, author, authorEmail }) => {
    const url = `${API_SERVER_HOST}${API_BASE_URL}/posts/${postId}/comments`;
    try {
      const res = await jwtAxios.post(url, { content, author, authorEmail });
      return res.data;
    } catch (error) {
      console.error("댓글 작성 실패", {
        status: error?.response?.status,
        data: error?.response?.data,
        url,
        body: { content, author, authorEmail },
      });
      throw error;
    }
  },

  deleteComment: async (postId, commentId, authorEmail) => {
    const url = `${API_SERVER_HOST}${API_BASE_URL}/posts/${postId}/comments/${commentId}`;
    try {
      // 헤더에 한글 금지 → 쿼리/바디로 전달
      await jwtAxios.delete(url, {
        params: { authorEmail: authorEmail || "" },
        // axios는 delete에도 data를 보낼 수 있음 (백엔드에서도 optional body 처리)
        data: { authorEmail: authorEmail || "" },
      });
      return true;
    } catch (error) {
      console.error("댓글 삭제 실패", {
        status: error?.response?.status,
        data: error?.response?.data,
        url,
      });
      throw error;
    }
  },
};
