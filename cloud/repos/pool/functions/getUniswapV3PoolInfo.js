/*global BigInt*/
const { uniswapV3NFTABI, uniswapV3PairABI } = require("../abi/abis");
const { getTokenInfo } = require("./getTokenInfo");
const { getUniswapV3AllPools } = require("./getUniswapV3AllPools");
const { Web3 } = require("web3");
const provider = "https://mainnet.infura.io/v3/d3ae86a8709a4d66a552594d998347d3";
const web3 = new Web3(provider);

const masterVault = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

const Q96 = 2 ** 96;
const Q128 = BigInt(340282366920938463463374607431768211455n);

const getUniswapV3PoolInfo = async (walletAddress) => {
    const positions = await getUniswapV3AllPools(walletAddress);
    const pools = [];

    if (positions.length === 0) return pools;

    await Promise.all(positions.map(async (position) => {
        const [token0, token1] = [position.token0.id, position.token1.id];
        const [token0Symbol, token1Symbol] = [position.token0.symbol, position.token1.symbol];
        const [tickLower, tickUpper] = [Number(position.tickLower.tickIdx), Number(position.tickUpper.tickIdx)];
        const positionLiquidity = Number(position.liquidity);
        const poolAddress = position.pool.id;
        const tokenId = position.id;

        const { token0Info, token1Info } = await getTokenInfo(token0, token1);

        if (token0Info === undefined || token1Info === undefined) return;

        const [token0Decimals, token1Decimals] = [token0Info.decimals, token1Info.decimals];
        const [token0Price, token1Price] = [token0Info.price, token1Info.price];

        const poolContract = new web3.eth.Contract(uniswapV3PairABI, poolAddress);

        // UniswapV3Pool 컨트랙트의 slot0 함수를 호출하여 풀의 현재 가격을 구합니다.
        const slot0 = await poolContract.methods.slot0().call();
        const sqrtPriceX96 = Number(slot0.sqrtPriceX96);

        // 예치 범위의 가격과 총 유동성을 이용하여 예치한 토큰의 양을 구합니다.
        const unCliamableTokenAmounts = getUnCliamableTokenAmounts(positionLiquidity, sqrtPriceX96, tickLower, tickUpper, token0Decimals, token1Decimals);
        const claimableTokenAmounts = await getCliamableTokenAmounts(tokenId, walletAddress, token0Decimals, token1Decimals);
        const unCliamableToken0Value = unCliamableTokenAmounts.amount0 * token0Price;
        const unCliamableToken1Value = unCliamableTokenAmounts.amount1 * token1Price;
        const claimableToken0Value = claimableTokenAmounts.amount0 * token0Price;
        const claimableToken1Value = claimableTokenAmounts.amount1 * token1Price;
        const unCliamableUSD = unCliamableToken0Value + unCliamableToken1Value;
        const climabaleUSD = claimableToken0Value + claimableToken1Value;
        const totalDepositUSD = unCliamableUSD + climabaleUSD;

        const pool = {
            symbol: token0Symbol + "-" + token1Symbol,
            amount0: (unCliamableTokenAmounts.amount0 + claimableTokenAmounts.amount0),
            amount1: (unCliamableTokenAmounts.amount1 + claimableTokenAmounts.amount1),
            value: totalDepositUSD,
        }

        pools.push(pool);
    }));

    return pools;
}

async function getCliamableTokenAmounts(tokenId, walletAddress, token0Decimals, token1Decimals) {
    const contract = new web3.eth.Contract(uniswapV3NFTABI, masterVault);
    const claimableTokenAmounts = await contract.methods.collect({
        tokenId: tokenId,
        recipient: walletAddress,
        amount0Max: Q128,
        amount1Max: Q128,
    }).call();

    const [token0Balance, token1Balance] = [Number(claimableTokenAmounts.amount0), Number(claimableTokenAmounts.amount1)];
    const amount0 = token0Balance / (10 ** token0Decimals);
    const amount1 = token1Balance / (10 ** token1Decimals);
    return {
        amount0,
        amount1,
    }
}

function getUnCliamableTokenAmounts(liquidity, sqrtPriceX96, tickLow, tickHigh, token0Decimals, token1Decimals) {
    let sqrtRatioA = Math.sqrt(1.0001 ** tickLow);
    let sqrtRatioB = Math.sqrt(1.0001 ** tickHigh);

    let currentTick = getTickAtSqrtRatio(sqrtPriceX96);
    let sqrtPrice = sqrtPriceX96 / Q96;

    let amount0wei = 0;
    let amount1wei = 0;
    if (currentTick <= tickLow) {
        amount0wei = Math.floor(liquidity * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB)));
    }
    else if (currentTick > tickHigh) {
        amount1wei = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA));
    }
    else if (currentTick >= tickLow && currentTick < tickHigh) {
        amount0wei = Math.floor(liquidity * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB)));
        amount1wei = Math.floor(liquidity * (sqrtPrice - sqrtRatioA));
    }

    const amount0 = amount0wei / (10 ** token0Decimals);
    const amount1 = amount1wei / (10 ** token1Decimals);

    return {
        amount0,
        amount1,
    }
}

function getTickAtSqrtRatio(sqrtPriceX96) {
    let tick = Math.floor(Math.log((sqrtPriceX96 / Q96) ** 2) / Math.log(1.0001));
    return tick;
}

module.exports = { getUniswapV3PoolInfo };