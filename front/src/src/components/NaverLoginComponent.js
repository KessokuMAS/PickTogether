import { Link } from "react-router-dom";
import { getNaverLoginLink } from "../api/naverApi";
import naverLogo from "./naver_logo.png"; // 네이버 로고 이미지 경로

const NaverLoginComponent = () => {
  const link = getNaverLoginLink();

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <Link
        to={link}
        className="flex items-center justify-center gap-3 w-full px-5 py-3
                   bg-[#03C75A] text-white font-bold rounded-lg shadow-md
                   "
      >
        <img src={naverLogo} alt="Naver logo" className="w-7 h-7" />
        <span className="text-lg ">Naver 계정으로 로그인</span>
      </Link>
    </div>
  );
};

export default NaverLoginComponent;
