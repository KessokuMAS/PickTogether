import { Link } from "react-router-dom";
import { getNaverLoginLink } from "../../api/naverApi";
import naverLogo from "./naver_logo.png"; // 네이버 로고 이미지 경로

const NaverLoginComponent = () => {
  const link = getNaverLoginLink();

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <Link
        to={link}
        className="flex items-center justify-center w-12 h-12
                   bg-[#03C75A] text-white rounded-full shadow-md
                   hover:shadow-lg transition-shadow duration-200"
      >
        <img src={naverLogo} alt="Naver logo" className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default NaverLoginComponent;
