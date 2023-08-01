import React from "react";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";
import { formatDate } from "../utils/formatDate";

const LineChart = (props) => {
    const { weekDepositUSD } = props;
    let labels = [];
    let weekData = [];

    for(var i = 6; i >= 0; i--) {
        const date = formatDate(i);
        let dailyData = weekDepositUSD.map((data) => {if(data.date === date) return data.totalValue});
        dailyData = dailyData.filter((data) => data !== undefined);
        labels.push(formatDate(i))
        if(dailyData.length === 0) {
            weekData.push(0);
        } else{
            weekData.push(dailyData[0]);
        }
    }
    
    const data = {
        labels: labels,
        datasets: [
            {
                // label: "My First dataset",
                backgroundColor: "#5B8FF9",
                borderColor: "#5B8FF9",
                data: weekData,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            display: false,
          },
          title: {
            display: false,
            text: 'Chart.js Line Chart',
          },
        },
      };
    return (
        <Line data={data} options={options}/>
    );
};

export default LineChart;