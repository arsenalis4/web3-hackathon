import React from "react";
import Chart from "chart.js/auto"
import { Pie } from "react-chartjs-2";
import { sortDictionary } from "../utils/sortDictionary";

const TokenPieChart = (props) => {
    const { poolAllocation } = props;
    const poolLabels = Object.keys(sortDictionary(poolAllocation));
    let labels = [];
    let poolData = [];
    if(poolLabels.length > 5) {
        labels = poolLabels.slice(0, 5);
        labels.push("Others");
        poolData = poolLabels.slice(0, 5).map((pool) => poolAllocation[pool] * 100);
        const otherPools = poolLabels.slice(5).map((pool) => poolAllocation[pool]).reduce((a, b) => a + b, 0)
        poolData.push(otherPools * 100);
      } else{
        labels = poolLabels;
        poolData = poolLabels.map((pool) => poolAllocation[pool] * 100);
    }

    const data = {
        labels: labels,
        datasets: [
            {
                // label: "My First dataset",
                backgroundColor: ["#1668DC", "#15417E", "#65A9F3", "#301C4D", "#642AB5", "#854ECA"],
                data: poolData,
            },
        ],
    };

    // const options = {        
    //   legend: {
    //     display: false
    //   }
    // }

    return (
        <Pie data={data}/>
    );
};

export default TokenPieChart;
