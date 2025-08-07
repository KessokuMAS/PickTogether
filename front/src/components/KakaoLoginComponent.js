import { Link } from "react-router-dom";
import { getKakaoLoginLink } from "../api/kakaoApi";
import kakaoLogo from "./kakao_logo.png"; // 로고 경로

const KakaoLoginComponent = () => {
  const link = getKakaoLoginLink();

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <Link
        to={link}
        className="flex items-center justify-center w-12 h-12
                   bg-[#FEE500] text-black rounded-full shadow-md
                   hover:shadow-lg transition-shadow duration-200"
      >
        <img src={kakaoLogo} alt="Kakao logo" className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default KakaoLoginComponent;
