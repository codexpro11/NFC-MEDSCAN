import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../api'

export default function PatientView() {
    const { nfcId } = useParams()
    const navigate = useNavigate()
    const [patient, setPatient] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingAI, setLoadingAI] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get(`/patients/nfc/${nfcId}`)
            .then(r => setPatient(r.data))
            .catch(err => {
                if (err.response?.status === 403) setError('Patient has disabled data consent.')
                else setError('Patient not found.')
            })
            .finally(() => setLoading(false))
    }, [nfcId])

    const loadAISuggestions = () => {
        setLoadingAI(true)
        api.get(`/patients/${nfcId}/ai-suggestions`)
            .then(r => setSuggestions(r.data.suggestions || []))
            .catch(() => setSuggestions(['AI suggestions not available. Check backend.']))
            .finally(() => setLoadingAI(false))
    }

    if (loading) return (
        <div className="layout"><Sidebar />
            <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
            </main>
        </div>
    )

    if (error) return (
        <div className="layout"><Sidebar />
            <main className="main-content">
                <div className="alert alert-error" style={{ marginTop: 40 }}>⚠️ {error}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back to Scanner</button>
            </main>
        </div>
    )

    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/scanner')}>← Scanner</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/visit-notes/${nfcId}`)}>📝 Visit Notes</button>
                </div>

                {/* Hero */}
                <div className="patient-hero">
                    <div className="patient-avatar-lg">{patient?.name?.[0]?.toUpperCase()}</div>
                    <div className="patient-meta">
                        <h2>{patient?.name}</h2>
                        <p>NFC Card: <strong style={{ color: 'var(--accent2)' }}>{patient?.nfcId}</strong></p>
                        <div className="patient-meta-row">
                            {patient?.bloodGroup && <span className="pill pill-red">🩸 {patient.bloodGroup}</span>}
                            {patient?.age && <span className="pill pill-blue">Age {patient.age}</span>}
                            {patient?.dateOfBirth && <span className="pill pill-orange">📅 {patient.dateOfBirth}</span>}
                            <span className={`pill ${patient?.dataConsentEnabled ? 'pill-green' : 'pill-red'}`}>
                                {patient?.dataConsentEnabled ? '✅ Consent Active' : '❌ Consent Disabled'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* AI Suggestions */}
                <div className="ai-card">
                    <div className="ai-header">
                        <div className="ai-dot" />
                        <span style={{ fontSize: 14, fontWeight: 700 }}>🤖 AI Clinical Suggestions</span>
                        {suggestions.length === 0 && (
                            <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}
                                onClick={loadAISuggestions} disabled={loadingAI}>
                                {loadingAI ? <span className="spinner" /> : 'Generate Suggestions'}
                            </button>
                        )}
                    </div>
                    {suggestions.length > 0 ? (
                        <ul className="ai-suggestions">
                            {suggestions.map((s, i) => <li key={i} className="ai-suggestion">{s}</li>)}
                        </ul>
                    ) : (
                        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                            {loadingAI ? 'Generating AI clinical insights...' : 'Click "Generate Suggestions" to get AI-powered clinical recommendations based on this patient\'s conditions and medications.'}
                        </p>
                    )}
                </div>

                {/* Allergies */}
                {patient?.allergies?.length > 0 && (
                    <div style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5', marginBottom: 8 }}>⚠️ CRITICAL ALLERGIES</div>
                        <ul className="pill-list">
                            {patient.allergies.map((a, i) => <li key={i} className="pill pill-red">{a}</li>)}
                        </ul>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div className="card">
                        <div className="card-title" style={{ marginBottom: 12 }}>🫀 Medical Conditions</div>
                        {patient?.medicalConditions?.length ? (
                            <ul className="pill-list">
                                {patient.medicalConditions.map((c, i) => <li key={i} className="pill pill-orange">{c}</li>)}
                            </ul>
                        ) : <span style={{ fontSize: 13, color: 'var(--muted)' }}>None recorded</span>}
                    </div>
                    <div className="card">
                        <div className="card-title" style={{ marginBottom: 12 }}>💊 Current Medications</div>
                        {patient?.currentMedications?.length ? (
                            <ul className="pill-list">
                                {patient.currentMedications.map((m, i) => <li key={i} className="pill pill-blue">{m}</li>)}
                            </ul>
                        ) : <span style={{ fontSize: 13, color: 'var(--muted)' }}>None recorded</span>}
                    </div>
                </div>

                {/* Insurance */}
                {patient?.insurance && (
                    <div className="card">
                        <div className="card-title" style={{ marginBottom: 16 }}>🛡️ Insurance Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                            {[
                                { label: 'Provider', value: patient.insurance.provider },
                                { label: 'Policy Number', value: patient.insurance.policyNumber },
                                { label: 'Group Number', value: patient.insurance.groupNumber },
                                { label: 'Coverage', value: patient.insurance.coverage },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 8 }}>
                                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{value || '—'}</div>
                                </div>
                            ))}
                            <div style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 8 }}>
                                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Expiry Date</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: patient.insurance.expiryDate && new Date(patient.insurance.expiryDate) < new Date() ? 'var(--danger)' : 'var(--success)' }}>
                                    {patient.insurance.expiryDate || '—'}
                                    {patient.insurance.expiryDate && new Date(patient.insurance.expiryDate) < new Date() && ' (EXPIRED)'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Emergency Contacts */}
                {patient?.emergencyContacts?.length > 0 && (
                    <div className="card" style={{ marginTop: 16 }}>
                        <div className="card-title" style={{ marginBottom: 16 }}>🆘 Emergency Contacts</div>
                        {patient.emergencyContacts.map((ec, i) => (
                            <div key={i} className="list-item">
                                <div className="list-avatar">👤</div>
                                <div className="list-info">
                                    <div className="list-title">{ec.name} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({ec.relationship})</span></div>
                                    <div className="list-subtitle">📞 {ec.phone}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
