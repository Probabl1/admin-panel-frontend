import axios from 'axios';

// Базовые настройки axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001'; // ваш бекенд URL
axios.defaults.withCredentials = true; // включаем передачу кук

// Можно добавить интерцепторы для обработки ошибок
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Перенаправление на страницу логина, если не авторизован
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axios;
