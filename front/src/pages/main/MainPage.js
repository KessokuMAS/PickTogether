import MainLayout from "../../layouts/MainLayout";

const MainPage = () => {
  return (
    <>        

      <MainLayout>
        {/* 🔍 검색창 */}
        <div className="flex flex-col justify-center items-center mb-4">
          <input
            type="text"
            placeholder="원하는 상품을 검색하세요"
            className="w-[1200px] pl-12 pr-4 py-3 rounded-2xl border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400"
          />
          
        </div>
      <div className="flex flex-col justify-center items-center">
      <img src="/products3.PNG"/>
      <img src="/products.PNG"/>
      <img src="/products2.PNG"/>
      
</div>
      </MainLayout>
    </>
  );
};

export default MainPage;
