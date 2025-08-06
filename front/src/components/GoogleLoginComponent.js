import { Link } from "react-router-dom";
import { getGoogleLoginLink } from "../api/googleApi";
import googleLogo from "./google_logo.png"; // 구글 로고 이미지 경로

const GoogleLoginComponent = () => {
  const link = getGoogleLoginLink();

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <Link
        to={link}
        className="flex items-center justify-center gap-3 w-full px-5 py-3
                   bg-white text-gray-700 font-bold rounded-lg shadow-md
                   "
      >
        <img src={googleLogo} alt="Google logo" className="w-7 h-7" />
        <span className="text-lg">Google 계정으로 로그인</span>
      </Link>
    </div>
  );
};

export default GoogleLoginComponent;
