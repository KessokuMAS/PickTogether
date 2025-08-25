import axios from "axios";

const BASE_URL = "http://localhost:8080/api/funding-specialty";

export const fundingSpecialtyApi = {
  // 회원별 구매 내역 조회
  getMemberOrders: async (memberId) => {
    try {
      const response = await axios.get(`${BASE_URL}/member/${memberId}`);
      return response.data;
    } catch (error) {
      console.error("회원별 구매 내역 조회 실패:", error);
      throw error;
    }
  },

  // 회원별 구매 내역 조회 (페이징)
  getMemberOrdersWithPaging: async (memberId, page = 0, size = 10) => {
    try {
      const response = await axios.get(`${BASE_URL}/member/${memberId}/page`, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      console.error("회원별 구매 내역 조회 (페이징) 실패:", error);
      throw error;
    }
  },

  // 주문 상세 조회 (ID)
  getOrderById: async (orderId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("주문 상세 조회 실패:", error);
      throw error;
    }
  },

  // 주문 취소
  cancelOrder: async (orderId) => {
    try {
      const response = await axios.put(`${BASE_URL}/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error("주문 취소 실패:", error);
      throw error;
    }
  },

  // 회원별 구매 통계
  getMemberStatistics: async (memberId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/statistics/member/${memberId}`
      );
      return response.data;
    } catch (error) {
      console.error("회원별 구매 통계 조회 실패:", error);
      throw error;
    }
  },
};
