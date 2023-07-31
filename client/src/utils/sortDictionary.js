const sortDictionary = (dic) => {
    // 위 dictionary를 배열로 변환합니다.
    let dictArray = Object.entries(dic);

    // 값(value)을 기준으로 오름차순 정렬합니다.
    dictArray.sort((a, b) => b[1] - a[1]);

    // 정렬된 배열을 다시 객체로 변환합니다.
    let sortedDict = Object.fromEntries(dictArray);

    // 결과를 출력합니다.
    return sortedDict
}

export { sortDictionary };