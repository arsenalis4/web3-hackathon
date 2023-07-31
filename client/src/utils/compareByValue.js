function compareByValue(dic) {
    // totalTokens를 배열로 변환합니다.
    let arr = Object.entries(dic);

    // value를 기준으로 내림차순 정렬합니다.
    arr.sort((a, b) => b[1].value - a[1].value);

    // 정렬된 배열을 다시 객체로 변환합니다.
    let sortedDic = Object.fromEntries(arr);
    return sortedDic;
}

export { compareByValue };