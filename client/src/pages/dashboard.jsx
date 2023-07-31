import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import userAPI from "../api/userAPI";
import SideBar from "../components/sideBar";
import { getTotalBalances } from "../repos/pool/functions/getTotalBalances";

const DashboardPage = () => {
    const loc = useLocation();
    const state = loc.state;
    const email = state.email;

    const [wallets, setWallets] = useState({});
    const [totalTokens, setTotalTokens] = useState({});
    const [totalPools, setTotalPools] = useState({});
    const [totalTokenUSD, setTotalTokenUSD] = useState(0);
    const [totalPoolUSD, setTotalPoolUSD] = useState(0);
    const [totalDepositUSD, setTotalDepositUSD] = useState(0);

    // 미구현
    const [deltaDepositUSD, setDeltaDepositUSD] = useState(0);
    const [weekDepositUSD, setWeekDepositUSD] = useState(0);

    const [tokenAllocation, setTokenAllocation] = useState({});
    const [poolAllocation, setPoolAllocation] = useState({});

    useEffect(() => {
        userAPI.post("/get-wallets", {
            email: email
        }).then(res => {
            setWallets(res.data)
        });
    }, []);
    
    useEffect(() => {
        if(wallets.ethereum === undefined) return;

        const totalTokens = {};
        const totalPools = {};

        // wallets.ethereum의 각 원소에 대해 비동기 함수를 호출하고 프로미스 배열을 생성합니다.
        const promises = wallets.ethereum.map(async wallet => {
            const {ETH, tokens, pools} = await getTotalBalances(wallet);

            if(Number(ETH.balance) !== 0){
                const ethAmount = Number(ETH.balance) / Math.pow(10, 18);
                const ethPrice = ETH.price.rate;
                const ethValue = ethAmount * ethPrice;
                if(totalTokens["ETH"] === undefined){
                    totalTokens["ETH"] = {
                        amount: ethAmount,
                        price: ethPrice,
                        value: ethValue,
                    };
                } else{
                    totalTokens["ETH"].amount += ethAmount;
                    totalTokens["ETH"].price = ethPrice;
                    totalTokens["ETH"].value += ethValue;
                }   
            }

            tokens.forEach(token => {
                const symbol = token.tokenInfo.symbol;
                const amount = Number(token.balance) / Math.pow(10, Number(token.tokenInfo.decimals));
                const price = token.tokenInfo.price.rate;
                const value = amount * price;
                if(totalTokens[symbol] === undefined) {
                    totalTokens[symbol] = {
                        amount,
                        price,
                        value
                    };
                } else{
                    totalTokens[symbol].amount += amount;
                    totalTokens[symbol].price = price;
                    totalTokens[symbol].value += value;
                }
            });

            pools.forEach(pool => {
                const {id, amount0, amount1, value} = pool;
                if(totalPools[id] === undefined){
                    totalPools[id] = {
                        amount0,
                        amount1,
                        value
                    };
                } else{
                    totalPools[id].amount0 += amount0;
                    totalPools[id].amount1 += amount1;
                    totalPools[id].value += value;
                }
            })
        });

        // 모든 프로미스가 완료될 때까지 기다립니다.
        Promise.all(promises).then(()=>{
            setTotalTokens(totalTokens);
            setTotalPools(totalPools);
        })
    }, [wallets]);

    useEffect(()=>{
        if(Object.keys(totalTokens).length === 0 && Object.keys(totalPools).length === 0) return;

        if(Object.keys(totalTokens).length === 0){
            let depositUSD = 0;
            Object.keys(totalPools).forEach((pool)=>{
                depositUSD += totalPools[pool].value;
            })

            setTotalPoolUSD(depositUSD);
            setTotalDepositUSD(depositUSD);
        } else if(Object.keys(totalPools).length === 0){
            let depositUSD = 0;
            Object.keys(totalTokens).forEach((token)=>{
                depositUSD += totalTokens[token].value;
            })

            setTotalTokenUSD(depositUSD);
            setTotalDepositUSD(depositUSD);
        } else{
            let depositTokenUSD = 0;
            let depositPoolUSD = 0;
            let depositUSD = 0;
            Object.keys(totalTokens).forEach((token)=>{
                depositTokenUSD += totalTokens[token].value;
                depositUSD += totalTokens[token].value;
            })
            Object.keys(totalPools).forEach((pool)=>{
                depositPoolUSD += totalPools[pool].value;
                depositUSD += totalPools[pool].value;
            })

            setTotalTokenUSD(depositTokenUSD);
            setTotalPoolUSD(depositPoolUSD);
            setTotalDepositUSD(depositUSD);
        }
    }, [totalTokens, totalPools]);

    useEffect(()=>{
        if(totalDepositUSD === 0) return;
        const tokenAllocation = {};
        const poolAllocation = {};

        if(totalTokenUSD === 0){
            Object.keys(totalPools).forEach((pool)=>{
                const { value } = totalPools[pool];
                poolAllocation[pool] = value / totalPoolUSD;
            })
            setPoolAllocation(poolAllocation);
        } else if(totalPoolUSD === 0){
            Object.keys(totalTokens).forEach((token)=>{
                const { value } = totalTokens[token];
                tokenAllocation[token] = value / totalTokenUSD;
            })
            setTokenAllocation(tokenAllocation);
        } else{
            Object.keys(totalTokens).forEach((token)=>{
                const { value } = totalTokens[token];
                tokenAllocation[token] = value / totalTokenUSD;
            })
            Object.keys(totalPools).forEach((pool)=>{
                const { value } = totalPools[pool];
                poolAllocation[pool] = value / totalPoolUSD;
            })

            setTokenAllocation(tokenAllocation);
            setPoolAllocation(poolAllocation);
        }
    }, [totalTokens, totalPools, totalTokenUSD, totalPoolUSD, totalDepositUSD]);

    useEffect(()=>{
        if(Object.keys(tokenAllocation).length === 0 && Object.keys(poolAllocation).length === 0) return;
        console.log(tokenAllocation);
        console.log(poolAllocation);
    }, [tokenAllocation, poolAllocation]);

    return (
        <SideBar />
    )
}

export default DashboardPage;