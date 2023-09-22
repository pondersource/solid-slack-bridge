import axios from "axios";
import { BASE_URL } from "./config/default";

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
})