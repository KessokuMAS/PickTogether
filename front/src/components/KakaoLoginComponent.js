import { Link } from "react-router-dom";
import { getKakaoLoginLink } from "../api/kakaoApi";
import kakaoLogo from "./kakao_logo.png"; // 로고 경로

const KakaoLoginComponent = () => {
  const link = getKakaoLoginLink();

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <Link
        to={link}
        className="flex items-center justify-center gap-3 w-full px-5 py-3
                   bg-[#FEE500] text-black font-bold rounded-lg shadow-md
                   "
      >
        <img src={kakaoLogo} alt="Kakao logo" className="w-7 h-7" />
        <span className="text-lg">카카오 계정으로 로그인</span>
      </Link>
    </div>
  );
};

export default KakaoLoginComponent;
