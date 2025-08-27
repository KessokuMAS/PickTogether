import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiMail,
  FiAlertTriangle,
  FiX,
  FiTrash2,
  FiArrowLeft,
  FiShield,
  FiLock,
  FiUser,
  FiHeart,
} from "react-icons/fi";
import { memberApi } from "../../api/memberApi";
import { getCookie } from "../../utils/cookieUtil";

const DeleteAccountPage = () => {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [borderColor, setBorderColor] = useState("border-gray-300"); // 테두리 색상 상태 추가

  const navigate = useNavigate();

  useEffect(() => {
    const memberCookie = getCookie("member");
    if (memberCookie?.member) {
      setUserInfo(memberCookie.member);
    }
  }, []);

  // 이메일 유효성과 테두리 색상을 계산
  const emailValidation = useMemo(() => {
    if (userInfo && confirmEmail) {
      const isValid = confirmEmail === userInfo.email;
      const color = isValid ? "border-green-300" : "border-red-300";
      return { isValid, color };
    }
    return { isValid: false, color: "border-gray-300" };
  }, [userInfo, confirmEmail]);

  // 이메일 유효성 상태 동기화
  useEffect(() => {
    setIsEmailValid(emailValidation.isValid);
    setBorderColor(emailValidation.color);
  }, [emailValidation]);

  const handleEmailChange = useCallback((e) => {
    const newEmail = e.target.value;
    setConfirmEmail(newEmail);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!confirmEmail) {
      setError("이메일을 입력해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      // 현재 로그인된 사용자의 이메일을 쿠키에서 가져오기
      const memberCookie = getCookie("member");
      if (!memberCookie?.member?.email) {
        setError("로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        setIsLoading(false);
        return;
      }

      const currentUserEmail = memberCookie.member.email;
      await memberApi.deleteAccount(currentUserEmail, confirmEmail);
      setSuccess(true);

      // 3초 후 메인 페이지로 이동
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.error || "회원 탈퇴에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <FiX className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              회원 탈퇴 완료
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              회원 탈퇴가 완료되었습니다.
              <br />
              그동안 이용해주셔서 감사했습니다.
            </p>
            <div className="text-sm text-gray-500 mb-4">
              3초 후 메인 페이지로 이동합니다...
            </div>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* 로고 */}
        <div className="flex justify-center">
          <div className="flex items-center justify-center h-28 w-28 rounded-full bg-red-100">
            <FiTrash2 className="h-16 w-16 text-red-600" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원 탈퇴
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 경고 박스 */}
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center mb-3">
              <FiTrash2 className="h-4 w-4 text-orange-500 mr-2" />
              <h3 className="text-sm font-medium text-orange-800">
                탈퇴 시 주의사항
              </h3>
            </div>
            <div className="text-sm text-orange-700 space-y-1">
              <div className="flex items-start">
                <span className="text-orange-600 font-bold mr-2">❌</span>
                <span>모든 개인정보가 영구적으로 삭제됩니다</span>
              </div>
              <div className="flex items-start">
                <span className="text-orange-600 font-bold mr-2">❌</span>
                <span>참여한 펀딩 내역이 모두 사라집니다</span>
              </div>
              <div className="flex items-start">
                <span className="text-orange-600 font-bold mr-2">❌</span>
                <span>특산품 구매 내역이 모두 사라집니다</span>
              </div>
              <div className="flex items-start">
                <span className="text-orange-600 font-bold mr-2">⚠️</span>
                <span>커뮤니티 기록은 탈퇴 후에도 남아있습니다</span>
              </div>
            </div>
          </div>

          {/* 사용자 정보 */}
          {userInfo && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-center mb-3">
                <FiUser className="h-4 w-4 text-gray-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-800">
                  현재 계정 정보
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 w-12">
                    이름:
                  </span>
                  <span className="text-sm text-gray-800">
                    {userInfo.nickname || userInfo.name || "미설정"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 w-12">
                    이메일:
                  </span>
                  <span className="text-sm text-gray-800">
                    {userInfo.email}
                  </span>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="confirmEmail"
                className="block text-sm font-medium text-gray-700"
              >
                이메일 확인
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmEmail"
                  name="confirmEmail"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none sm:text-sm transition-colors ${borderColor}`}
                  placeholder="aaa@aaa.com"
                  value={confirmEmail}
                  onChange={handleEmailChange}
                />
              </div>
              <p
                className={`mt-1 text-xs flex items-center ${
                  confirmEmail && !isEmailValid
                    ? "text-red-500"
                    : isEmailValid
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <FiLock className="h-3 w-3 mr-1" />
                {confirmEmail && !isEmailValid
                  ? "입력한 이메일이 계정과 일치하지 않습니다"
                  : isEmailValid
                  ? "이메일 확인 완료! 탈퇴를 진행할 수 있습니다"
                  : "탈퇴를 위해 본인 이메일을 정확히 입력해주세요"}
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                돌아가기
              </button>
              <button
                type="submit"
                disabled={isLoading || !isEmailValid}
                className="flex-1 bg-red-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    처리중...
                  </div>
                ) : (
                  "탈퇴하기"
                )}
              </button>
            </div>
          </form>

          {/* 추가 안내 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-base font-medium text-gray-700 leading-relaxed">
                지금까지 픽투게더를 이용해 주셔서
                <br />
                <span className="text-blue-600 font-semibold">
                  진심으로 감사드립니다
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
