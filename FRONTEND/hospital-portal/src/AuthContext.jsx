import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Hospital portal uses hp_token / hp_user keys to avoid collision with the patient portal
// (both may run in the same browser)
const TOKEN_KEY = 'hp_token'
const USER_KEY = 'hp_user'

function isTokenValid(token) {
    if (!token) return false
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.exp * 1000 > Date.now()
    } catch {
        return false
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const token = localStorage.getItem(TOKEN_KEY)
            if (!isTokenValid(token)) {
                localStorage.removeItem(TOKEN_KEY)
                localStorage.removeItem(USER_KEY)
                return null
            }
            return JSON.parse(localStorage.getItem(USER_KEY))
        } catch {
            return null
        }
    })
    const [token, setToken] = useState(() => {
        const t = localStorage.getItem(TOKEN_KEY)
        return isTokenValid(t) ? t : null
    })

    const login = (userData, jwtToken) => {
        localStorage.setItem(USER_KEY, JSON.stringify(userData))
        localStorage.setItem(TOKEN_KEY, jwtToken)
        setUser(userData)
        setToken(jwtToken)
    }

    const logout = () => {
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem(TOKEN_KEY)
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
