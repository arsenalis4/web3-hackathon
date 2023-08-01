import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import historyAPI from "../api/historyAPI";
import userAPI from "../api/userAPI";
import BarChart from "../components/barChart";
import LineChart from "../components/lineChart";
import SideBar from "../components/sideBar";
import { getUpbitBalance } from "../repos/cex/getUpbitBalance";
import { getTotalBalances } from "../repos/pool/functions/getTotalBalances";
import { compareByValue } from "../utils/compareByValue";
import { formatDate } from "../utils/formatDate";
import { sortDictionary } from "../utils/sortDictionary";
import TokenPieChart from "../components/tokenPieChart";
import PoolPieChart from "../components/poolPieChart";

const DashboardPage = () => {
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

    const [tokenAllocation, setTokenAllocation] = useState({});
    const [poolAllocation, setPoolAllocation] = useState({});

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
    }, [totalDepositUSD])

    useEffect(() => {
        setDeltaDepositUSD(totalDepositUSD - yesterDayDepositUSD);
        setDailyRate(((totalDepositUSD - yesterDayDepositUSD) / yesterDayDepositUSD * 100).toFixed(2));
    }, [totalDepositUSD, yesterDayDepositUSD])

    useEffect(() => {
        if (totalDepositUSD === 0) return;
        const tokenAllocation = {};
        const poolAllocation = {};

        if (totalTokenUSD === 0) {
            Object.keys(totalPools).forEach((pool) => {
                const dex = pool.split("/")[0];
                const { value } = totalPools[pool];
                if (poolAllocation[dex] === undefined) poolAllocation[dex] = value / totalPoolUSD;
                else poolAllocation[dex] += value / totalPoolUSD;
            })
            setPoolAllocation(poolAllocation);
        } else if (totalPoolUSD === 0) {
            Object.keys(totalTokens).forEach((token) => {
                const { value } = totalTokens[token];
                tokenAllocation[token] = value / totalTokenUSD;
            })
            setTokenAllocation(tokenAllocation);
        } else {
            Object.keys(totalTokens).forEach((token) => {
                const { value } = totalTokens[token];
                tokenAllocation[token] = value / totalTokenUSD;
            })
            Object.keys(totalPools).forEach((pool) => {
                const dex = pool.split("/")[0];
                const { value } = totalPools[pool];
                if (poolAllocation[dex] === undefined) poolAllocation[dex] = value / totalPoolUSD;
                else poolAllocation[dex] += value / totalPoolUSD;
            })

            setTokenAllocation(tokenAllocation);
            setPoolAllocation(poolAllocation);
        }
    }, [totalTokens, totalPools, totalTokenUSD, totalPoolUSD, totalDepositUSD]);

    return (
        <div className="page">
            <SideBar />
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
                <div className="pieView">
                    <div className="pie">
                        <div className="title">TOKEN ALLOCATION</div>
                        <div><TokenPieChart tokenAllocation={tokenAllocation} /></div>
                    </div>
                    <div className="pie">
                        <div className="title">PROTOCOL ALLOCATION</div>
                        <div><PoolPieChart poolAllocation={poolAllocation} /></div>
                    </div>
                </div>
                <div className="listView">
                    <div className="view">
                        <div className="title" style={{ "padding-left": "7.5vw" }}>WALLET</div>
                        <div style={{"display": "flex", "justify-content": "center"}}><div className="scrollView">
                            {Object.keys(compareByValue(totalTokens)).map((token) => {
                                return (
                                    <div className="scrollItem">
                                        <div className="scrollField">{token}</div>
                                        <div className="scrollField">
                                            <div>AMOUNT</div>
                                            <div>{(totalTokens[token].amount).toFixed(4)}개 </div>
                                        </div>
                                        <div className="scrollField">
                                            <div>PRICE</div>
                                            <div>${(totalTokens[token].price).toFixed(4)}</div>
                                        </div>
                                        <div className="scrollField">
                                            <div>TOTAL ESTIMATED</div>
                                            <div>${(totalTokens[token].value).toFixed(4)}</div>
                                        </div>
                                    </div>
                                );
                            })}</div>
                        </div>
                    </div>
                    <div className="view">
                        <div className="title" style={{ "padding-left": "7.5vw" }}>FARMING</div>
                        <div style={{"display": "flex", "justify-content": "center"}}><div className="scrollView">
                            {Object.keys(compareByValue(totalPools)).map((pool) => {
                                return (
                                    <div className="scrollItem">
                                        <div className="scrollField">
                                            <div>{pool.split("/")[1]}</div>
                                            <div>{pool.split("/")[0]}</div>
                                        </div>
                                        <div className="scrollField">
                                            <div>AMOUNT</div>
                                            <div> {(totalPools[pool].amount0).toFixed(4)} - {(totalPools[pool].amount1).toFixed(4)}</div>
                                        </div>
                                        <div className="scrollField">
                                            <div>APY</div>
                                            <div>N/A</div>
                                        </div>
                                        <div className="scrollField">
                                            <div>TOTAL ESTIMATED</div>
                                            <div>${(totalPools[pool].value).toFixed(4)}</div>
                                        </div>
                                    </div>
                                );
                            })}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage;