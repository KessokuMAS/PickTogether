import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";

const PageWrapper = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 페이지 경로가 변경될 때마다 스크롤을 맨 위로 이동
    window.scrollTo(0, 0);
  }, [pathname]);

  return <Outlet />;
};

export default PageWrapper;
