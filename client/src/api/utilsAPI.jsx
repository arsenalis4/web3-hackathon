import axios from "axios";
import baseURL from "./baseURL";

const utilsAPI = axios.create({
  baseURL: `${baseURL}/utils`,
});

export default utilsAPI;