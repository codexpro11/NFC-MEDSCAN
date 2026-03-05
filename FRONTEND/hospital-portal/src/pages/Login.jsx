import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import api from '../api'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setError('')
        try {
            const { data } = await api.post('/auth/login', form)
            const allowedRoles = ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN']
            if (!allowedRoles.includes(data.role)) {
                setError('This portal is for hospital staff only. Patients please use the Patient Portal.')
                return
            }
            login({
                name: data.name, email: data.email, role: data.role,
                hospitalId: data.hospitalId
            }, data.token)
            navigate('/dashboard')
        } catch {
            setError('Invalid credentials. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">🏥</div>
                    <h1>NFC MedScan</h1>
                    <p>Hospital Portal — Staff Sign In</p>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Staff Email</label>
                        <input className="form-input" type="email" required placeholder="doctor@hospital.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" required placeholder="••••••••"
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    </div>
                    <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                        {loading ? <span className="spinner" /> : '🏥 Sign In to Hospital Portal'}
                    </button>
                </form>

                <div style={{ marginTop: 20, padding: '14px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
                        🔒 Restricted to DOCTOR · NURSE · RECEPTIONIST · ADMIN roles only<br />
                        <span style={{ color: 'var(--accent2)' }}>Patients →</span> <a href="http://localhost:5173" target="_blank" rel="noreferrer">Patient Portal</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
