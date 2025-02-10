// src/api/axiosConfig.js

import axios from 'axios';

// Создаём экземпляр axios с базовым URL
const instance = axios.create({
    baseURL: 'http://localhost:5000', // Убедитесь, что это правильный URL вашего сервера
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем интерцептор для включения токена в заголовки запросов
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Или другой способ хранения токена
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
