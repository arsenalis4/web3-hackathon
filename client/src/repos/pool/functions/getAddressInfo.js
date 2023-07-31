import axios from "axios";

// Ethplorer API 키
const apiKey = "EK-k2x9s-mjxWGfL-fJbNE";

// axios 함수로 API 요청 보내기
const getAddressInfo = async (walletAddress) => {
    // API 요청 URL
    const url = `https://api.ethplorer.io/getAddressInfo/${walletAddress}`;

    const response = await axios.get(url, {
        params: {
            apiKey: apiKey,
        },
    });
    
    const { ETH, tokens } = response.data;
    const tokenInfos = [];
    const positions = [];

    // an array of keywords to filter LP tokens
    // Balancer V2, Curve.fi, PancakeSwap V3 are not supported yet
    const lpKeywords = ["Uniswap V2", "SushiSwap LP", "Helix LPs", "KyberDMM LP"];

    // tokens value is an array, so use a loop to print each token information
    for (let token of tokens) {
        // get the name, address, balance, and price information of the token
        const { name, address } = token.tokenInfo;
        const balance = token.balance;

        if (name === undefined) continue;

        // check if the name includes any of the keywords
        if (lpKeywords.some(keyword => name.includes(keyword))) {
            positions.push({
                name,
                address,
                balance,
            });
        } else if(token.tokenInfo.price){
            tokenInfos.push(token);
        }
    }

    return {
        ETH,
        tokenInfos,
        positions,
    };
}

export { getAddressInfo };