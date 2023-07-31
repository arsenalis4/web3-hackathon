import axios from "axios";

const getMultipleTokenInfo = async (tokenAddresses) => {
    // tokenAddresses is an array of token addres, so join the
    const prefix = "ethereum:"; // 접두사 선언
    let tokenAddressesString = tokenAddresses.join("," + prefix); // 리스트의 요소들을 접두사와 쉼표로 연결
    tokenAddressesString = prefix + tokenAddressesString; // 맨 앞에 접두사 추가
    
    const { data } = await axios.get(`https://coins.llama.fi/prices/current/${tokenAddressesString}`);
    const tokenInfos = [];

    tokenAddresses.forEach(tokenAddress => {
        const tokenInfo = data.coins[`ethereum:${tokenAddress}`];
        tokenInfos.push(tokenInfo);
    });

    return tokenInfos;
};

export { getMultipleTokenInfo };