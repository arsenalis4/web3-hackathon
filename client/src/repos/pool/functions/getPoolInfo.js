import { getKyberPoolInfo } from "./getKyberPoolInfo";
import { getUniswapV2PoolInfo } from "./getUniswapV2PoolInfo";

const getPoolInfo = async (name, address, balance) => {
    if(name.includes("KyberDMM LP")){
        return await getKyberPoolInfo(address, balance);
    } else{
        return await getUniswapV2PoolInfo(address, balance);
    }
};

export { getPoolInfo };