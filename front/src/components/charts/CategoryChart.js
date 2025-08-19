import { useEffect, useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";

const CategoryChart = ({ userEmail }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/chart/category?user_email=${userEmail}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [userEmail]);

  if (!data.length) return <p>📭 데이터가 없습니다.</p>;

  return (
    <Plot
      data={[
        {
          labels: data.map((d) => d.category_name),
          values: data.map((d) => d.order_count),
          type: "pie",
          hole: 0.3,
          textinfo: "label+percent",
        },
      ]}
      layout={{ title: "카테고리별 펀딩 비율" }}
      style={{ width: "100%", height: "400px" }}
    />
  );
};

export default CategoryChart;
