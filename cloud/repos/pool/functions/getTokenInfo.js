const axios = require('axios');

const getTokenInfo = async (token0Address, token1Address) => {
    const { data } = await axios.get(`https://coins.llama.fi/prices/current/ethereum:${token0Address},ethereum:${token1Address}`);
    const token0Info = data.coins[`ethereum:${token0Address}`];
    const token1Info = data.coins[`ethereum:${token1Address}`];
    return {
        token0Info,
        token1Info,
    };
};

module.exports = { getTokenInfo };