import axios from "axios";
import baseURL from "./baseURL";

const authAPI = axios.create({
  baseURL: `${baseURL}/auth`,
});

export default authAPI;