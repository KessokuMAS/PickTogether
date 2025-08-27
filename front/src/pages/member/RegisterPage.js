import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiCheck,
} from "react-icons/fi";
import { memberApi } from "../../api/memberApi";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    memberType: "USER", // 기본값은 일반 사용자
    businessNumber: "", // 사업자 등록번호 추가
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailChecked, setEmailChecked] = useState(false); // 이메일 중복 확인 상태 추가
  const [isCheckingEmail, setIsCheckingEmail] = useState(false); // 이메일 중복 확인 중 상태 추가

  // 자영업자 인증 관련 상태 추가
  const [businessNumberError, setBusinessNumberError] = useState("");
  const [businessNumberChecked, setBusinessNumberChecked] = useState(false);
  const [isCheckingBusinessNumber, setIsCheckingBusinessNumber] =
    useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 이메일 입력 시 에러 초기화 및 중복 확인 상태 초기화
    if (name === "email") {
      setEmailError("");
      setEmailChecked(false);
    }

    // 사업자 등록번호 입력 시 에러 초기화 및 인증 상태 초기화
    if (name === "businessNumber") {
      setBusinessNumberError("");
      setBusinessNumberChecked(false);
    }
  };

  // 이메일 중복 확인 함수 추가
  const handleEmailCheck = async () => {
    if (!formData.email) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setIsCheckingEmail(true);
    setEmailError("");

    try {
      const result = await memberApi.checkEmailDuplicate(formData.email);

      if (result.duplicate) {
        setEmailError("이미 사용 중인 이메일입니다.");
        setEmailChecked(false);
      } else {
        setEmailError("사용 가능한 이메일입니다.");
        setEmailChecked(true);
      }
    } catch (error) {
      setEmailError("이메일 중복 확인에 실패했습니다.");
      setEmailChecked(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // 사업자 등록번호 입력 시 자동으로 하이픈 추가
  const handleBusinessNumberChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 추출

    // 10자리까지만 입력 가능
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    // XXX-XX-XXXXX 형식으로 변환
    let formattedValue = "";
    if (value.length >= 3) {
      formattedValue += value.slice(0, 3);
      if (value.length >= 5) {
        formattedValue += "-" + value.slice(3, 5);
        if (value.length >= 10) {
          formattedValue += "-" + value.slice(5, 10);
        } else {
          formattedValue += "-" + value.slice(5);
        }
      } else {
        formattedValue += "-" + value.slice(3);
      }
    } else {
      formattedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      businessNumber: formattedValue,
    }));

    // 에러 초기화 및 인증 상태 초기화
    setBusinessNumberError("");
    setBusinessNumberChecked(false);
  };

  // 사업자 등록번호 인증 함수 추가
  const handleBusinessNumberCheck = async () => {
    if (!formData.businessNumber) {
      setBusinessNumberError("사업자 등록번호를 입력해주세요.");
      return;
    }

    // 하이픈 제거 후 숫자만 추출하여 10자리인지 확인
    const numbersOnly = formData.businessNumber.replace(/[^0-9]/g, "");
    if (numbersOnly.length !== 10) {
      setBusinessNumberError("사업자 등록번호는 10자리 숫자로 입력해주세요.");
      return;
    }

    setIsCheckingBusinessNumber(true);
    setBusinessNumberError("");

    try {
      // 시연용으로 간단한 검증 (실제로는 API 호출)
      // 10자리 숫자면 인증 성공으로 처리
      setTimeout(() => {
        setBusinessNumberError("사업자 등록번호 인증이 완료되었습니다.");
        setBusinessNumberChecked(true);
        setIsCheckingBusinessNumber(false);
      }, 1000);
    } catch (error) {
      setBusinessNumberError("사업자 등록번호 인증에 실패했습니다.");
      setBusinessNumberChecked(false);
      setIsCheckingBusinessNumber(false);
    }
  };

  const validateForm = () => {
    // 이메일 중복 확인 여부 검증
    if (!emailChecked) {
      setError("이메일 중복 확인을 해주세요.");
      return false;
    }

    // 자영업자인 경우 사업자 등록번호 인증 여부 검증
    if (formData.memberType === "BUSINESS_OWNER" && !businessNumberChecked) {
      setError("사업자 등록번호 인증을 완료해주세요.");
      return false;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return false;
    }

    // 비밀번호 확인 검증
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }

    // 이름 검증
    if (formData.name.trim().length < 2) {
      setError("이름을 입력해주세요.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await memberApi.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        memberType: formData.memberType,
      });

      // 회원가입 성공 시 로그인 페이지로 이동
      navigate("/member/login");
    } catch (error) {
      setError(error.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* 로고 */}
        <div className="flex justify-center">
          <Link
            to="/"
            className="flex items-center gap-3 text-gray-900 hover:text-blue-600 transition-colors"
          >
            <img src="/logo.png" alt="PickTogether" className="h-28 w-auto" />
          </Link>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원가입
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          펀딩 프로젝트를 시작하려면 회원가입하세요
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 이름 입력 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                이름
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* 이메일 입력 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full pl-10 pr-24 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    emailChecked
                      ? "border-green-300"
                      : emailError
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    type="button"
                    onClick={handleEmailCheck}
                    disabled={isCheckingEmail || !formData.email}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      isCheckingEmail || !formData.email
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isCheckingEmail ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        확인중
                      </div>
                    ) : (
                      "중복확인"
                    )}
                  </button>
                </div>
              </div>
              {emailError && (
                <p
                  className={`mt-1 text-sm ${
                    emailChecked ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {emailError}
                </p>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 비밀번호 확인 입력 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 확인
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 회원 유형 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                회원 유형
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="user"
                    name="memberType"
                    type="radio"
                    value="USER"
                    checked={formData.memberType === "USER"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor="user"
                    className="ml-3 block text-sm text-gray-700"
                  >
                    일반 사용자
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="businessOwner"
                    name="memberType"
                    type="radio"
                    value="BUSINESS_OWNER"
                    checked={formData.memberType === "BUSINESS_OWNER"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor="businessOwner"
                    className="ml-3 block text-sm text-gray-700"
                  >
                    자영업자
                  </label>
                </div>
              </div>
            </div>

            {/* 자영업자 사업자 등록번호 입력 필드 */}
            {formData.memberType === "BUSINESS_OWNER" && (
              <div>
                <label
                  htmlFor="businessNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  사업자 등록번호
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCheck className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="businessNumber"
                    name="businessNumber"
                    type="text"
                    autoComplete="off"
                    required
                    disabled={businessNumberChecked}
                    maxLength={12}
                    className={`appearance-none block w-full pl-10 pr-24 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      businessNumberChecked
                        ? "bg-gray-100 border-green-300"
                        : businessNumberError
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="XXX-XX-XXXXX"
                    value={formData.businessNumber}
                    onChange={handleBusinessNumberChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="button"
                      onClick={handleBusinessNumberCheck}
                      disabled={
                        isCheckingBusinessNumber ||
                        !formData.businessNumber ||
                        businessNumberChecked
                      }
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        businessNumberChecked
                          ? "bg-green-100 text-green-700 cursor-not-allowed"
                          : isCheckingBusinessNumber || !formData.businessNumber
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {businessNumberChecked ? (
                        <div className="flex items-center">
                          <FiCheck className="w-3 h-3 mr-1" />
                          인증완료
                        </div>
                      ) : isCheckingBusinessNumber ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          확인중
                        </div>
                      ) : (
                        "인증"
                      )}
                    </button>
                  </div>
                </div>
                {businessNumberError && (
                  <p
                    className={`mt-1 text-sm ${
                      businessNumberChecked ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {businessNumberError}
                  </p>
                )}
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* 회원가입 버튼 */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    회원가입 중...
                  </div>
                ) : (
                  "회원가입"
                )}
              </button>
            </div>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  이미 계정이 있으신가요?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/member/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
