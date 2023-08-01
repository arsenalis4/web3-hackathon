const { uniswapV2ABI } = require("../abi/abis");
const { getTokenInfo } = require("./getTokenInfo");
const { Web3 } = require("web3");
const provider = "https://mainnet.infura.io/v3/d3ae86a8709a4d66a552594d998347d3";
const web3 = new Web3(provider);

const getUniswapV2PoolInfo = async (address, balance) => {
    try {
        // Use kyberswapABI to create the contract
        const contract = new web3.eth.Contract(uniswapV2ABI, address);

        // Get the total supply of the LP token
        const totalSupply = Number(await contract.methods.totalSupply().call());

        // Get the reserves of the underlying tokens in the pool
        const { _reserve0, _reserve1 } = await contract.methods.getReserves().call();

        // Calculate the share of each token based on the balance and total supply
        const share = balance / totalSupply;

        const token0 = await contract.methods.token0().call();
        const token1 = await contract.methods.token1().call();

        const { token0Info, token1Info } = await getTokenInfo(token0, token1);

        if (token0Info === undefined || token1Info === undefined) return;

        const [token0Decimals, token1Decimals] = [token0Info.decimals, token1Info.decimals];
        const [token0Symbol, token1Symbol] = [token0Info.symbol, token1Info.symbol];
        const [token0Price, token1Price] = [token0Info.price, token1Info.price];

        // Calculate the deposit amount of each token based on the share and reserves
        const depositAmount0 = share * Number(_reserve0) / Math.pow(10, token0Decimals);
        const depositAmount1 = share * Number(_reserve1) / Math.pow(10, token1Decimals);

        // Calculate the current value of each token in USD
        const currentValue0 = depositAmount0 * token0Price;
        const currentValue1 = depositAmount1 * token1Price;

        const depositUSD = currentValue0 + currentValue1;

        // Return an object with the deposit amount of each token
        return {
            symbol: token0Symbol + "-" + token1Symbol,
            amount0: depositAmount0,
            amount1: depositAmount1,
            value: depositUSD,
        };
    } catch (error) {
        console.log(error);
    }
}

module.exports = { getUniswapV2PoolInfo }