// import axios from "axios";
const axios = require("axios");

// API 키 설정
var access_key = 'API_KEY';

const getExchangeRates = async () => {
    var url = 'https://api.exchangeratesapi.io/v1/latest';
    const { data } = await axios.get(url);
    console.log(data);
};

getExchangeRates();

// export { getTokenInfo };