// App.js

import { Suspense, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import LoadingSpinner from "./components/member/LoadingSpinner";
import { RouterProvider } from "react-router-dom";
import root from "./router/root";
import { KAKAO_MAP_CONFIG } from "./config/constants";

function App() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_CONFIG.MAP_API_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log("✅ Kakao Maps SDK 로드 완료");
      });
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <RouterProvider router={root} />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
