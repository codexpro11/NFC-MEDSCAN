import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import Sidebar from '../components/Sidebar'
import api from '../api'

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [logs, setLogs] = useState([])
    const [loadingLogs, setLoadingLogs] = useState(true)
    const [logsError, setLogsError] = useState('')

    useEffect(() => {
        if (!user?.hospitalId) { setLoadingLogs(false); return }
        api.get(`/access-logs/hospital/${user.hospitalId}`)
            .then(r => setLogs(r.data))
            .catch(() => setLogsError('Could not load activity logs. Check backend connection.'))
            .finally(() => setLoadingLogs(false))
    }, [user])

    const todayLogs = logs.filter(l => {
        const d = new Date(l.accessedAt)
        const now = new Date()
        return d.toDateString() === now.toDateString()
    })

    const roleBadge = { DOCTOR: '🩺', NURSE: '💉', RECEPTIONIST: '📋', ADMIN: '⚙️' }

    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1>{roleBadge[user?.role] || '🏥'} {user?.name}&apos;s Dashboard</h1>
                    <p>Hospital staff control centre</p>
                </div>

                {/* Quick action */}
                <div style={{ marginBottom: 24, padding: '20px 24px', background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>📡 Scan Patient NFC Card</h3>
                        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Enter a patient&apos;s NFC ID to instantly access their full medical profile</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/scanner')}>Open Scanner</button>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📡</div>
                        <div className="stat-value" style={{ color: 'var(--accent2)' }}>{todayLogs.length}</div>
                        <div className="stat-label">Scans Today</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-value">{logs.length}</div>
                        <div className="stat-label">Total Access Events</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🩺</div>
                        <div className="stat-value" style={{ color: 'var(--success)' }}>{roleBadge[user?.role] || '?'}</div>
                        <div className="stat-label">Your Role</div>
                    </div>
                </div>

                {/* Recent activity */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">🔍 Recent Hospital Activity</span>
                        {loadingLogs && <span className="spinner" />}
                        </div>
                {logsError && <div className="alert alert-error">⚠️ {logsError}</div>}
                    {logs.length === 0 ? (
                        <div className="empty" style={{ padding: '24px 0' }}>
                            <div className="empty-icon">🔒</div>
                            <h3>No Scans Yet</h3>
                            <p>Scan a patient NFC card to start logging activity</p>
                        </div>
                    ) : (
                        logs.slice(0, 6).map((log, i) => (
                            <div key={i} className="list-item">
                                <div className="list-avatar">📡</div>
                                <div className="list-info">
                                    <div className="list-title">
                                        {log.patient ? `${log.patient.name} (${log.patient.nfcId})` : log.patientNfcId}
                                    </div>
                                    <div className="list-subtitle">{new Date(log.accessedAt).toLocaleString()} · {log.staff?.name || 'Staff'}</div>
                                </div>
                                <span className="pill pill-blue">{log.action?.replace('_', ' ')}</span>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}
