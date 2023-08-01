function formatNumber(num) {
    // 숫자를 문자열로 변환
    let str = num.toFixed(2).toString();
    // 양수이면 앞에 + 기호를 추가
    if (num > 0) {
        str = "+" + str;
    }
    // 결과를 반환
    return str;
}

export { formatNumber };