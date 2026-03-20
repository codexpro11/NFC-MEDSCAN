import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import Sidebar from '../components/Sidebar'
import api from '../api'

export default function VisitNotes() {
    const { nfcId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [notes, setNotes] = useState([])
    const [patient, setPatient] = useState(null)
    const [form, setForm] = useState({ notes: '', diagnosis: '', visitDate: new Date().toISOString().split('T')[0] })
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    const canWrite = ['DOCTOR', 'NURSE', 'ADMIN'].includes(user?.role)

    useEffect(() => {
        const targetNfcId = nfcId || ''
        Promise.allSettled([
            targetNfcId ? api.get(`/patients/nfc/${targetNfcId}`) : Promise.reject(),
            targetNfcId ? api.get(`/visit-notes/patient/${targetNfcId}`) : Promise.reject()
        ]).then(([patientRes, notesRes]) => {
            if (patientRes.status === 'fulfilled') setPatient(patientRes.value.data)
            if (notesRes.status === 'fulfilled') setNotes(notesRes.value.data)
        }).finally(() => setLoading(false))
    }, [nfcId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!nfcId) { setError('No patient selected. Go to the Scanner first.'); return }
        setSaving(true); setError(''); setSuccess(false)
        try {
            const payload = {
                nfcId: nfcId,
                hospitalId: user.hospitalId,
                notes: form.notes,
                diagnosis: form.diagnosis,
                visitDate: form.visitDate, // actual visit date entered by staff
            }
            const { data } = await api.post('/visit-notes', payload)
            setNotes(prev => [data, ...prev])
            setForm({ notes: '', diagnosis: '', visitDate: new Date().toISOString().split('T')[0] })
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to save note. Please try again.'
            setError(msg)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/scanner')}>← Scanner</button>
                    {patient && (
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/patient/${nfcId}`)}>Full Profile</button>
                    )}
                </div>

                <div className="page-header">
                    <h1>📝 Visit Notes</h1>
                    <p>{patient ? `Patient: ${patient.name} (${nfcId})` : nfcId ? `NFC ID: ${nfcId}` : 'Select a patient from the Scanner'}</p>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}
                {success && <div className="alert alert-success">✅ Visit note saved successfully!</div>}

                <div style={{ display: 'grid', gridTemplateColumns: nfcId && canWrite ? '1fr 1fr' : '1fr', gap: 20 }}>
                    {/* Add Note Form */}
                    {nfcId && canWrite && (
                        <div className="card">
                            <div className="card-header">
                                <span className="card-title">➕ Add Visit Note</span>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Visit Date</label>
                                    <input className="form-input" type="date" value={form.visitDate}
                                        onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Diagnosis</label>
                                    <input className="form-input" placeholder="Primary diagnosis"
                                        value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Clinical Notes <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <textarea className="form-textarea" required
                                        placeholder="Observations, treatment plan, follow-up instructions..."
                                        value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                                </div>
                                <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
                                    {saving ? <><span className="spinner" /> Saving...</> : '💾 Save Visit Note'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Notes History */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">📋 Visit History</span>
                            {loading && <span className="spinner" />}
                            {notes.length > 0 && <span className="pill pill-blue">{notes.length} notes</span>}
                        </div>
                        {!nfcId ? (
                            <div className="empty" style={{ padding: '24px 0' }}>
                                <div className="empty-icon">📡</div>
                                <h3>No Patient Selected</h3>
                                <p>Scan an NFC card first to view or add visit notes</p>
                                <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/scanner')}>Go to Scanner</button>
                            </div>
                        ) : notes.length === 0 && !loading ? (
                            <div className="empty" style={{ padding: '24px 0' }}>
                                <div className="empty-icon">📝</div>
                                <h3>No Visit Notes</h3>
                                <p>This patient has no recorded visits yet</p>
                            </div>
                        ) : (
                            notes.map((note, i) => (
                                <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <span className="pill pill-blue">📅 {note.visitDate}</span>
                                        {note.diagnosis && <span className="pill pill-orange">{note.diagnosis}</span>}
                                        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>
                                            {note.doctor?.name || 'Staff'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{note.notes}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
