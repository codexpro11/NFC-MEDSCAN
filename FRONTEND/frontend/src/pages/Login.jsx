import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import api from '../api'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Handle Google Sign-In response
    const handleGoogleResponse = useCallback(async (response) => {
        setLoading(true)
        setError('')
        try {
            const { data } = await api.post('/auth/google', { credential: response.credential })
            login({ name: data.name, email: data.email, role: data.role, hospitalId: data.hospitalId }, data.token)
            navigate('/dashboard')
        } catch {
            setError('Google sign-in failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [login, navigate])

    // Load Google Identity Services script
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'NOT_SET') return

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
            })
            window.google.accounts.id.renderButton(
                document.getElementById('google-signin-btn'),
                { theme: 'filled_black', size: 'large', width: '100%', text: 'signin_with', shape: 'rectangular' }
            )
        }
        document.head.appendChild(script)
        return () => { document.head.removeChild(script) }
    }, [handleGoogleResponse])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const { data } = await api.post('/auth/login', form)
            login({ name: data.name, email: data.email, role: data.role, hospitalId: data.hospitalId }, data.token)
            navigate('/dashboard')
        } catch {
            setError('Invalid email or password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">📡</div>
                    <h1>NFC MedScan</h1>
                    <p>Patient Portal — Sign in to your account</p>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {/* Google Sign-In Button */}
                {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'NOT_SET' && (
                    <>
                        <div id="google-signin-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}></div>
                        <div className="auth-divider">
                            <span>or sign in with email</span>
                        </div>
                    </>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email address</label>
                        <input className="form-input" type="email" required
                            placeholder="you@example.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" required
                            placeholder="••••••••"
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    </div>
                    <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    )
}
