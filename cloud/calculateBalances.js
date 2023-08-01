const { getTotalBalances } = require("./repos/pool/functions/getTotalBalances");

// getTotalBalances 함수를 호출하는 함수
async function calculateBalances(wallets) {
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
            const amount =
                Number(token.balance) / Math.pow(10, Number(token.tokenInfo.decimals));
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
        });
    });

    // 모든 프로미스가 완료될 때까지 기다립니다.
    await Promise.all(promises);
    return { totalTokens, totalPools };
}

module.exports = { calculateBalances };