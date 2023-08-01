import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import historyAPI from "../api/historyAPI";
import userAPI from "../api/userAPI";
import SideBar from "../components/sideBar";
import { getUpbitBalance } from "../repos/cex/getUpbitBalance";
import { getTotalBalances } from "../repos/pool/functions/getTotalBalances";
import { compareByValue } from "../utils/compareByValue";
import { formatDate } from "../utils/formatDate";
import { sortDictionary } from "../utils/sortDictionary";
import TokenPieChart from "../components/tokenPieChart";
import PoolPieChart from "../components/poolPieChart";
import { recommendUniswapV3Pool } from "../repos/pool/functions/recommendUniswapV3Pool";

const PoolPage = () => {
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
    const [dailyRate, setDailyRate] = useState(0);

    const [tokenAllocation, setTokenAllocation] = useState({});
    const [poolAllocation, setPoolAllocation] = useState({});

    const [recommendedUniswapPool, setRecommendedUniswapPool] = useState([]);

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
                recommendUniswapV3Pool(totalTokens).then((pools) => {
                    console.log(pools);
                    setRecommendedUniswapPool(pools);
                })
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
            <SideBar height={"150vh"}/>
            <div className="poolContent">
                <div className="coreView" style={{"height": "50vh"}}>
                    <div className="coreWorth">
                        <div className="title">NET WORTH</div>
                        <div className="netWorth">
                            <div className="netWorthText">$ {totalDepositUSD.toFixed(2)}</div>
                            <div className="dailyRate">{dailyRate}%</div>
                        </div>
                    </div>
                    <div className="pieView" style={{"padding-left": "0vh"}}>
                        <div className="pie">
                            <div className="title">TOKEN ALLOCATION</div>
                            <div><TokenPieChart tokenAllocation={tokenAllocation} /></div>
                        </div>
                        <div className="pie">
                            <div className="title">PROTOCOL ALLOCATION</div>
                            <div><PoolPieChart poolAllocation={poolAllocation} /></div>
                        </div>
                    </div>
                </div>
                <div className="listView">
                    <div className="view">
                        <div className="title" style={{ "padding-left": "7.5vw" }}>DEX POOLS</div>
                        <div style={{"color": "white", "padding-left": "7.5vw", "font-size": "1.25rem"}}>"What is the most suitable DEX Pool for my crypto asset portfolio?"</div>
                        <div style={{"display": "flex", "justify-content": "center"}}><div className="scrollView" style={{"min-height": "50vh", "max-height": "50vh"}}>
                            {recommendedUniswapPool.map((pool) => {
                                return (
                                    <div className="scrollItem">
                                        <div className="scrollField" style={{"alignItems": "center"}}>
                                            <div>{`${pool.token0Symbol}-${pool.token1Symbol}`}</div>
                                        </div>
                                        <div className="scrollField" style={{"alignItems": "center"}}>
                                            <div>{pool.dex}</div>
                                        </div>
                                        <div className="scrollField" style={{"alignItems": "center"}}>
                                            <div>FEE TIER</div>
                                            <div>{Number(pool.feeTier) / 1e5}</div>
                                        </div>
                                        <div className="scrollField" style={{"alignItems": "center"}}>
                                            <div>APY</div>
                                            <div>N/A</div>
                                        </div>
                                        <div className="scrollField" style={{"alignItems": "center"}}>
                                            <div>TVL</div>
                                            <div>{`$${(Number(pool.tvl) / 1e6).toFixed(2)}M`}</div>
                                        </div>
                                        <div className="scrollField" style={{"alignItems": "center"}}>
                                            <div className="addBtn"><a href="https://app.uniswap.org/" style={{"text-decoration": "none", "color": "white"}}>ADD</a></div>
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

export default PoolPage;