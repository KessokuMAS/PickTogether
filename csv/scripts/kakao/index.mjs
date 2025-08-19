// scripts/kakao/index.mjs
import axios from "axios";
import fs from "fs";
import { KAKAO_CSV_CONFIG } from "../../../front/src/config/constants.js";

const REST_API_KEY = KAKAO_CSV_CONFIG.REST_API_KEY;
const headers = {
  Authorization: `KakaoAK ${REST_API_KEY}`,
  KA: "sdk/1.0 os/nodejs lang/ko-KR device/PC origin/localhost",
};

// 1) 주소 -> 좌표 (도로명/지번 다 됨)
async function geocode(address) {
  const url = "https://dapi.kakao.com/v2/local/search/address.json";
  const { data } = await axios.get(url, {
    headers,
    params: { query: address },
  });
  if (!data.documents?.length)
    throw new Error(`주소 지오코딩 실패: ${address}`);
  const doc = data.documents[0];
  // x: 경도(lng), y: 위도(lat)
  return { lng: parseFloat(doc.x), lat: parseFloat(doc.y) };
}

// 2) 프론트와 동일하게: categorySearch(원형) + 최대 3페이지
async function fetchRestaurantsByRadius({
  lng,
  lat,
  radius = 2000,
  maxPages = 3,
}) {
  const base = "https://dapi.kakao.com/v2/local/search/category.json";
  const paramsBase = {
    category_group_code: "FD6",
    x: lng, // 경도
    y: lat, // 위도
    radius, // 미터
    size: 15, // SDK도 내부적으로 15
  };

  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const { data } = await axios.get(base, {
      headers,
      params: { ...paramsBase, page },
      timeout: 10000,
    });

    const docs = data.documents || [];
    if (!docs.length) break;

    all.push(...docs);

    // REST의 meta.is_end가 true면 조기종료
    if (data.meta?.is_end) break;

    // 방어 딜레이(프론트의 pagination.nextPage()와 템포 유사)
    await new Promise((r) => setTimeout(r, 200));
  }

  // 중복 제거(같은 place id) – 안전장치
  const map = new Map();
  for (const d of all) {
    if (!map.has(d.id)) map.set(d.id, d);
  }
  return Array.from(map.values());
}

function toCSV(rows, header) {
  const escape = (v) => (v ?? "").toString().replace(/"/g, '""');
  const head = header.join(",");
  const body = rows
    .map((r) => r.map((v) => `"${escape(v)}"`).join(","))
    .join("\n");
  // BOM 추가(엑셀 한글 깨짐 방지)
  return "\uFEFF" + head + "\n" + body;
}

(async () => {
  try {
    // === 입력부 ===
    // 프론트와 **최대한 동일 시나리오**를 위해 주소 -> 좌표 -> 반경 원형 검색로 고정
    const ADDRESS = process.env.ADDRESS || "서울특별시 강남구 테헤란로 152";
    const RADIUS = Number(process.env.RADIUS || 2000); // m
    const MAX_PAGES = Number(process.env.MAX_PAGES || 3); // 프론트가 page<3이므로 3페이지

    // 좌표 구하기
    const { lng, lat } = await geocode(ADDRESS);
    console.log(`📍 Center: ${lat}, ${lng} (addr="${ADDRESS}")`);

    // 프론트(categorySearch + location + radius)와 동일하게 수집
    const docs = await fetchRestaurantsByRadius({
      lng,
      lat,
      radius: RADIUS,
      maxPages: MAX_PAGES,
    });

    // CSV 헤더: 프론트가 사용하는 주요 필드 + distance 포함
    const header = [
      "id",
      "place_name",
      "category_name",
      "phone",
      "address_name",
      "road_address_name",
      "x", // 경도
      "y", // 위도
      "place_url",
      "distance", // m (location 지정 시에만 제공)
    ];

    const rows = docs.map((d) => [
      d.id,
      d.place_name,
      d.category_name,
      d.phone,
      d.address_name,
      d.road_address_name,
      d.x,
      d.y,
      d.place_url,
      d.distance ?? "", // SDK와 동일하게 location을 줬으니 채워짐
    ]);

    const csv = toCSV(rows, header);
    fs.writeFileSync("kakao_food_places.csv", "\uFEFF" + csv, "utf8");
    console.log(
      `✅ Saved ${rows.length} rows (radius=${RADIUS}m, pages<=${MAX_PAGES})`
    );
  } catch (e) {
    console.error("❌ Error:", e?.response?.data || e.message || e);
    process.exit(1);
  }
})();
