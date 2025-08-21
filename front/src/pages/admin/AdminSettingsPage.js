import React from "react";
import {
  FiShield,
  FiMessageSquare,
  FiShoppingBag,
  FiArrowLeft,
} from "react-icons/fi";

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <FiShield className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            관리자 설정
          </h1>
          <p className="text-slate-600 text-lg">
            시스템 관리 및 모니터링을 위한 관리자 전용 페이지입니다
          </p>
        </div>

        {/* 관리 메뉴 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 커뮤니티 관리 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FiMessageSquare className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">
                  커뮤니티 관리
                </h3>
                <p className="text-slate-600">게시글, 댓글, 신고 관리</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                게시글 모니터링 및 관리
              </div>
              <div className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                커뮤니티 규칙 설정
              </div>
            </div>
          </div>

          {/* 가게요청 관리 */}
          <a href="/mypage/admin/business-requests" className="block">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <FiShoppingBag className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    가게요청 관리
                  </h3>
                  <p className="text-slate-600">가게 등록 요청 관리</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  가게 등록 요청 검토
                </div>
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  가게 정보 승인/거부
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="text-center">
          <a
            href="/mypage"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-600 px-6 py-3 font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            <FiArrowLeft size={18} />
            마이페이지로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
