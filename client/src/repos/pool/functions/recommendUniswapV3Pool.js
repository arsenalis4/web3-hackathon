import { request, gql } from "graphql-request";

// graphql 엔드포인트
const endpoint = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

// graphql-request를 사용하여 pool 정보를 가져오는 함수
async function recommendUniswapV3Pool(tokens) {
  // 토큰들의 주소와 심볼을 배열로 저장합니다.
  let addresses = Object.keys(tokens).map((key) => tokens[key].address);
  addresses = addresses.filter((address) => address !== undefined);

  // 토큰들의 쌍을 쿼리하는 함수를 정의합니다.
  async function queryPool(token0, token1) {
    // 토큰들의 주소를 알파벳 순서로 정렬합니다.
    const [sortedToken0, sortedToken1] = [token0, token1].sort();

    // 토큰들로 구성된 pool을 쿼리합니다.
    const query = gql`
        query {
          pools(
            where: {
                token0_in: ["${sortedToken0.toLowerCase()}", "${sortedToken1.toLowerCase()}"],
                token1_in: ["${sortedToken0.toLowerCase()}", "${sortedToken1.toLowerCase()}"],
            }
          ) {
            id
            token0 {
              symbol
            }
            token1 {
              symbol
            }
            liquidity
            volumeUSD
            feeTier
            totalValueLockedUSD
          }
        }
      `;
    const data = await request(endpoint, query);
    
    // 쿼리 결과가 있으면, pool의 정보를 담은 객체의 배열을 반환합니다.
    if (data.pools.length > 0) {
      return data.pools.map(pool => ({
        token0Symbol: pool.token0.symbol,
        token1Symbol: pool.token1.symbol,
        dex: "Uniswap V3",
        tvl: pool.totalValueLockedUSD,
        feeTier: pool.feeTier
      }));
    } else {
      // 쿼리 결과가 없으면, 빈 배열을 반환합니다.
      return [];
    }
  }

  // 토큰들의 모든 조합에 대해 병렬로 쿼리합니다.
  const promises = [];
  for (let i = 0; i < addresses.length - 1; i++) {
    for (let j = i + 1; j < addresses.length; j++) {
      promises.push(queryPool(addresses[i], addresses[j]));
    }
  }
  // 모든 프로미스가 완료되면, 결과를 합쳐서 반환합니다.
  const results = await Promise.all(promises);
  return results.flat();
}

export { recommendUniswapV3Pool };