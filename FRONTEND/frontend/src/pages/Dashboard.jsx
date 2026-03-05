import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import Sidebar from '../components/Sidebar'
import api from '../api'

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [patient, setPatient] = useState(null)
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState('')

    useEffect(() => {
        const nfcId = user?.linkedNfcId
        if (!nfcId) { setLoading(false); return }
        Promise.all([
            api.get(`/patients/nfc/${nfcId}`),
            api.get(`/access-logs/patient/${nfcId}`)
        ]).then(([p, l]) => {
            setPatient(p.data)
            setLogs(l.data)
        }).catch(() => {
            setFetchError('Could not load your profile data. Please check your connection or try again later.')
        }).finally(() => setLoading(false))
    }, [user])

    const nfcId = user?.linkedNfcId

    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1>👋 Welcome, {user?.name?.split(' ')[0]}!</h1>
                    <p>Here's a summary of your NFC MedScan profile</p>
                </div>

                {fetchError && <div className="alert alert-error">⚠️ {fetchError}</div>}

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">💳</div>
                        <div className="stat-value" style={{ color: nfcId ? 'var(--success)' : 'var(--warning)' }}>
                            {nfcId ? 'Linked' : 'None'}
                        </div>
                        <div className="stat-label">NFC Card</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-value" style={{ color: 'var(--danger)' }}>
                            {patient?.allergies?.length ?? 0}
                        </div>
                        <div className="stat-label">Allergies</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🩺</div>
                        <div className="stat-value" style={{ color: 'var(--warning)' }}>
                            {patient?.medicalConditions?.length ?? 0}
                        </div>
                        <div className="stat-label">Conditions</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-value">{logs.length}</div>
                        <div className="stat-label">Access Events</div>
                    </div>
                </div>

                <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {/* Quick Info */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">🪪 Your NFC Card</span>
                            {!nfcId && (
                                <button className="btn btn-primary btn-sm" onClick={() => navigate('/settings')}>
                                    Link Card
                                </button>
                            )}
                        </div>
                        {nfcId ? (
                            <div>
                                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 32, marginBottom: 8 }}>📡</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent2)', letterSpacing: 2 }}>{nfcId}</div>
                                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Your NFC Tag ID</div>
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, textAlign: 'center' }}>
                                    Present this ID when visiting a hospital
                                </p>
                            </div>
                        ) : (
                            <div className="empty">
                                <div className="empty-icon">💳</div>
                                <h3>No NFC Card Linked</h3>
                                <p>Link your physical NFC card to enable hospital access</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Access */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">🔍 Recent Access</span>
                            {logs.length > 0 && (
                                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/access-logs')}>View all</button>
                            )}
                        </div>
                        {logs.length === 0 ? (
                            <div className="empty">
                                <div className="empty-icon">🔒</div>
                                <h3>No Activity Yet</h3>
                                <p>Your profile hasn't been accessed by any hospital yet</p>
                            </div>
                        ) : (
                            logs.slice(0, 4).map((log, i) => (
                                <div key={i} className="list-item">
                                    <div className="list-avatar">🏥</div>
                                    <div className="list-info">
                                        <div className="list-title">{log.hospital?.name ?? 'Unknown Hospital'}</div>
                                        <div className="list-subtitle">{log.action?.replace('_', ' ')} • {new Date(log.accessedAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Allergies Quick View */}
                {patient?.allergies?.length > 0 && (
                    <div className="card" style={{ marginTop: 16 }}>
                        <div className="card-header">
                            <span className="card-title" style={{ color: 'var(--danger)' }}>⚠️ Critical Allergies</span>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>Manage</button>
                        </div>
                        <ul className="pill-list">
                            {patient.allergies.map((a, i) => <li key={i} className="pill pill-red">{a}</li>)}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    )
}
