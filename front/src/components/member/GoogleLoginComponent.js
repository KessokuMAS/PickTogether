import { Link } from "react-router-dom";
import { getGoogleLoginLink } from "../../api/googleApi";
import { FcGoogle } from "react-icons/fc"; // 구글 아이콘

const GoogleLoginComponent = () => {
  const link = getGoogleLoginLink();

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <Link
        to={link}
        className="flex items-center justify-center w-12 h-12
                   bg-white text-gray-700 rounded-full shadow-md
                   hover:shadow-lg transition-shadow duration-200"
      >
        <FcGoogle size={24} />
      </Link>
    </div>
  );
};

export default GoogleLoginComponent;
