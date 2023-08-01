const calculateTotalUSD = (totalTokens, totalPools) => {
    if(Object.keys(totalTokens).length === 0 && Object.keys(totalPools).length === 0) return 0;

    let depositUSD = 0;
    if(Object.keys(totalTokens).length === 0){   
        Object.keys(totalPools).forEach((pool)=>{
            depositUSD += totalPools[pool].value;
        })
    } else if(Object.keys(totalPools).length === 0){
        Object.keys(totalTokens).forEach((token)=>{
            depositUSD += totalTokens[token].value;
        })
    } else{
        let depositTokenUSD = 0;
        let depositPoolUSD = 0;
        Object.keys(totalTokens).forEach((token)=>{
            depositTokenUSD += totalTokens[token].value;
            depositUSD += totalTokens[token].value;
        })
        Object.keys(totalPools).forEach((pool)=>{
            depositPoolUSD += totalPools[pool].value;
            depositUSD += totalPools[pool].value;
        })
    }

    return depositUSD;
}

module.exports = { calculateTotalUSD } 