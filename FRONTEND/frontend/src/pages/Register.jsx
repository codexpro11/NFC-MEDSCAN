import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import api from '../api'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function Register() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        role: 'PATIENT', linkedNfcId: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

    // Handle Google Sign-In response
    const handleGoogleResponse = useCallback(async (response) => {
        setLoading(true)
        setError('')
        try {
            const { data } = await api.post('/auth/google', { credential: response.credential })
            login({ name: data.name, email: data.email, role: data.role }, data.token)
            navigate('/dashboard')
        } catch {
            setError('Google sign-up failed. Please try again.')
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
                document.getElementById('google-signup-btn'),
                { theme: 'filled_black', size: 'large', width: '100%', text: 'signup_with', shape: 'rectangular' }
            )
        }
        document.head.appendChild(script)
        return () => { document.head.removeChild(script) }
    }, [handleGoogleResponse])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        setLoading(true)
        setError('')
        try {
            const payload = {
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                linkedNfcId: form.linkedNfcId || null
            }
            const { data } = await api.post('/auth/register', payload)
            login({ name: data.name, email: data.email, role: data.role }, data.token)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Email may already be in use.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: 500 }}>
                <div className="auth-logo">
                    <div className="auth-logo-icon">📡</div>
                    <h1>NFC MedScan</h1>
                    <p>Create your patient account</p>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {/* Google Sign-Up Button */}
                {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'NOT_SET' && (
                    <>
                        <div id="google-signup-btn" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}></div>
                        <div className="auth-divider">
                            <span>or create account with email</span>
                        </div>
                    </>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" required placeholder="John Doe"
                            value={form.name} onChange={e => set('name', e.target.value)} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" type="email" required placeholder="you@example.com"
                                value={form.email} onChange={e => set('email', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">NFC Card ID <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                            <input className="form-input" placeholder="e.g. NFC001"
                                value={form.linkedNfcId} onChange={e => set('linkedNfcId', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" type="password" required placeholder="Min. 8 characters"
                                value={form.password} onChange={e => set('password', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input className="form-input" type="password" required placeholder="••••••••"
                                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                        </div>
                    </div>

                    <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
