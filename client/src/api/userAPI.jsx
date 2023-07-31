import axios from "axios";
import baseURL from "./baseURL";

const userAPI = axios.create({
  baseURL: `${baseURL}/user`,
});

export default userAPI;