import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (BASE_URL === undefined)
    throw new Error("BACKEND_URL is not defined");

const axiosAuthenticated = axios.create({
    baseURL: BASE_URL,
});

axiosAuthenticated.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosAuthenticated;