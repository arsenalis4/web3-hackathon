import React from "react";
import HSBar from "react-horizontal-stacked-bar-chart";

const BarChart = (props) => {
  // Destructure the props
  const { totalCEXUSD, totalPoolUSD, totalDepositUSD, totalTokenUSD } = props;

  // Calculate the ratios of wallet, DEX and exchange
  const data = [
    { type: "지갑", value: ((totalTokenUSD - totalCEXUSD) / totalDepositUSD * 100).toFixed(2) },
    { type: "DEX", value: (totalPoolUSD / totalDepositUSD * 100).toFixed(2) },
    { type: "거래소", value: ((totalCEXUSD) / totalDepositUSD * 100).toFixed(2) },
  ];

  return (
      <HSBar
        height={50}
        showTextIn
        data={[
          { value: Number(data[0].value), description: `${data[0].value}%`, color: "#15417E" },
          { value: Number(data[1].value), description: `${data[1].value}%`, color: "#3C89E8" },
          { value: Number(data[2].value), description: `${data[2].value}%`, color: "#B7DCFA" },
        ]}
      />
  );
};

export default BarChart;
