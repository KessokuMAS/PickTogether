// src/components/RestaurantChart.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";

const RestaurantChart = ({ userEmail }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/chart/restaurant?user_email=${userEmail}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [userEmail]);

  if (!data.length) {
    return <p>📭 데이터가 없습니다.</p>;
  }

  return (
    <Plot
      data={[
        {
          x: data.map((d) => d.restaurant_name),
          y: data.map((d) => d.order_count),
          type: "bar",
          text: data.map((d) => d.order_count), // 막대 위 숫자
          textposition: "outside",
          marker: { color: "skyblue" },
        },
      ]}
      layout={{
        title: `${userEmail}님의 자주 펀딩한 식당 TOP5`,
        xaxis: { title: "식당명" },
        yaxis: { title: "주문 횟수", dtick: 1 },
        margin: { t: 50, b: 100 }, // 아래쪽 공간 확보
      }}
      style={{ width: "100%", height: "400px" }}
    />
  );
};

export default RestaurantChart;
