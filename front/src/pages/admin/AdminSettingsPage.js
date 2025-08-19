import React from "react";
import { FiShield, FiMessageSquare, FiShoppingBag } from "react-icons/fi";

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 헤더 */}
        <section className="rounded-2xl bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-300 p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/40 bg-white/20">
              <FiShield className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold leading-tight">
                관리자 설정
              </h1>
              <p className="mt-2 text-lg opacity-90">시스템 관리 및 모니터링</p>
            </div>
          </div>
        </section>

        {/* 관리 메뉴 */}
        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 커뮤니티 관리 */}
          <div className="group cursor-pointer rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                <FiMessageSquare className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">
                  커뮤니티 관리
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  게시글, 댓글, 신고 관리
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-xs text-slate-500">
                • 게시글 모니터링 및 관리
              </div>
              <div className="text-xs text-slate-500">• 댓글 신고 처리</div>
              <div className="text-xs text-slate-500">• 커뮤니티 규칙 설정</div>
            </div>
          </div>

          {/* 가게요청 관리 */}
          <a href="/mypage/admin/business-requests" className="block">
            <div className="group cursor-pointer rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
                  <FiShoppingBag className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    가게요청 관리
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    레스토랑 등록 요청 관리
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="text-xs text-slate-500">
                  • 가게 등록 요청 검토
                </div>
                <div className="text-xs text-slate-500">
                  • 가게 정보 승인/거부
                </div>
                <div className="text-xs text-slate-500">
                  • 가게 정보 수정 요청
                </div>
              </div>
            </div>
          </a>
        </section>

        {/* 뒤로가기 버튼 */}
        <section className="mt-8 text-center">
          <a
            href="/mypage"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-600 px-6 py-3 font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            마이페이지로 돌아가기
          </a>
        </section>
      </div>
    </div>
  );
}
