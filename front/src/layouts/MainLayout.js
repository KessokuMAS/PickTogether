import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/member/LoadingSpinner";

// Lazy import for MainMenu
const MainMenu = lazy(() => import("../components/menus/Mainmenu"));

const MainLayout = ({ children }) => {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <MainMenu />
      </Suspense>

      {/* 상단바 높이만큼 패딩 주기 */}
      <div className="pt-[200px]">{children}</div>
    </>
  );
};
export default MainLayout;
