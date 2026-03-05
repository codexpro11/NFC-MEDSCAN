import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import Sidebar from '../components/Sidebar'
import api from '../api'

/* ── Reusable tag input (same as MedicalProfile) ── */
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

const STEPS = ['💳 Card Link', '🩺 Medical Details', '✅ Complete']

export default function LinkNfcCard() {
    const { user, login } = useAuth()
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    /* Step 1 state */
    const [nfcId, setNfcId] = useState(user?.linkedNfcId || '')
    const [cardLinked, setCardLinked] = useState(false)

    /* Step 2 state */
    const [form, setForm] = useState({
        name: user?.name || '',
        age: '',
        bloodGroup: 'O+',
        dateOfBirth: '',
        allergies: [],
        medicalConditions: [],
        currentMedications: [],
        lastCheckup: '',
        insurance: { provider: '', policyNumber: '', groupNumber: '', coverage: '', expiryDate: '' }
    })
    const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
    const setIns = (key, val) => setForm(f => ({ ...f, insurance: { ...f.insurance, [key]: val } }))

    /* ── Step 1: Link card ── */
    const handleLinkCard = async (e) => {
        e.preventDefault()
        if (!nfcId.trim()) return
        setLoading(true); setError('')
        try {
            // Save NFC ID to the user account
            await api.put('/patients/link-nfc', { email: user.email, nfcId: nfcId.trim() })
            const updatedUser = { ...user, linkedNfcId: nfcId.trim() }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            login(updatedUser, localStorage.getItem('token'))
            setCardLinked(true)
            setStep(1)
        } catch (err) {
            // If endpoint not available, save locally and allow continuing
            if (err.response?.status === 404 || err.response?.status === 405) {
                const updatedUser = { ...user, linkedNfcId: nfcId.trim() }
                localStorage.setItem('user', JSON.stringify(updatedUser))
                login(updatedUser, localStorage.getItem('token'))
                setCardLinked(true)
                setStep(1)
            } else {
                setError(err.response?.data?.message || 'Failed to link card. Try again.')
            }
        } finally { setLoading(false) }
    }

    /* ── Step 2: Save medical details ── */
    const handleSaveDetails = async (e) => {
        e.preventDefault()
        setLoading(true); setError('')
        const linkedNfcId = nfcId.trim()
        const payload = {
            ...form,
            nfcId: linkedNfcId,
            age: form.age ? parseInt(form.age) : null,
            insurance: Object.values(form.insurance).some(Boolean) ? form.insurance : null
        }
        try {
            // Try to create a new patient record
            await api.post('/patients', payload)
            setStep(2)
        } catch (err) {
            if (err.response?.status === 409 || err.response?.status === 400) {
                // Patient record already exists for this NFC ID — update it
                try {
                    const { data: existing } = await api.get(`/patients/nfc/${linkedNfcId}`)
                    await api.put(`/patients/${existing.id}`, { ...existing, ...payload })
                    setStep(2)
                } catch {
                    setError('Could not save medical details. Check backend connection.')
                }
            } else {
                setError(err.response?.data?.message || 'Could not save medical details.')
            }
        } finally { setLoading(false) }
    }

    /* ── Stepper header ── */
    const Stepper = () => (
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, alignItems: 'center' }}>
            {STEPS.map((label, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        opacity: i <= step ? 1 : 0.35,
                        transition: 'opacity 0.3s'
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: i < step ? 'var(--success)' : i === step ? 'var(--accent)' : 'var(--bg3)',
                            border: `2px solid ${i === step ? 'var(--accent)' : i < step ? 'var(--success)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700, color: '#fff',
                            transition: 'all 0.3s'
                        }}>
                            {i < step ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: i === step ? 600 : 400, whiteSpace: 'nowrap', color: i === step ? 'var(--text)' : 'var(--muted)' }}>
                            {label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div style={{ flex: 1, height: 2, margin: '0 12px', background: i < step ? 'var(--success)' : 'var(--border)', transition: 'background 0.3s' }} />
                    )}
                </div>
            ))}
        </div>
    )

    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content" style={{ maxWidth: 760 }}>
                <div className="page-header">
                    <h1>💳 Register NFC Card</h1>
                    <p>Link a new NFC card and fill in your full medical profile in one place</p>
                </div>

                <Stepper />

                {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

                {/* ── STEP 1: Link Card ── */}
                {step === 0 && (
                    <div className="card">
                        <div className="card-header"><span className="card-title">💳 Link Your NFC Card</span></div>
                        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.7 }}>
                            Your NFC card ID is the unique identifier written on your physical card or programmed into it.
                            Use the <strong>NFC Tools</strong> app (Android) to write a custom ID, or use your card's hardware UID.
                        </p>

                        {/* Tips */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                            {[
                                { icon: '📱', title: 'Android Phone', tip: 'Install NFC Tools → Write → Text → type e.g. NFC001 → tap card' },
                                { icon: '🏷️', title: 'Pre-printed Card', tip: 'Check the back of your card for the printed NFC ID (e.g. NFC001)' },
                                { icon: '🖥️', title: 'USB Reader', tip: 'Tap on reader — hardware UID appears automatically (no app needed)' },
                                { icon: '🏥', title: 'Hospital Assigned', tip: 'Ask reception for your assigned NFC card ID and enter it below' },
                            ].map((t, i) => (
                                <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{t.icon} {t.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.tip}</div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleLinkCard}>
                            <div className="form-group">
                                <label className="form-label">NFC Card ID <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <input className="form-input" required placeholder="e.g. NFC001 or 04A3B1C2"
                                        value={nfcId} onChange={e => setNfcId(e.target.value.toUpperCase())}
                                        style={{ textTransform: 'uppercase', letterSpacing: 1, flex: 1 }} />
                                    <button className="btn btn-primary" type="submit" disabled={loading || !nfcId.trim()}>
                                        {loading ? <span className="spinner" /> : '🔗 Link & Continue'}
                                    </button>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                                    This will be your permanent medical ID. Make sure it matches your physical card.
                                </div>
                            </div>
                        </form>

                        {user?.linkedNfcId && (
                            <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(14,165,233,0.08)', borderRadius: 8, border: '1px solid rgba(14,165,233,0.2)', fontSize: 13 }}>
                                ℹ️ Currently linked: <strong style={{ color: 'var(--accent2)' }}>{user.linkedNfcId}</strong> — enter a new ID above to replace it.
                            </div>
                        )}
                    </div>
                )}

                {/* ── STEP 2: Medical Details ── */}
                {step === 1 && (
                    <form onSubmit={handleSaveDetails}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                                Card linked: <strong style={{ color: 'var(--success)' }}>✓ {nfcId}</strong>
                            </div>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(2)}
                                style={{ fontSize: 12 }}>
                                Skip for now →
                            </button>
                        </div>

                        {/* Basic Info */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-header"><span className="card-title">👤 Basic Information</span></div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input className="form-input" placeholder="John Doe" value={form.name}
                                        onChange={e => set('name', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input className="form-input" type="number" min="0" max="150" placeholder="e.g. 28"
                                        value={form.age} onChange={e => set('age', e.target.value)} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Blood Group</label>
                                    <select className="form-select" value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date of Birth</label>
                                    <input className="form-input" type="date" value={form.dateOfBirth}
                                        onChange={e => set('dateOfBirth', e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Checkup Date</label>
                                <input className="form-input" type="date" value={form.lastCheckup}
                                    onChange={e => set('lastCheckup', e.target.value)}
                                    style={{ maxWidth: 220 }} />
                            </div>
                        </div>

                        {/* Medical Data */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-header"><span className="card-title">🏥 Medical Data</span>
                                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Press Enter or click Add after each item</span>
                            </div>
                            <TagInput label="⚠️ Allergies" values={form.allergies}
                                onChange={v => set('allergies', v)} pillClass="pill-red"
                                placeholder="e.g. Penicillin, Peanuts — press Enter" />
                            <TagInput label="🫀 Medical Conditions" values={form.medicalConditions}
                                onChange={v => set('medicalConditions', v)} pillClass="pill-orange"
                                placeholder="e.g. Type 2 Diabetes — press Enter" />
                            <TagInput label="💊 Current Medications" values={form.currentMedications}
                                onChange={v => set('currentMedications', v)} pillClass="pill-blue"
                                placeholder="e.g. Metformin 500mg — press Enter" />
                        </div>

                        {/* Insurance */}
                        <div className="card" style={{ marginBottom: 24 }}>
                            <div className="card-header"><span className="card-title">🛡️ Insurance <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted)' }}>(optional)</span></span></div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Provider</label>
                                    <input className="form-input" value={form.insurance.provider}
                                        onChange={e => setIns('provider', e.target.value)} placeholder="e.g. BlueCross BlueShield" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Policy Number</label>
                                    <input className="form-input" value={form.insurance.policyNumber}
                                        onChange={e => setIns('policyNumber', e.target.value)} placeholder="e.g. BC-2024-987654" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Group Number</label>
                                    <input className="form-input" value={form.insurance.groupNumber}
                                        onChange={e => setIns('groupNumber', e.target.value)} placeholder="Optional" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Coverage Type</label>
                                    <input className="form-input" value={form.insurance.coverage}
                                        onChange={e => setIns('coverage', e.target.value)} placeholder="e.g. Comprehensive" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Expiry Date</label>
                                <input className="form-input" type="date" value={form.insurance.expiryDate}
                                    onChange={e => setIns('expiryDate', e.target.value)} style={{ maxWidth: 220 }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
                            <button className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>
                                {loading ? <><span className="spinner" /> Saving...</> : '💾 Save Medical Details →'}
                            </button>
                        </div>
                    </form>
                )}

                {/* ── STEP 3: Success ── */}
                {step === 2 && (
                    <div className="card" style={{ textAlign: 'center', padding: '64px 32px' }}>
                        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>NFC Card Registered!</h2>
                        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 8 }}>
                            Your card <strong style={{ color: 'var(--accent2)' }}>{nfcId}</strong> is now linked to your medical profile.
                        </p>
                        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 32 }}>
                            Hospital staff can now scan your NFC card to instantly access your medical information during visits.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
                            {[
                                { icon: '🏥', label: 'Emergency scans', desc: 'Hospitals can read your card' },
                                { icon: '💊', label: 'Medications visible', desc: 'Staff see your meds instantly' },
                                { icon: '🛡️', label: 'Data protected', desc: 'You control consent anytime' },
                            ].map((f, i) => (
                                <div key={i} style={{ padding: '14px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
                                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
                                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{f.desc}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn-primary" onClick={() => navigate('/profile')}>
                                🩺 View Medical Profile
                            </button>
                            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
