import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAccessToken, getMemberWithAccessToken } from "../../api/naverApi";
import { useAuth } from "../../context/AuthContext";

const NaverCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasHandledRef = useRef(false);
  const processingRef = useRef(false);

  const authCode = searchParams.get("code");
  const state = searchParams.get("state");

  useEffect(() => {
    if (hasHandledRef.current || processingRef.current) return;
    if (!authCode) {
      console.error("인가 코드가 없습니다.");
      navigate("/member/login");
      return;
    }

    const socialLoginFlow = async () => {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        console.log("네이버 로그인 시작 - 인가 코드:", authCode);

        const naverAccessToken = await getAccessToken(authCode, state);
        if (!naverAccessToken) {
          throw new Error("Naver accessToken을 못 받았습니다.");
        }

        const data = await getMemberWithAccessToken(naverAccessToken);
        const { accessToken, member } = data;

        if (!member?.email) {
          throw new Error("유효한 사용자 정보가 아닙니다.");
        }

        // AuthContext의 login 함수 사용
        login(accessToken, member);

        hasHandledRef.current = true;
        navigate("/main");
      } catch (err) {
        console.error("소셜 로그인 처리 중 에러:", err.message || err);
        navigate("/member/login");
      } finally {
        processingRef.current = false;
      }
    };

    socialLoginFlow();
  }, [authCode, state, navigate, login]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
          <span className="text-lg">네이버 로그인 처리 중...</span>
        </div>
        {authCode && (
          <p className="text-sm text-gray-500 mt-2">
            인가 코드: {authCode.substring(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
};

export default NaverCallbackPage;
