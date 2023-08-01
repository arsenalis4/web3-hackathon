import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import userAPI from "../api/userAPI";
import SideBar from "../components/sideBar";
import { getTotalBalances } from "../repos/pool/functions/getTotalBalances";
import { compareByValue } from "../utils/compareByValue";
import { sortDictionary } from "../utils/sortDictionary";

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
    const [weekDepositUSD, setWeekDepositUSD] = useState({});

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
                const ethAmount = Number(ETH.balance);
                const ethPrice = ETH.price.rate;
                const ethValue = ethAmount * ethPrice;
                if(totalTokens["ETH"] === undefined){
                    totalTokens["ETH"] = {
                        amount: ethAmount,
                        price: ethPrice,
                        value: ethValue,
                        address: "0x0000000000000000000000000000000000000000"
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
                const address = token.tokenInfo.address;
                const value = amount * price;
                if(totalTokens[symbol] === undefined) {
                    totalTokens[symbol] = {
                        amount,
                        price,
                        value,
                        address
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
            console.log(totalTokens);
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
                const dex = pool.split("/")[0];
                const { value } = totalPools[pool];
                if(poolAllocation[dex] === undefined) poolAllocation[dex] = value / totalPoolUSD;
                else poolAllocation[dex] += value / totalPoolUSD;
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
                const dex = pool.split("/")[0];
                const { value } = totalPools[pool];
                if(poolAllocation[dex] === undefined) poolAllocation[dex] = value / totalPoolUSD;
                else poolAllocation[dex] += value / totalPoolUSD;
            })

            setTokenAllocation(tokenAllocation);
            setPoolAllocation(poolAllocation);
        }
    }, [totalTokens, totalPools, totalTokenUSD, totalPoolUSD, totalDepositUSD]);

    // useEffect(()=>{
    //     if(Object.keys(tokenAllocation).length === 0 && Object.keys(poolAllocation).length === 0) return;
    // }, [tokenAllocation, poolAllocation]);

    return (
        <div>
            <SideBar />
            <div>총 자산 ${totalDepositUSD.toFixed(2)}</div>
            <div>총 자산 변동액 1D()</div>
            <div>자산 비율 지갑:{(totalTokenUSD / totalDepositUSD).toFixed(2)}% DEX: {(totalPoolUSD / totalDepositUSD).toFixed(2)}%</div>
            <div>총 자산 변동 그래프</div>
            <div>Token Allocation</div>
            <div>{Object.keys(sortDictionary(tokenAllocation)).map((token)=>{
                return (<div>{token} {tokenAllocation[token].toFixed(2)}</div>);
            })}</div>
            <div>Protocol Allocation</div>
            <div>{Object.keys(sortDictionary(poolAllocation)).map((pool)=>{
                return (<div>{pool} {poolAllocation[pool].toFixed(2)}</div>);
            })}</div>
            <div>Wallet</div>
            <div>{Object.keys(compareByValue(totalTokens)).map((token)=>{
                return (<div>{token} {(totalTokens[token].amount).toFixed(4)}개 ${(totalTokens[token].price).toFixed(4)} ${(totalTokens[token].value).toFixed(4)}</div>);
            })}</div>
            <div>Farming</div>
            <div>{Object.keys(compareByValue(totalPools)).map((pool)=>{
                return (<div>{pool} {(totalPools[pool].amount0).toFixed(4)} - {(totalPools[pool].amount1).toFixed(4)} ${(totalPools[pool].value).toFixed(4)}</div>);
            })}</div>
        </div>
    )
}

export default DashboardPage;