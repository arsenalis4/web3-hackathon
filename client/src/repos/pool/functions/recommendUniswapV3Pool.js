const {request, gql} =  require("graphql-request");

// graphql 엔드포인트
const endpoint = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

const tokens = {
    'DAI': {
        'amount': 14695.104621878476,
        'price': 0.9993744018048107,
        'value': 14685.911390948912,
        'address': '0x6b175474e89094c44da98b954eedeac495271d0f'
    },
    'ELMO': {
        'amount': 1000,
        'price': 0.006431049262872433,
        'value': 6.431049262872433,
        'address': '0x335f4e66b9b61cee5ceade4e727fcec20156b2f0'
    },
    'ENS': {
        'amount': 408.39530232935317,
        'price': 9.410755128087674,
        'value': 3843.3081856828762,
        'address': '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72'
    },
    'ETH': {
        'amount': 0.5264161728812972,
        'price': 1828.5118497815224,
        'value': 962.5582100300903,
        'address': '0x0000000000000000000000000000000000000000'
    },
    'FWB': {
        'amount': 81.49328502456042,
        'price': 3.4243667081733977,
        'value': 279.06289217779045,
        'address': '0x35bd01fc9d6d5d81ca9e055db88dc49aa2c699a8'
    },
    'GENSLR': {
        'amount': 777,
        'price': 1.290791698790889e-9,
        'value': 0.0000010029451499605207,
        'address': '0xad1a5b8538a866ecd56ddd328b50ed57ced5d936'
    },
    'GTC': {
        'amount': 2687.2832720708443,
        'price': 0.9702614147979247,
        'value': 2607.367269522254,
        'address': '0xde30da39c46104798bb5aa3fe8b9e0e1f348163f'
    },
    'SOCKS': {
        'amount': 1.1,
        'price': 27717.133495064063,
        'value': 30488.84684457047,
        'address': '0x23b608675a2b2fb1890d3abbd85c5775c51691d5'
    },
    'USDC': {
        'amount': 25833.828545,
        'price': 1.0004025710689306,
        'value': 25844.22849697193,
        'address': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    },
    'USDT': {
        'amount': 370.635586,
        'price': 0.999634751717303,
        'value': 370.50021198870706,
        'address': '0xdac17f958d2ee523a2206206994597c13d831ec7'
    }
}

// graphql-request를 사용하여 pool 정보를 가져오는 함수
async function recommendUniswapV3Pool(tokens) {
    // 토큰들의 주소와 심볼을 배열로 저장합니다.
    const addresses = Object.keys(tokens).map((key) => tokens[key].address);
  
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
          }
        }
      `;
      const data = await request(endpoint, query);
  
      // 쿼리 결과가 있으면, pool의 목록을 출력합니다.
      if (data.pools.length > 0) {
        console.log(`당신이 가진 토큰들로 구매할 수 있는 Uniswap V3 pool의 목록입니다.`);
        for (const pool of data.pools) {
          console.log(
            `- ${pool.token0.symbol}-${pool.token1.symbol} ${pool.feeTier}: 유동성 ${pool.liquidity} ${pool.token0.symbol}, 거래량 ${pool.volumeUSD} USD`
          );
        }
      }
    }
  
    // 토큰들의 모든 조합에 대해 병렬로 쿼리합니다.
    const promises = [];
    for (let i = 0; i < addresses.length - 1; i++) {
      for (let j = i + 1; j < addresses.length; j++) {
        promises.push(queryPool(addresses[i], addresses[j]));
      }
    }
    await Promise.all(promises);
  }
  
recommendUniswapV3Pool(tokens);

// export { recommendUniswapV3Pool };