import axios from 'axios'

// In dev: Vite proxies /api → localhost:8080
// In prod: VITE_API_URL points to the deployed backend (e.g. https://your-backend.onrender.com/api)
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

// Attach JWT token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Auto-logout on 401
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api
