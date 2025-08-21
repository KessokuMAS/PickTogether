import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getMyPageInfo,
  updateMemberProfile,
  updateMemberPassword,
} from "../../api/memberApi";
import { getCookie } from "../../utils/cookieUtil";
import {
  FiUser,
  FiMail,
  FiLock,
  FiSave,
  FiX,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
} from "react-icons/fi";

export default function ProfileEditComponent() {
  const navigate = useNavigate();
  const { userInfo, checkAuthStatus } = useAuth();
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSocialLogin, setIsSocialLogin] = useState(false);

  // 폼 상태
  const [formData, setFormData] = useState({
    nickname: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 에러 상태
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // 비밀번호 표시 상태
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    loadMemberInfo();
  }, []);

  const loadMemberInfo = async () => {
    try {
      setIsLoading(true);
      const data = await getMyPageInfo();
      setMember(data);

      // 소셜 로그인 여부 확인
      // 1. 카카오 토큰이 있거나
      // 2. 소셜 타입이 설정되어 있거나
      // 3. 이메일이 소셜 로그인 형식인 경우
      const memberCookie = getCookie("member");
      const kakaoToken = localStorage.getItem("kakaoAccessToken");
      const isSocial =
        kakaoToken ||
        (data.socialType && data.socialType !== "local") ||
        (data.email &&
          (data.email.includes("@kakao.com") ||
            data.email.includes("@google.com") ||
            data.email.includes("@naver.com")));
      setIsSocialLogin(isSocial);

      // 폼 데이터 초기화
      setFormData({
        nickname: data.nickname || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("회원 정보 로딩 실패:", error);
      setMessage("회원 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 닉네임 검증
    if (!formData.nickname.trim()) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    } else if (formData.nickname.length < 2 || formData.nickname.length > 20) {
      newErrors.nickname = "닉네임은 2~20자 사이여야 합니다.";
    }

    // 일반 로그인의 경우 비밀번호 변경 시 검증
    if (!isSocialLogin) {
      if (formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword) {
          newErrors.currentPassword = "현재 비밀번호를 입력해주세요.";
        }

        if (formData.newPassword && formData.newPassword.length < 4) {
          newErrors.newPassword = "새 비밀번호는 4자 이상이어야 합니다.";
        }

        if (
          formData.newPassword &&
          formData.confirmPassword &&
          formData.newPassword !== formData.confirmPassword
        ) {
          newErrors.confirmPassword = "새 비밀번호가 일치하지 않습니다.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      // 닉네임 업데이트
      await updateMemberProfile({ nickname: formData.nickname });

      // 일반 로그인의 경우 비밀번호 업데이트
      if (!isSocialLogin && formData.newPassword) {
        await updateMemberPassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
      }

      setMessage("회원 정보가 성공적으로 수정되었습니다.");
      setIsEditing(false);

      // AuthContext 업데이트
      checkAuthStatus();

      // 폼 초기화
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("회원 정보 수정 실패:", error);
      console.error("에러 상세 정보:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 403) {
        setMessage("접근 권한이 없습니다. 다시 로그인해주세요.");
      } else if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage("회원 정보 수정에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setMessage("");
    // 원래 데이터로 복원
    setFormData({
      nickname: member.nickname || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleGoBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* 뒤로가기 버튼 - 수정 모드가 아닐 때만 표시 */}
      {!isEditing && (
        <div className="mb-4">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>뒤로가기</span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">회원 정보 수정</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FiSave className="w-4 h-4" />
            수정하기
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.includes("성공")
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 접근성을 위한 숨겨진 username 필드 */}
        <input
          type="hidden"
          name="username"
          value={member.email || ""}
          autoComplete="username"
        />

        {/* 닉네임 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiUser className="inline w-4 h-4 mr-2" />
            닉네임
          </label>
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isEditing ? "bg-white" : "bg-gray-100"
            } ${errors.nickname ? "border-red-500" : "border-gray-300"}`}
            placeholder="닉네임을 입력하세요"
          />
          {errors.nickname && (
            <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
          )}
        </div>

        {/* 이메일 표시 (수정 불가) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiMail className="inline w-4 h-4 mr-2" />
            이메일
          </label>
          <input
            type="email"
            value={member.email || ""}
            disabled
            autoComplete="username"
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500"
            placeholder="이메일"
          />
          <p className="mt-1 text-sm text-gray-500">
            이메일은 수정할 수 없습니다.
          </p>
        </div>

        {/* 비밀번호 변경 (일반 로그인만) */}
        {!isSocialLogin && isEditing && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800">비밀번호 변경</h3>

            {/* 현재 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiLock className="inline w-4 h-4 mr-2" />
                현재 비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.currentPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="현재 비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* 새 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiLock className="inline w-4 h-4 mr-2" />새 비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.newPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="새 비밀번호를 입력하세요 (4자 이상)"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* 새 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiLock className="inline w-4 h-4 mr-2" />새 비밀번호 확인
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 소셜 로그인 안내 */}
        {isSocialLogin && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>소셜 로그인 계정</strong>
              <br />
              소셜 로그인 계정은 닉네임만 수정할 수 있습니다. 이메일과
              비밀번호는 소셜 서비스에서 관리됩니다.
            </p>
          </div>
        )}

        {/* 일반 로그인 안내 */}
        {!isSocialLogin && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="mt-1 text-sm text-green-800">
              <strong>일반 로그인 계정</strong>
              <br />
              일반 로그인 계정은 닉네임과 비밀번호를 수정할 수 있습니다.
              이메일은 수정할 수 없습니다.
            </p>
          </div>
        )}

        {/* 버튼 영역 */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiSave className="w-4 h-4" />
              )}
              저장하기
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              <FiX className="w-4 h-4" />
              취소
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
