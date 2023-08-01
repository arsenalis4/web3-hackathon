const formatDate = (i) => {
    // Date 객체 생성
    let today = new Date();

    // 하루 전의 시간을 밀리초 단위로 계산
    let day = new Date(today.getTime() - 24 * i * 60 * 60 * 1000);

    // 연도, 월, 일을 각각 추출
    let year = day.getFullYear();
    let month = day.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줌
    let date = day.getDate();

    // 월과 일이 한 자리수면 앞에 0을 붙여줌
    if (month < 10) {
        month = '0' + month;
    }

    if (date < 10) {
        date = '0' + date;
    }

    // 연도-월-일 형식의 문자열 생성
    let formattedDate = year + '-' + month + '-' + date;

    // 문자열 반환
    return formattedDate;
}

export { formatDate };