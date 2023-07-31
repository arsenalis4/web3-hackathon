import { getAddressInfo } from "./getAddressInfo";
import { getPoolInfo } from "./getPoolInfo";
import { getUniswapV3PoolInfo } from "./getUniswapV3PoolInfo";

const getTotalBalances = async (walletAddress) => {
    let defaultBalances = {
        "ETH": [],
        "tokens": [],
        "pools": [],
    }

    const { ETH, tokenInfos, positions } = await getAddressInfo(walletAddress);
    defaultBalances.ETH = ETH;
    defaultBalances.tokens = tokenInfos;

    let uniswapV3Pools = await getUniswapV3PoolInfo(walletAddress);
    uniswapV3Pools.forEach((pool)=>{
        let dex = "Uniswap V3";
        let symbol = pool.symbol;
        pool.id = `${dex}/${symbol}`;
        defaultBalances.pools.push(pool);
    })

    await Promise.all(positions.map(async (position) => {
        const name = position.name;
        const address = position.address;
        const balance = position.balance;
        const pool = await getPoolInfo(name, address, balance);

        if(pool === undefined) return;

        if(name.includes("SushiSwap LP")) {
            let dex = "SushiSwap"
            let symbol = pool.symbol;
            pool.id = `${dex}/${symbol}`;
            defaultBalances.pools.push(pool);
        } else if(name.includes("Helix LPs")){
            let dex = "Helix"
            let symbol = pool.symbol;
            pool.id = `${dex}/${symbol}`;
            defaultBalances.pools.push(pool);
        } else if(name.includes("KyberDMM LP")) {
            let dex = "KyberSwap"
            let symbol = pool.symbol;
            pool.id = `${dex}/${symbol}`;
            defaultBalances.pools.push(pool);
        } else if(name.includes("Uniswap V2")) {
            let dex = "Uniswap V2"
            let symbol = pool.symbol;
            pool.id = `${dex}/${symbol}`;
            defaultBalances.pools.push(pool);
        }
    }));

    return defaultBalances;
};

export { getTotalBalances };