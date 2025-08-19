// src/api/restaurantApi.js
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta?.env?.VITE_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080",
  withCredentials: false,
});

// 근처 음식점: 가까운 순 + 페이징
export async function fetchNearbyRestaurants({
  lat,
  lng,
  radius = 2000,
  page = 0,
  size = 24,
}) {
  const { data } = await api.get("/api/restaurants/nearby", {
    params: { lat, lng, radius, page, size },
  });
  console.log(data);

  return data; // Spring의 Page<Restaurant> JSON
}

// 🍜 근처 한그릇 메뉴: 가까운 순 + 페이징
export async function fetchNearbyForOneMenus({
  lat,
  lng,
  radius = 2000,
  page = 0,
  size = 24,
}) {
  const { data } = await api.get("/api/for-one/nearby", {
    params: { lat, lng, radius, page, size },
  });
  console.log(data);

  return data; // Spring의 Page<ForOneMenuNearbyView> JSON
}

export async function fetchRestaurantDetail(id) {
  const { data } = await api.get(`/api/restaurants/${id}`);
  return data; // RestaurantDTO (기본 + 확장 정보 포함)
}

export async function fetchRestaurantMenus(id) {
  const { data } = await api.get(`/api/restaurants/${id}/menus`);
  return data; // List<MenuDTO>
}
