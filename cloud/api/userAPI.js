const axios = require("axios");
const baseURL = require("./baseURL");

const userAPI = axios.create({
  baseURL: `${baseURL}/user`,
});

module.exports = userAPI;