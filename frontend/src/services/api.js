import axios from 'axios'

const API_URL = 'http://localhost:8000' // Без /api в конце!

// Создаем инстанс axios с настройками
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 секунд таймаут
})

// Добавляем перехватчик запросов для логирования
api.interceptors.request.use(
    (config) => {
        console.log(`📤 ${config.method.toUpperCase()} ${config.url}`)
        if (config.data) {
            console.log('📦 Данные:', config.data)
        }
        return config
    },
    (error) => {
        console.error('❌ Ошибка запроса:', error)
        return Promise.reject(error)
    }
)

// Добавляем перехватчик ответов
api.interceptors.response.use(
    (response) => {
        console.log(`📥 ${response.status} ${response.config.url}`)
        console.log('📄 Ответ:', response.data)
        return response
    },
    (error) => {
        if (error.response) {
            console.error(`❌ Ошибка ${error.response.status}:`, error.response.data)
        } else if (error.request) {
            console.error('❌ Нет ответа от сервера:', error.request)
        } else {
            console.error('❌ Ошибка настройки запроса:', error.message)
        }
        return Promise.reject(error)
    }
)

export const authAPI = {
    register: (data) => api.post('/api/auth/register', data),
    login: (data) => api.post('/api/auth/login', data),
    getMe: () => {
        const token = localStorage.getItem('token')
        if (!token) {
            return Promise.reject(new Error('Токен не найден'))
        }
        return api.get('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
    }
}

export const moviesAPI = {
    // Получить все фильмы
    getMovies: (params = {}) => api.get('/movies', { params }),

    // Получить фильм по ID
    getMovieById: (id) => api.get(`/movies/${id}`),

    // Добавить в избранное
    addToFavorites: (movieId) => api.post(`/movies/${movieId}/favorite`),

    // Удалить из избранного
    removeFromFavorites: (movieId) => api.delete(`/movies/${movieId}/favorite`),

    // Получить избранные фильмы
    getFavorites: () => api.get('/users/me/favorites'),

    // Поиск фильмов
    searchMovies: (query) => api.get('/movies', { params: { search: query } })
}

export default api