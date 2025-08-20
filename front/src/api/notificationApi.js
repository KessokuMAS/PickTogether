import jwtAxios from "../utils/jwtAxios";

const API_SERVER_HOST = "http://localhost:8080";

// 특정 회원의 알림 목록 조회
export const getNotificationsByMember = async (email, page = 0, size = 20) => {
  try {
    const response = await jwtAxios.get(
      `${API_SERVER_HOST}/api/notifications/member/${email}?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    console.error("알림 목록 조회 실패:", error);
    throw error;
  }
};

// 특정 회원의 읽지 않은 알림 개수
export const getUnreadNotificationCount = async (email) => {
  try {
    const response = await jwtAxios.get(
      `${API_SERVER_HOST}/api/notifications/member/${email}/unread-count`
    );
    return response.data;
  } catch (error) {
    console.error("읽지 않은 알림 개수 조회 실패:", error);
    throw error;
  }
};

// 특정 알림을 읽음 처리
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await jwtAxios.put(
      `${API_SERVER_HOST}/api/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error("알림 읽음 처리 실패:", error);
    throw error;
  }
};

// 특정 회원의 모든 알림을 읽음 처리
export const markAllNotificationsAsRead = async (email) => {
  try {
    const response = await jwtAxios.put(
      `${API_SERVER_HOST}/api/notifications/member/${email}/read-all`
    );
    return response.data;
  } catch (error) {
    console.error("모든 알림 읽음 처리 실패:", error);
    throw error;
  }
};

// 특정 알림 삭제
export const deleteNotification = async (notificationId) => {
  try {
    const response = await jwtAxios.delete(
      `${API_SERVER_HOST}/api/notifications/${notificationId}`
    );
    return response.data;
  } catch (error) {
    console.error("알림 삭제 실패:", error);
    throw error;
  }
};

// 특정 회원의 모든 읽은 알림 삭제
export const deleteAllReadNotifications = async (email) => {
  try {
    const response = await jwtAxios.delete(
      `${API_SERVER_HOST}/api/notifications/member/${email}/read-delete-all`
    );
    return response.data;
  } catch (error) {
    console.error("읽은 알림 전체 삭제 실패:", error);
    throw error;
  }
};
