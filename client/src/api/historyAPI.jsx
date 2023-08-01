import axios from "axios";
import baseURL from "./baseURL";

const historyAPI = axios.create({
  baseURL: `${baseURL}/history`,
});

export default historyAPI;