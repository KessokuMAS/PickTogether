import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/member/LoadingSpinner";
import WishlistDropdown from "../components/common/WishlistDropdown";

// Lazy import for MainMenu
const MainMenu = lazy(() => import("../components/menus/Mainmenu"));

const MainLayout = ({ children }) => {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <MainMenu />
      </Suspense>

      {/* 상단바 높이만큼 패딩 주기 */}
      <div className="pt-[200px] ">{children}</div>

      {/* 찜 목록 드롭다운 */}
      <WishlistDropdown />
    </>
  );
};
export default MainLayout;
