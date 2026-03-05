import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import Sidebar from '../components/Sidebar'
import api from '../api'

const actionColors = {
    NFC_SCAN: 'pill-blue',
    MANUAL_SEARCH: 'pill-orange',
    PROFILE_VIEW: 'pill-purple',
    NOTES_VIEW: 'pill-green',
}
const actionIcons = {
    NFC_SCAN: '📡',
    MANUAL_SEARCH: '🔍',
    PROFILE_VIEW: '👁️',
    NOTES_VIEW: '📝',
}

export default function AccessLogs() {
    const { user } = useAuth()
    const nfcId = user?.linkedNfcId
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState('')

    useEffect(() => {
        if (!nfcId) { setLoading(false); return }
        api.get(`/access-logs/patient/${nfcId}`)
            .then(r => setLogs(r.data))
            .catch(() => setFetchError('Could not load access logs. Please try again later.'))
            .finally(() => setLoading(false))
    }, [nfcId])

    if (loading) return (
        <div className="layout"><Sidebar />
            <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
            </main>
        </div>
    )

    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1>📋 Access Logs</h1>
                    <p>See every time a hospital or staff member accessed your profile</p>
                </div>

                {fetchError && <div className="alert alert-error">⚠️ {fetchError}</div>}

                {!nfcId ? (
                    <div className="empty"><div className="empty-icon">💳</div><h3>No NFC Card Linked</h3><p>Link your card in Settings to track access.</p></div>
                ) : logs.length === 0 ? (
                    <div className="empty"><div className="empty-icon">🔒</div><h3>No Access Events</h3><p>Your profile has not been accessed by any hospital yet.</p></div>
                ) : (
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">🔍 Access History</span>
                            <span className="pill pill-blue">{logs.length} events</span>
                        </div>
                        {logs.map((log, i) => (
                            <div key={i} className="list-item">
                                <div className="list-avatar">{actionIcons[log.action] || '🏥'}</div>
                                <div className="list-info">
                                    <div className="list-title">
                                        {log.hospital?.name ?? 'Unknown Hospital'}
                                        {log.staff && <span style={{ color: 'var(--muted)', fontWeight: 400 }}> — {log.staff.name}</span>}
                                    </div>
                                    <div className="list-subtitle">{new Date(log.accessedAt).toLocaleString()}</div>
                                </div>
                                <span className={`pill ${actionColors[log.action] || 'pill-blue'}`}>
                                    {log.action?.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
