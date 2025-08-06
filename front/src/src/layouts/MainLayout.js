import MainMenu from "../components/menus/Mainmenu";

const MainLayout = ({ children }) => {
  return (
    <>
      <MainMenu />

      {/* 상단바 높이만큼 패딩 주기 */}
      <div className="pt-[200px]">{children}</div>
    </>
  );
};
export default MainLayout;
