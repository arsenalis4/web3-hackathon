const { request, gql } = require("graphql-request");

// graphql 엔드포인트
const endpoint = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

// graphql-request를 사용하여 pool 정보를 가져오는 함수
async function getUniswapV3AllPools(walletAddress) {
    // graphql 쿼리
    const query = gql`
    {
        positions(where: {owner: "${walletAddress}"}) {
            id
            liquidity
            tickLower{
                tickIdx
            }
            tickUpper{
                tickIdx
            }
            token0 {
                id
                symbol
            }
            token1 {
                id
                symbol
            }
            pool {
                id
                liquidity
                feeTier
            }
        }
    }
    `;

    const response = await request(endpoint, query);
    const positions = response.positions;
    return positions;
}

module.exports = { getUniswapV3AllPools };