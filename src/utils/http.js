const axios = require('axios').default;

export const api = axios.create();

api.interceptors.request.use(function (config) {
    // Auth token 주입
    config.headers.Authorization = "Bearer " + localStorage.getItem("access_token") || "";

    return config;
}, function (error) {
    return Promise.reject(error);
})