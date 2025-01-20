import axios from "axios";
import https from "https";

const PROPERTY_MANAGEMENT_BACKEND = import.meta.env.VITE_PROPERTY_MANAGEMENT_SERVICE_URL;
const INFRASTRUCTURE_MANAGEMENT_BACKEND = import.meta.env.VITE_INFRASTRUCTURE_MANAGEMENT_SERVICE_URL;
const AUTHENTICATION_BACKEND = import.meta.env.VITE_AUTHENTICATION_SERVICE_URL;
const PARKING_MANAGEMENT_BACKEND = import.meta.env.VITE_PARKING_MANAGEMENT_SERVICE_URL

if (PARKING_MANAGEMENT_BACKEND === undefined)
    throw new Error("Backend URL of Parking Management service is not defined");

if (PROPERTY_MANAGEMENT_BACKEND === undefined)
    throw new Error("Backend URL of Property Management service is not defined");

if (INFRASTRUCTURE_MANAGEMENT_BACKEND === undefined)
    throw new Error("Backend URL of Infrastructure Management service is not defined");

if (AUTHENTICATION_BACKEND === undefined)
    throw new Error("Backend URL of Authentication service is not defined");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const axiosAuthenticated = axios.create({httpsAgent: httpsAgent});

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