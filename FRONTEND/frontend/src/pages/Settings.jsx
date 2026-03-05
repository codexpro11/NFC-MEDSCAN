import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import Sidebar from '../components/Sidebar'
import api from '../api'

export default function Settings() {
    const { user, login } = useAuth()
    const [nfcId, setNfcId] = useState(user?.linkedNfcId || '')
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    // Consent state — loaded from the patient's actual record
    const [consentLoading, setConsentLoading] = useState(false)
    const [dataConsent, setDataConsent] = useState(true)
    const [emergencyOverride, setEmergencyOverride] = useState(true)
    const [patientId, setPatientId] = useState(null)

    // Load current consent values from backend
    useEffect(() => {
        const linkedNfcId = user?.linkedNfcId
        if (!linkedNfcId) return
        api.get(`/patients/nfc/${linkedNfcId}`)
            .then(r => {
                setDataConsent(r.data.dataConsentEnabled ?? true)
                setEmergencyOverride(r.data.emergencyOverride ?? true)
                setPatientId(r.data.id)
            })
            .catch(() => { /* non-critical, keep defaults */ })
    }, [user?.linkedNfcId])

    const handleLinkCard = async (e) => {
        e.preventDefault()
        setSaving(true); setSuccess(''); setError('')
        try {
            await api.put(`/patients/link-nfc`, { nfcId: nfcId.trim() })
            const updatedUser = { ...user, linkedNfcId: nfcId.trim() }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            login(updatedUser, localStorage.getItem('token'))
            setSuccess('NFC card linked successfully!')
        } catch {
            setError('Failed to link NFC card. Please check the ID and try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleConsentToggle = async (field, value) => {
        if (!patientId) return
        setConsentLoading(true)
        setSuccess(''); setError('')
        try {
            // Fetch current patient data, patch the consent field, and save
            const { data: patient } = await api.get(`/patients/nfc/${user.linkedNfcId}`)
            const updated = { ...patient, [field]: value }
            await api.put(`/patients/${patientId}`, updated)

            if (field === 'dataConsentEnabled') setDataConsent(value)
            if (field === 'emergencyOverride') setEmergencyOverride(value)
            setSuccess('Privacy settings updated.')
            setTimeout(() => setSuccess(''), 3000)
        } catch {
            setError('Failed to update privacy settings.')
        } finally {
            setConsentLoading(false)
        }
    }

    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1>⚙️ Settings</h1>
                    <p>Manage your account and NFC card preferences</p>
                </div>

                {success && <div className="alert alert-success">✅ {success}</div>}
                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {/* Account Info */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-header"><span className="card-title">👤 Account Info</span></div>
                    <div className="list-item">
                        <div className="list-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                        <div className="list-info">
                            <div className="list-title">{user?.name}</div>
                            <div className="list-subtitle">{user?.email}</div>
                        </div>
                        <span className="pill pill-blue">{user?.role}</span>
                    </div>
                </div>

                {/* NFC Card Linking */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-header"><span className="card-title">💳 NFC Card</span></div>
                    <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                        Enter the NFC ID printed or encoded on your physical card. This links hospitals to your medical profile.
                    </p>
                    <form onSubmit={handleLinkCard}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label className="form-label">NFC Card ID</label>
                                <input className="form-input" value={nfcId} onChange={e => setNfcId(e.target.value)} placeholder="e.g. NFC001" />
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={saving || !nfcId.trim()}>
                                {saving ? <span className="spinner" /> : '🔗 Link Card'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Data Consent — only shown if patient has a linked NFC card */}
                {user?.linkedNfcId && (
                    <div className="card">
                        <div className="card-header"><span className="card-title">🔒 Data Privacy</span></div>
                        {consentLoading && (
                            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Saving...</p>
                        )}
                        <div className="toggle-wrap">
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>Allow Hospital Access</div>
                                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                                    Hospitals can read your profile when your card is scanned
                                </div>
                            </div>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={dataConsent}
                                    disabled={consentLoading}
                                    onChange={e => handleConsentToggle('dataConsentEnabled', e.target.checked)}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                        <div className="toggle-wrap">
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>Emergency Access Override</div>
                                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                                    Allow access even when consent is disabled in life-threatening situations
                                </div>
                            </div>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={emergencyOverride}
                                    disabled={consentLoading}
                                    onChange={e => handleConsentToggle('emergencyOverride', e.target.checked)}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
