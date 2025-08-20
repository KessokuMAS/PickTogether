import React, { useState, useEffect } from "react";
import {
  FiEye,
  FiCheck,
  FiX,
  FiClock,
  FiFilter,
  FiArrowLeft,
} from "react-icons/fi";
import {
  getAllBusinessRequests,
  getBusinessRequestsByStatus,
  reviewBusinessRequest,
  getPendingRequestCount,
} from "../../api/businessRequestApi";
import ImageModal from "../../components/common/ImageModal";

export default function BusinessRequestManagementPage() {
  // getImageUrl 함수 추가
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    // 백엔드에서 반환된 상대 경로를 절대 URL로 변환
    return `http://localhost:8080/${imageUrl}`;
  };

  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("APPROVED");

  const pageSize = 10;

  useEffect(() => {
    fetchRequests();
    fetchPendingCount();
  }, [currentPage, selectedStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedStatus === "ALL") {
        response = await getAllBusinessRequests(currentPage, pageSize);
      } else {
        response = await getBusinessRequestsByStatus(
          selectedStatus,
          currentPage,
          pageSize
        );
      }

      // BusinessRequestPageDTO 구조에 맞게 수정
      setRequests(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("요청 목록 조회 오류:", error);
      alert("요청 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const count = await getPendingRequestCount();
      setPendingCount(count);
    } catch (error) {
      console.error("대기중인 요청 개수 조회 오류:", error);
    }
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setCurrentPage(0);
  };

  const handleReview = async () => {
    if (!selectedRequest) return;

    try {
      await reviewBusinessRequest({
        id: selectedRequest.id,
        status: reviewStatus,
        reviewComment: reviewComment,
      });

      alert("요청 검토가 완료되었습니다.");
      setShowReviewModal(false);
      setReviewComment("");
      setReviewStatus("APPROVED");
      setSelectedRequest(null);

      // 목록 새로고침
      fetchRequests();
      fetchPendingCount();
    } catch (error) {
      console.error("요청 검토 오류:", error);
      alert("요청 검토 중 오류가 발생했습니다.");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: FiClock },
      APPROVED: { color: "bg-green-100 text-green-800", icon: FiCheck },
      REJECTED: { color: "bg-red-100 text-red-800", icon: FiX },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {status === "PENDING"
          ? "대기중"
          : status === "APPROVED"
          ? "승인됨"
          : "거부됨"}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("ko-KR");
  };

  const formatAmount = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("ko-KR").format(amount) + "원";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            비즈니스 요청 관리
          </h1>
          <p className="text-slate-600">
            가게 등록 요청을 검토하고 승인/거부할 수 있습니다.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">전체 요청</p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalElements}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiEye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">대기중</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingCount}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">승인됨</p>
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter((r) => r.status === "APPROVED").length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">거부됨</p>
                <p className="text-2xl font-bold text-red-600">
                  {requests.filter((r) => r.status === "REJECTED").length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FiX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <FiFilter className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700">상태별 필터:</span>
            <div className="flex gap-2">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === status
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {status === "ALL"
                    ? "전체"
                    : status === "PENDING"
                    ? "대기중"
                    : status === "APPROVED"
                    ? "승인됨"
                    : "거부됨"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 요청 목록 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-slate-600">로딩 중...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">요청이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      가게명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      요청자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      펀딩 목표
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      요청일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {request.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {request.roadAddressName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {request.categoryName || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {request.memberName}
                          </div>
                          <div className="text-sm text-slate-500">
                            {request.memberEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {formatAmount(request.fundingGoalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            상세보기
                          </button>
                          {request.status === "PENDING" && (
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowReviewModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              검토
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(
                  0,
                  Math.min(totalPages - 1, currentPage - 2 + i)
                );
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 bg-white border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 상세보기 모달 */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  요청 상세 정보
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">기본 정보</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">가게명:</span>
                      <span className="ml-2 font-medium">
                        {selectedRequest.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">카테고리:</span>
                      <span className="ml-2">
                        {selectedRequest.categoryName || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">전화번호:</span>
                      <span className="ml-2">
                        {selectedRequest.phone || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">상태:</span>
                      <span className="ml-2">
                        {getStatusBadge(selectedRequest.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-2">위치 정보</h3>
                  <div className="text-sm">
                    <div className="mb-1">
                      <span className="text-slate-500">주소:</span>
                      <span className="ml-2">
                        {selectedRequest.roadAddressName}
                      </span>
                    </div>
                    <div className="mb-1">
                      <span className="text-slate-500">좌표:</span>
                      <span className="ml-2">
                        {selectedRequest.y}, {selectedRequest.x}
                      </span>
                    </div>
                    {selectedRequest.placeUrl && (
                      <div>
                        <span className="text-slate-500">카카오맵:</span>
                        <a
                          href={selectedRequest.placeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          링크 보기
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-2">펀딩 정보</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">목표 금액:</span>
                      <span className="ml-2 font-medium">
                        {formatAmount(selectedRequest.fundingGoalAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">시작일:</span>
                      <span className="ml-2">
                        {selectedRequest.fundingStartDate || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">종료일:</span>
                      <span className="ml-2">
                        {selectedRequest.fundingEndDate || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-2">
                    요청자 정보
                  </h3>
                  <div className="text-sm">
                    <div className="mb-1">
                      <span className="text-slate-500">이름:</span>
                      <span className="ml-2">{selectedRequest.memberName}</span>
                    </div>
                    <div className="mb-1">
                      <span className="text-slate-500">이메일:</span>
                      <span className="ml-2">
                        {selectedRequest.memberEmail}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedRequest.imageUrl && (
                  <div>
                    <h3 className="font-medium text-slate-900 mb-2">
                      가게 이미지
                    </h3>
                    <img
                      src={getImageUrl(selectedRequest.imageUrl)}
                      alt="가게 이미지"
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setSelectedImageUrl(
                          getImageUrl(selectedRequest.imageUrl)
                        );
                        setShowImageModal(true);
                      }}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      이미지를 클릭하면 원본 크기로 볼 수 있습니다
                    </p>
                  </div>
                )}

                {selectedRequest.reviewComment && (
                  <div>
                    <h3 className="font-medium text-slate-900 mb-2">
                      검토 코멘트
                    </h3>
                    <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                      {selectedRequest.reviewComment}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-slate-900 mb-2">시간 정보</h3>
                  <div className="text-sm">
                    <div className="mb-1">
                      <span className="text-slate-500">요청일:</span>
                      <span className="ml-2">
                        {formatDate(selectedRequest.createdAt)}
                      </span>
                    </div>
                    {selectedRequest.reviewedAt && (
                      <div>
                        <span className="text-slate-500">검토일:</span>
                        <span className="ml-2">
                          {formatDate(selectedRequest.reviewedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 검토 모달 */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">요청 검토</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    검토 결과
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="APPROVED">승인</option>
                    <option value="REJECTED">거부</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    검토 코멘트
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="검토 코멘트를 입력하세요..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                >
                  취소
                </button>
                <button
                  onClick={handleReview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  검토 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 뒤로가기 버튼 */}
      <div className="mt-8 text-center">
        <a
          href="/mypage/admin/settings"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-600 px-6 py-3 font-semibold text-white hover:bg-slate-700 transition-colors"
        >
          <FiArrowLeft className="h-4 w-4" />
          관리자 설정으로 돌아가기
        </a>
      </div>

      {/* 이미지 모달 */}
      <ImageModal
        isOpen={showImageModal}
        imageUrl={selectedImageUrl}
        onClose={() => {
          setShowImageModal(false);
          setSelectedImageUrl("");
        }}
      />
    </div>
  );
}
