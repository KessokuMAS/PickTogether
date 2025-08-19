import React from "react";
import MainLayout from "../../layouts/MainLayout";
import ForOneListComponent from "../../components/forone/ForOneListComponent";
import ForOneIndexComponent from "../../components/forone/ForOneIndexComponent";

const ForOneIndexPage = () => {
  return (
    <div>
      <MainLayout />
      <ForOneIndexComponent />
      <ForOneListComponent />
    </div>
  );
};

export default ForOneIndexPage;
