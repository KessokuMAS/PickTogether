import axios from "axios";

// ✅ FastAPI (챗봇 서버) 인스턴스
export const chatbotApi = axios.create({
  baseURL: "http://localhost:8000", // FastAPI 서버
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Spring Boot (메인 API 서버) 인스턴스
export const backendApi = axios.create({
  baseURL: "http://localhost:8080/api", // Spring Boot 서버
  headers: {
    "Content-Type": "application/json",
  },
});
