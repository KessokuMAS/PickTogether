import api from "../utils/jwtAxios";

export async function createFunding(fundingData) {
  const { data } = await api.post("/api/funding", fundingData);
  return data;
}

export async function getMemberFundings(memberId) {
  const { data } = await api.get(`/api/funding/member/${memberId}`);
  return data;
}

export async function getRestaurantFundings(restaurantId) {
  const { data } = await api.get(`/api/funding/restaurant/${restaurantId}`);
  return data;
}

export async function getFundingById(fundingId) {
  const { data } = await api.get(`/api/funding/${fundingId}`);
  return data;
}
