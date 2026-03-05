import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Decode a JWT and check if it's still valid (not expired)
function isTokenValid(token) {
    if (!token) return false
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        // exp is in seconds, Date.now() is in ms
        return payload.exp * 1000 > Date.now()
    } catch {
        return false
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const token = localStorage.getItem('token')
            // If the stored token is expired, clear everything on startup
            if (!isTokenValid(token)) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                return null
            }
            return JSON.parse(localStorage.getItem('user'))
        } catch {
            return null
        }
    })
    const [token, setToken] = useState(() => {
        const t = localStorage.getItem('token')
        return isTokenValid(t) ? t : null
    })

    const login = (userData, jwtToken) => {
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', jwtToken)
        setUser(userData)
        setToken(jwtToken)
    }

    const logout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        setUser(null)
        setToken(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
