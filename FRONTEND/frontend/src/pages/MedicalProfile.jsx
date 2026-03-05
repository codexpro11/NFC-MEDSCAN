import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../api'

function TagInput({ label, values, onChange, placeholder, pillClass }) {
    const [input, setInput] = useState('')
    const add = () => {
        const v = input.trim()
        if (v && !values.includes(v)) { onChange([...values, v]); setInput('') }
    }
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div className="tag-input-wrap">
                <input className="form-input" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
                    placeholder={placeholder} />
                <button type="button" className="btn btn-ghost btn-sm" onClick={add}>Add</button>
            </div>
            <div className="tags-display">
                {values.map((v, i) => (
                    <span key={i} className={`pill ${pillClass}`}>
                        {v} <span className="tag-remove" onClick={() => onChange(values.filter((_, j) => j !== i))}>✕</span>
                    </span>
                ))}
            </div>
        </div>
    )
}

export default function MedicalProfile() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const nfcId = user?.linkedNfcId
    const [patient, setPatient] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!nfcId) { setLoading(false); return }
        api.get(`/patients/nfc/${nfcId}`)
            .then(r => setPatient(r.data))
            .catch(() => setError('Could not load your profile. Make sure backend is running.'))
            .finally(() => setLoading(false))
    }, [nfcId])

    const set = (key, val) => setPatient(p => ({ ...p, [key]: val }))
    const setInsurance = (key, val) => setPatient(p => ({ ...p, insurance: { ...(p.insurance || {}), [key]: val } }))

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true); setSuccess(false); setError('')
        try {
            await api.put(`/patients/${patient.id}`, patient)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch {
            setError('Failed to save profile.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="layout"><Sidebar />
            <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
            </main>
        </div>
    )

    if (!nfcId) return (
        <div className="layout"><Sidebar />
            <main className="main-content">
                <div className="empty" style={{ marginTop: 80 }}>
                    <div className="empty-icon">💳</div>
                    <h3>No NFC Card Linked</h3>
                    <p style={{ marginBottom: 20 }}>Register your NFC card to create and manage your medical profile.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/link-nfc')}>
                        💳 Register NFC Card →
                    </button>
                </div>
            </main>
        </div>
    )

    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1>🩺 Medical Profile</h1>
                    <p>Keep your medical data accurate for emergency access</p>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}
                {success && <div className="alert alert-success">✅ Profile saved successfully!</div>}

                {patient ? (
                    <form onSubmit={handleSave}>
                        {/* Basic Info */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-header"><span className="card-title">👤 Basic Information</span></div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input className="form-input" value={patient.name || ''} onChange={e => set('name', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input className="form-input" type="number" value={patient.age || ''} onChange={e => set('age', parseInt(e.target.value))} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Blood Group</label>
                                    <select className="form-select" value={patient.bloodGroup || ''} onChange={e => set('bloodGroup', e.target.value)}>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date of Birth</label>
                                    <input className="form-input" type="date" value={patient.dateOfBirth || ''} onChange={e => set('dateOfBirth', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Medical Data */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-header"><span className="card-title">🏥 Medical Data</span></div>
                            <TagInput label="⚠️ Allergies" values={patient.allergies || []}
                                onChange={v => set('allergies', v)} pillClass="pill-red" placeholder="e.g. Penicillin — press Enter" />
                            <TagInput label="🫀 Medical Conditions" values={patient.medicalConditions || []}
                                onChange={v => set('medicalConditions', v)} pillClass="pill-orange" placeholder="e.g. Type 2 Diabetes — press Enter" />
                            <TagInput label="💊 Current Medications" values={patient.currentMedications || []}
                                onChange={v => set('currentMedications', v)} pillClass="pill-blue" placeholder="e.g. Metformin 500mg — press Enter" />
                        </div>

                        {/* Insurance */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-header"><span className="card-title">🛡️ Insurance</span></div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Provider</label>
                                    <input className="form-input" value={patient.insurance?.provider || ''}
                                        onChange={e => setInsurance('provider', e.target.value)} placeholder="e.g. BlueCross BlueShield" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Policy Number</label>
                                    <input className="form-input" value={patient.insurance?.policyNumber || ''}
                                        onChange={e => setInsurance('policyNumber', e.target.value)} placeholder="e.g. BC-2024-987654" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Group Number</label>
                                    <input className="form-input" value={patient.insurance?.groupNumber || ''}
                                        onChange={e => setInsurance('groupNumber', e.target.value)} placeholder="Optional" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Coverage Type</label>
                                    <input className="form-input" value={patient.insurance?.coverage || ''}
                                        onChange={e => setInsurance('coverage', e.target.value)} placeholder="e.g. Comprehensive Premium" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Expiry Date</label>
                                <input className="form-input" type="date" value={patient.insurance?.expiryDate || ''}
                                    onChange={e => setInsurance('expiryDate', e.target.value)} style={{ maxWidth: 220 }} />
                            </div>
                        </div>

                        <button className="btn btn-primary" type="submit" disabled={saving}>
                            {saving ? <><span className="spinner" /> Saving...</> : '💾 Save Profile'}
                        </button>
                    </form>
                ) : (
                    <div className="empty">
                        <div className="empty-icon">🔍</div>
                        <h3>No Profile Found</h3>
                        <p>No patient record linked to NFC ID <strong>{nfcId}</strong>. Contact your hospital to create one.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
