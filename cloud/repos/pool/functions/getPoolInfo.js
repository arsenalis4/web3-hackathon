const { getKyberPoolInfo } = require("./getKyberPoolInfo");
const { getUniswapV2PoolInfo } = require("./getUniswapV2PoolInfo");

const getPoolInfo = async (name, address, balance) => {
    if(name.includes("KyberDMM LP")){
        return await getKyberPoolInfo(address, balance);
    } else{
        return await getUniswapV2PoolInfo(address, balance);
    }
};

module.exports = { getPoolInfo };