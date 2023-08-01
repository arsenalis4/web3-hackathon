import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import historyAPI from "../api/historyAPI";
import userAPI from "../api/userAPI";
import SideBar from "../components/sideBar";
import { getUpbitBalance } from "../repos/cex/getUpbitBalance";
import { getTotalBalances } from "../repos/pool/functions/getTotalBalances";
import { formatDate } from "../utils/formatDate";
import LineChart from "../components/lineChart";
import BarChart from "../components/barChart";
import HistoryItem from "../components/historyItem";

const HistoryPage = () => {
    const loc = useLocation();
    const state = loc.state;
    const email = state.email;

    const [wallets, setWallets] = useState({});
    const [totalTokens, setTotalTokens] = useState({});
    const [totalPools, setTotalPools] = useState({});
    const [totalTokenUSD, setTotalTokenUSD] = useState(0);
    const [totalPoolUSD, setTotalPoolUSD] = useState(0);
    const [totalCEXUSD, setTotalCEXUSD] = useState(0);
    const [totalDepositUSD, setTotalDepositUSD] = useState(0);

    const [yesterDayDepositUSD, setYesterdayDepositUSD] = useState(0);
    const [deltaDepositUSD, setDeltaDepositUSD] = useState(0);
    const [weekDepositUSD, setWeekDepositUSD] = useState([]);
    const [dailyRate, setDailyRate] = useState(0);

    const [userHistory, setUserHistory] = useState([]);

    // array를 csv 문자열로 변환하는 함수
    function arrayToCSV(array) {
        // array의 각 요소를 JSON 형식의 문자열로 변환하고 쉼표로 구분하고 줄바꿈 문자로 연결한다
        return array.map(element => JSON.stringify(element)).join("\n");
    }

    // csv 파일을 다운로드하는 함수
    const downloadCSV = (array) => {
        // array를 csv 문자열로 변환한다
        let csv = arrayToCSV(array);
        // csv 문자열을 blob 객체로 만든다
        let blob = new Blob([csv], { type: "text/csv" });
        // blob 객체를 URL로 만든다
        let url = URL.createObjectURL(blob);
        // a 태그를 생성하고 href 속성에 URL을 지정한다
        let a = document.createElement("a");
        a.href = url;
        // download 속성에 파일명을 지정한다
        a.download = "userHistory.csv";
        // a 태그를 body에 추가한다
        document.body.appendChild(a);
        // a 태그를 클릭하여 다운로드를 시작한다
        a.click();
        // a 태그를 body에서 제거한다
        document.body.removeChild(a);
    }

    useEffect(() => {
        userAPI.post("/get-wallets", {
            email: email
        }).then(res => {
            setWallets(res.data)
        });

        historyAPI.post("/get-yesterday-value", {
            email: email
        }).then(res => {
            setYesterdayDepositUSD(res.data);
        })

        historyAPI.post("/get-all-history", {
            email: email
        }).then(res => {
            const history = res.data;
            const reversedHistory = [...history].reverse();
            setUserHistory(reversedHistory);
        });
    }, []);

    useEffect(() => {
        if (wallets.ethereum === undefined) return;

        const totalTokens = {};
        const totalPools = {};

        // wallets.ethereum의 각 원소에 대해 비동기 함수를 호출하고 프로미스 배열을 생성합니다.
        const promises = wallets.ethereum.map(async wallet => {
            const { ETH, tokens, pools } = await getTotalBalances(wallet);

            if (Number(ETH.balance) !== 0) {
                const ethAmount = Number(ETH.balance);
                const ethPrice = ETH.price.rate;
                const ethValue = ethAmount * ethPrice;
                if (totalTokens["ETH"] === undefined) {
                    totalTokens["ETH"] = {
                        amount: ethAmount,
                        price: ethPrice,
                        value: ethValue,
                        address: "0x0000000000000000000000000000000000000000"
                    };
                } else {
                    totalTokens["ETH"].amount += ethAmount;
                    totalTokens["ETH"].price = ethPrice;
                    totalTokens["ETH"].value += ethValue;
                }
            }

            tokens.forEach(token => {
                const symbol = token.tokenInfo.symbol;
                const amount = Number(token.balance) / Math.pow(10, Number(token.tokenInfo.decimals));
                const price = token.tokenInfo.price.rate;
                const address = token.tokenInfo.address;
                const value = amount * price;
                if (totalTokens[symbol] === undefined) {
                    totalTokens[symbol] = {
                        amount,
                        price,
                        value,
                        address
                    };
                } else {
                    totalTokens[symbol].amount += amount;
                    totalTokens[symbol].price = price;
                    totalTokens[symbol].value += value;
                }
            });

            pools.forEach(pool => {
                const { id, amount0, amount1, value } = pool;
                if (totalPools[id] === undefined) {
                    totalPools[id] = {
                        amount0,
                        amount1,
                        value
                    };
                } else {
                    totalPools[id].amount0 += amount0;
                    totalPools[id].amount1 += amount1;
                    totalPools[id].value += value;
                }
            })
        });

        // 모든 프로미스가 완료될 때까지 기다립니다.
        Promise.all(promises).then(() => {
            setTotalPools(totalPools);

            getUpbitBalance().then((tokens) => {
                let totalCEXUSD = 0;
                tokens.forEach((token) => {
                    const symbol = token.tokenInfo.symbol;
                    const amount = Number(token.balance) / Math.pow(10, Number(token.tokenInfo.decimals));
                    const price = token.tokenInfo.price.rate;
                    const value = amount * price;
                    totalCEXUSD += value;
                    if (totalTokens[symbol] === undefined) {
                        totalTokens[symbol] = {
                            amount,
                            price,
                            value,
                        };
                    } else {
                        totalTokens[symbol].amount += amount;
                        totalTokens[symbol].value += value;
                    }
                })

                setTotalCEXUSD(totalCEXUSD);
                setTotalTokens(totalTokens);
            });
        })
    }, [wallets]);

    useEffect(() => {
        if (Object.keys(totalTokens).length === 0 && Object.keys(totalPools).length === 0) return;

        if (Object.keys(totalTokens).length === 0) {
            let depositUSD = 0;
            Object.keys(totalPools).forEach((pool) => {
                depositUSD += totalPools[pool].value;
            })

            setTotalPoolUSD(depositUSD);
            setTotalDepositUSD(depositUSD);
        } else if (Object.keys(totalPools).length === 0) {
            let depositUSD = 0;
            Object.keys(totalTokens).forEach((token) => {
                depositUSD += totalTokens[token].value;
            })

            setTotalTokenUSD(depositUSD);
            setTotalDepositUSD(depositUSD);
        } else {
            let depositTokenUSD = 0;
            let depositPoolUSD = 0;
            let depositUSD = 0;
            Object.keys(totalTokens).forEach((token) => {
                depositTokenUSD += totalTokens[token].value;
                depositUSD += totalTokens[token].value;
            })
            Object.keys(totalPools).forEach((pool) => {
                depositPoolUSD += totalPools[pool].value;
                depositUSD += totalPools[pool].value;
            })

            setTotalTokenUSD(depositTokenUSD);
            setTotalPoolUSD(depositPoolUSD);
            setTotalDepositUSD(depositUSD);
        }
    }, [totalTokens, totalPools, yesterDayDepositUSD]);

    useEffect(() => {
        historyAPI.post("/get-week-value", {
            email: email
        }).then(res => {
            const todayDate = formatDate(0);
            const todayValue = {
                date: todayDate,
                totalValue: totalDepositUSD
            }

            const weekValue = res.data;
            weekValue.push(todayValue);
            setWeekDepositUSD(weekValue);
        });
    }, [totalDepositUSD]);

    useEffect(() => {
        setDeltaDepositUSD(totalDepositUSD - yesterDayDepositUSD);
        setDailyRate(((totalDepositUSD - yesterDayDepositUSD) / yesterDayDepositUSD * 100).toFixed(2));
    }, [totalDepositUSD, yesterDayDepositUSD]);

    return (
        <div className="page">
            <SideBar height={"150vh"} />
            <div className="dashboard">
                <div className="coreView">
                    <div className="coreWorth">
                        <div className="title">NET WORTH</div>
                        <div className="netWorth">
                            <div className="netWorthText">$ {totalDepositUSD.toFixed(2)}</div>
                            <div className="dailyRate">{dailyRate}%</div>
                        </div>
                    </div>
                    <div className="subWorth">
                        <div className="subView">
                            <div className="title">CLAIMABLE</div>
                            <div>N/A</div>
                        </div>
                        <div className="subView">
                            <div className="title">TOTAL ASSET</div>
                            <div>$ {totalDepositUSD.toFixed(2)}</div>
                        </div>
                        <div className="subView">
                            <div className="title">TOTAL DEBT</div>
                            <div>N/A</div>
                        </div>
                    </div>
                    <div className="barView">
                        <BarChart totalCEXUSD={totalCEXUSD} totalDepositUSD={totalDepositUSD} totalPoolUSD={totalPoolUSD} totalTokenUSD={totalTokenUSD} />
                        <div className="barChartName">
                            <img src="img/Bar Chart Name.svg" />
                        </div>
                    </div>
                </div>
                <div className="graphView">
                    <div className="graphSubWorth">
                        <div className="title">NET WORTH GRAPH</div>
                        <div className="deltaDeposit">{(deltaDepositUSD > 0) ? `+ $ ${Math.abs(deltaDepositUSD).toFixed(2)}` : ((deltaDepositUSD === 0) ? "$ 0" : `- $ ${Math.abs(deltaDepositUSD).toFixed(2)}`)}</div>
                    </div>
                    <LineChart weekDepositUSD={weekDepositUSD} />
                </div>
                <div className="listView">
                    <div className="view">
                        <div className="graphSubWorth" style={{ "padding-left": "7.5vw" }}>
                            <div className="title">HISTORY</div>
                            <div>
                                <img src="img/_Button_.svg" onClick={() => { downloadCSV(userHistory) }} />
                            </div>
                        </div>
                        <div style={{ "display": "flex", "justify-content": "center" }}>
                            <div className="scrollView" style={{ "min-height": "50vh", "max-height": "50vh" }}>
                                {userHistory.map((history, index) => {
                                    return (
                                        <HistoryItem history={history} index={index} userHistory={userHistory} />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HistoryPage;