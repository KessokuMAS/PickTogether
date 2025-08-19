import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  fetchRestaurantDetail,
  fetchRestaurantMenus,
} from "../../api/restaurantApi";
import {
  FiPhone,
  FiMapPin,
  FiClock,
  FiTag,
  FiGlobe,
  FiInstagram,
  FiAlertCircle,
  FiShare2,
  FiExternalLink,
  FiHeart,
  FiCalendar,
  FiPlus,
  FiMinus,
  FiShoppingCart,
} from "react-icons/fi";

const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8080";

const ProgressBar = ({ percent = 0 }) => {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
      <div
        className="bg-pink-600 h-3"
        style={{ width: `${p}%`, transition: "width .4s ease" }}
      />
    </div>
  );
};

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchRestaurantDetail(id);
        setData(res);
      } catch (e) {
        setError("상세 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // 상세/메뉴 공통 랜더 대체 대신, id 기반 고정 플레이스홀더 인덱스
  const fallbackIdx = useMemo(() => ((Number(id) || 0) % 45) + 1, [id]);

  const imgSrc = useMemo(() => {
    const fallback = `/${fallbackIdx}.png`;
    const url = data?.imageUrl;
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${API_BASE}${url}`;
    return url;
  }, [data, fallbackIdx]);

  const fundingPeriod = useMemo(() => {
    const now = new Date();
    const addDays = 7 + ((Number(id) || 0) % 8);
    const end = new Date(now);
    end.setDate(end.getDate() + addDays);
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / 86400000);
    return { start: now, end, daysLeft };
  }, [id]);

  const formatDate = (d) =>
    d
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\.\s/g, ".")
      .replace(/\.$/, "");

  // 메뉴가 없을 때 사용할 임시 데이터
  const fallbackMenuItems = useMemo(() => {
    const base = Number(id) || 1;
    const pick = (offset) => `/${((base + offset) % 45) + 1}.png`;
    return [
      {
        id: base * 10 + 1,
        name: "대표 메뉴 A",
        description: "신선한 재료로 만든 인기 메뉴",
        price: 12000,
        imageUrl: pick(1),
      },
      {
        id: base * 10 + 2,
        name: "대표 메뉴 B",
        description: "담백하고 건강한 한 끼",
        price: 9800,
        imageUrl: pick(2),
      },
      {
        id: base * 10 + 3,
        name: "세트 메뉴",
        description: "가성비 좋은 구성",
        price: 15000,
        imageUrl: pick(3),
      },
    ];
  }, [id]);

  // 실제 메뉴 데이터 로드
  const [menuItems, setMenuItems] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const menus = await fetchRestaurantMenus(id);
        if (Array.isArray(menus) && menus.length > 0) {
          setMenuItems(menus);
        } else {
          setMenuItems(fallbackMenuItems);
        }
      } catch (e) {
        setMenuItems(fallbackMenuItems);
      }
    })();
  }, [id, fallbackMenuItems]);

  // 메뉴 선택 관련 상태
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showSelectionResult, setShowSelectionResult] = useState(false);
  const [selectedMenus, setSelectedMenus] = useState([]); // 선택된 메뉴들을 저장하는 배열

  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      setSelectedMenuId(String(menuItems[0].id || ""));
    }
  }, [menuItems]);

  // 선택된 메뉴 정보
  const selectedMenu = useMemo(() => {
    return menuItems.find((m) => String(m.id) === String(selectedMenuId));
  }, [menuItems, selectedMenuId]);

  // 총 금액 계산 (선택된 모든 메뉴의 합계)
  const totalPrice = useMemo(() => {
    return selectedMenus.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [selectedMenus]);

  // 수량 증가
  const increaseQuantity = () => {
    setSelectedQuantity((prev) => Math.min(prev + 1, 99));
  };

  // 수량 감소
  const decreaseQuantity = () => {
    setSelectedQuantity((prev) => Math.max(prev - 1, 1));
  };

  // 메뉴 선택 완료
  const handleMenuSelect = () => {
    if (!selectedMenu) {
      alert("메뉴를 선택해주세요.");
      return;
    }

    // 이미 선택된 메뉴인지 확인
    const existingIndex = selectedMenus.findIndex(
      (item) => item.id === selectedMenu.id
    );

    if (existingIndex >= 0) {
      // 기존 메뉴가 있으면 수량만 업데이트
      const updatedMenus = [...selectedMenus];
      updatedMenus[existingIndex].quantity = selectedQuantity;
      setSelectedMenus(updatedMenus);
    } else {
      // 새로운 메뉴 추가
      setSelectedMenus((prev) => [
        ...prev,
        {
          ...selectedMenu,
          quantity: selectedQuantity,
        },
      ]);
    }

    // 선택 완료 후 초기화
    setSelectedMenuId("");
    setSelectedQuantity(1);
    setShowSelectionResult(false);
  };

  // 선택 초기화
  const resetSelection = () => {
    setShowSelectionResult(false);
    setSelectedQuantity(1);
  };

  // 선택된 메뉴 제거
  const removeSelectedMenu = (menuId) => {
    setSelectedMenus((prev) => prev.filter((item) => item.id !== menuId));
  };

  // 선택된 메뉴 수량 변경
  const updateSelectedMenuQuantity = (menuId, newQuantity) => {
    if (newQuantity <= 0) {
      removeSelectedMenu(menuId);
      return;
    }
    setSelectedMenus((prev) =>
      prev.map((item) =>
        item.id === menuId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: data?.name || "레스토랑", url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (e) {
      // 무시
    }
  };

  const handleFundingClick = () => {
    alert("펀딩 참여 기능은 준비 중입니다.");
  };

  const goCheckout = (menu, quantity = 1) => {
    const params = new URLSearchParams({
      restaurantId: String(id || ""),
      restaurantName: data?.name || "",
      menuId: String(menu?.id || ""),
      menuName: menu?.name || "",
      price: String(menu?.price || ""),
      quantity: String(quantity),
      totalPrice: String(menu?.price * quantity || ""),
    }).toString();
    window.location.href = `/checkout?${params}`;
  };

  return (
    <MainLayout>
      <div className="max-w-[1100px] mx-auto p-4">
        <Link to="/main" className="text-sm text-blue-600">
          ← 목록으로
        </Link>

        {loading ? (
          <div className="mt-4">
            <div className="w-full h-[360px] bg-gray-200 rounded-xl animate-pulse" />
            <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="mt-4 h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="mt-2 h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <p className="mt-6 text-red-500">{error}</p>
        ) : data ? (
          <div className="mt-4">
            {/* Hero 이미지 */}
            <div className="w-full bg-gray-100 rounded-xl overflow-hidden">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={data.name}
                  className="w-full h-[360px] object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `/${fallbackIdx}.png`;
                  }}
                />
              ) : (
                <div className="w-full h-[360px] flex items-center justify-center text-gray-400">
                  이미지 없음
                </div>
              )}
            </div>

            {/* 상세 카드 */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
              {/* 제목 + 카테고리 */}
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {data.name}
                </h1>
                {data.categoryName && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-pink-100 text-pink-700">
                    {data.categoryName}
                  </span>
                )}
              </div>

              {/* 연락처/주소/외부 링크 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-gray-500" />
                    <span>전화: {data.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-gray-500" />
                    <span className="truncate">
                      주소: {data.roadAddressName || "-"}
                    </span>
                  </div>
                </div>
                <div className="flex md:justify-end items-start gap-2">
                  {data.y && data.x && (
                    <a
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                      href={`https://map.kakao.com/link/to/${encodeURIComponent(
                        data.name || ""
                      )},${data.y},${data.x}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FiMapPin /> 길찾기
                    </a>
                  )}
                </div>
              </div>

              {/* 진행률 */}
              <div className="mt-2">
                <div className="flex items-end justify-between mb-1">
                  <div className="text-sm text-gray-600">펀딩 진행률</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {data.fundingPercent ?? 0}%
                  </div>
                </div>
                <ProgressBar percent={data.fundingPercent ?? 0} />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <div>
                    {Number(data.fundingAmount ?? 0).toLocaleString()}원
                  </div>
                  <div>
                    목표 {Number(data.fundingGoalAmount ?? 0).toLocaleString()}
                    원
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-pink-50 text-pink-700 rounded-lg border border-pink-200 text-base">
                    <FiCalendar className="text-lg" />
                    <span className="font-bold">
                      {formatDate(fundingPeriod.start)} ~{" "}
                      {formatDate(fundingPeriod.end)}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-4 py-2.5 rounded-lg font-bold border text-base ${
                      fundingPeriod.daysLeft <= 3
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-pink-100 text-pink-700 border-pink-200"
                    }`}
                  >
                    D-{fundingPeriod.daysLeft}
                  </span>
                </div>
              </div>

              {/* 참여 CTA & 공유 */}
              <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
                {/* 메뉴 선택 섹션 */}
                {menuItems && menuItems.length > 0 && (
                  <div className="bg-pink-50 rounded-lg p-6 border border-pink-200">
                    <div className="flex items-center gap-2 mb-4">
                      <FiShoppingCart className="text-pink-600 text-xl" />
                      <h3 className="text-lg font-bold text-gray-900">
                        메뉴 선택
                      </h3>
                    </div>

                    {/* 메뉴 선택 드롭다운 */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4">
                      <select
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-white"
                        value={selectedMenuId}
                        onChange={(e) => {
                          setSelectedMenuId(e.target.value);
                          // 메뉴가 변경되면 수량만 초기화하고 선택 결과는 유지
                          setSelectedQuantity(1);
                          // 이미 선택 결과가 보이는 상태라면 유지
                        }}
                      >
                        <option value="">메뉴를 선택해주세요</option>
                        {menuItems.map((m) => (
                          <option key={m.id} value={String(m.id)}>
                            {m.name} · {Number(m.price).toLocaleString()}원
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={handleMenuSelect}
                        disabled={!selectedMenuId}
                        className="px-6 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        선택하기
                      </button>
                    </div>

                    {/* 선택된 메뉴들 표시 */}
                    {selectedMenus.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-pink-300">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-gray-900">
                            선택된 메뉴
                          </h4>
                          <span className="text-pink-600 font-bold text-lg">
                            총 {totalPrice.toLocaleString()}원
                          </span>
                        </div>

                        {/* 선택된 메뉴 리스트 */}
                        <div className="space-y-3 mb-4">
                          {selectedMenus.map((menu) => (
                            <div
                              key={menu.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {menu.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {Number(menu.price).toLocaleString()}원 ×{" "}
                                  {menu.quantity}개
                                </div>
                              </div>

                              {/* 수량 조절 */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateSelectedMenuQuantity(
                                      menu.id,
                                      menu.quantity - 1
                                    )
                                  }
                                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                >
                                  <FiMinus className="text-gray-600 text-sm" />
                                </button>
                                <span className="w-8 text-center font-bold">
                                  {menu.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateSelectedMenuQuantity(
                                      menu.id,
                                      menu.quantity + 1
                                    )
                                  }
                                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                >
                                  <FiPlus className="text-gray-600 text-sm" />
                                </button>

                                {/* 제거 버튼 */}
                                <button
                                  onClick={() => removeSelectedMenu(menu.id)}
                                  className="ml-2 text-red-500 hover:text-red-700 text-sm"
                                >
                                  삭제
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              // 모든 선택된 메뉴로 결제 페이지 이동
                              const params = new URLSearchParams({
                                restaurantId: String(id || ""),
                                restaurantName: data?.name || "",
                                menus: JSON.stringify(selectedMenus),
                                totalPrice: String(totalPrice),
                              }).toString();
                              window.location.href = `/payment?${params}`;
                            }}
                            className="flex-1 bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors"
                          >
                            펀딩 참여하기 ({selectedMenus.length}개 메뉴)
                          </button>
                          <button
                            onClick={() => setSelectedMenus([])}
                            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            전체 삭제
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 보조 버튼들 */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <FiShare2 /> {copied ? "링크 복사됨" : "공유하기"}
                  </button>
                  {data.placeUrl && (
                    <a
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                      href={data.placeUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FiExternalLink /> 카카오 장소 열기
                    </a>
                  )}
                </div>
              </div>

              {/* 섹션: 소개 */}
              {data.description && (
                <div className="pt-2">
                  <div className="font-semibold mb-1">소개</div>
                  <div className="whitespace-pre-wrap text-gray-700">
                    {data.description}
                  </div>
                </div>
              )}

              {/* 섹션: 영업시간 */}
              {data.businessHours && (
                <div>
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <FiClock className="text-gray-500" /> <span>영업시간</span>
                  </div>
                  <div className="text-gray-700">{data.businessHours}</div>
                </div>
              )}

              {/* 섹션: 가격/태그 */}
              {(data.priceRange || data.tags) && (
                <div className="space-y-2">
                  {data.priceRange && (
                    <div className="flex items-center gap-2 text-gray-800">
                      <FiTag className="text-gray-500" />
                      <span>가격대: {data.priceRange}</span>
                    </div>
                  )}
                  {data.tags && (
                    <div className="flex flex-wrap items-center gap-2">
                      <FiTag className="text-gray-500" />
                      <div className="flex flex-wrap gap-2">
                        {String(data.tags)
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                          .map((t, idx) => (
                            <span
                              key={`${t}-${idx}`}
                              className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                            >
                              {t}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 섹션: 메뉴 */}
              {menuItems && menuItems.length > 0 && (
                <div className="pt-2">
                  <div className="font-semibold mb-2">메뉴</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {menuItems.map((m, index) => (
                      <div
                        key={m.id}
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                      >
                        <div className="w-full h-40 bg-gray-100">
                          <img
                            src={m.imageUrl}
                            alt={m.name}
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                              const idx = ((fallbackIdx + index) % 45) + 1;
                              e.currentTarget.src = `/${idx}.png`;
                            }}
                          />
                        </div>
                        <div className="p-3">
                          <div className="font-semibold text-gray-900 flex items-center justify-between gap-2">
                            <span className="truncate">{m.name}</span>
                            <span className="text-pink-700 font-bold">
                              {Number(m.price).toLocaleString()}원
                            </span>
                          </div>
                          {m.description && (
                            <div className="text-sm text-gray-600 mt-1 truncate">
                              {m.description}
                            </div>
                          )}
                          <button
                            onClick={() => {
                              // 이미 선택된 메뉴인지 확인
                              const existingIndex = selectedMenus.findIndex(
                                (item) => item.id === m.id
                              );

                              if (existingIndex >= 0) {
                                // 기존 메뉴가 있으면 수량만 증가
                                const updatedMenus = [...selectedMenus];
                                updatedMenus[existingIndex].quantity += 1;
                                setSelectedMenus(updatedMenus);
                              } else {
                                // 새로운 메뉴 추가
                                setSelectedMenus((prev) => [
                                  ...prev,
                                  {
                                    ...m,
                                    quantity: 1,
                                  },
                                ]);
                              }
                            }}
                            className="mt-3 w-full inline-flex items-center justify-center px-3 py-2 rounded-md bg-pink-600 text-white hover:bg-pink-700"
                          >
                            장바구니에 추가
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end"></div>
                </div>
              )}

              {/* 섹션: 외부 링크 */}
              {(data.homepageUrl || data.instagramUrl) && (
                <div className="flex flex-wrap gap-3">
                  {data.homepageUrl && (
                    <a
                      className="inline-flex items-center gap-2 text-blue-600"
                      href={data.homepageUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FiGlobe /> 홈페이지
                    </a>
                  )}
                  {data.instagramUrl && (
                    <a
                      className="inline-flex items-center gap-2 text-pink-600"
                      href={data.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FiInstagram /> 인스타그램
                    </a>
                  )}
                </div>
              )}

              {/* 섹션: 공지 */}
              {data.notice && (
                <div>
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <FiAlertCircle className="text-gray-500" />{" "}
                    <span>공지</span>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-700">
                    {data.notice}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default RestaurantDetailPage;
