import React from "react";
import Chart from "chart.js/auto"
import { Pie } from "react-chartjs-2";
import { sortDictionary } from "../utils/sortDictionary";

const TokenPieChart = (props) => {
    const { tokenAllocation } = props;
    const tokenLabels = Object.keys(sortDictionary(tokenAllocation));
    let labels = [];
    let tokenData = [];
    if(tokenLabels.length > 5) {
        labels = tokenLabels.slice(0, 5);
        labels.push("Others");
        tokenData = tokenLabels.slice(0, 5).map((token) => tokenAllocation[token] * 100);
        const otherTokens = tokenLabels.slice(5).map((token) => tokenAllocation[token]).reduce((a, b) => a + b, 0)
        tokenData.push(otherTokens * 100);
      } else{
        labels = tokenLabels;
        tokenData = tokenLabels.map((token) => tokenAllocation[token] * 100);
    }

    const data = {
        labels: labels,
        datasets: [
            {
                // label: "My First dataset",
                backgroundColor: ["#1668DC", "#15417E", "#65A9F3", "#301C4D", "#642AB5", "#854ECA"],
                data: tokenData,
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
