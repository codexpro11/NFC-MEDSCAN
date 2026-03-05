import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../api'

const STATE = { IDLE: 'idle', WAITING: 'waiting', SCANNING: 'scanning', SUCCESS: 'success', ERROR: 'error' }

// Check Web NFC API support (Chrome on Android / Chrome with flag)
const NFC_SUPPORTED = typeof window !== 'undefined' && 'NDEFReader' in window

export default function Scanner() {
    const [nfcId, setNfcId] = useState('')
    const [scanState, setScanState] = useState(STATE.IDLE)
    const [patient, setPatient] = useState(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [nfcListening, setNfcListening] = useState(false)
    const [nfcStatus, setNfcStatus] = useState('')
    const navigate = useNavigate()
    const readerRef = useRef(null)
    const abortRef = useRef(null)

    // Cleanup NFC reader on unmount
    useEffect(() => {
        return () => stopNfcListener()
    }, [])

    const stopNfcListener = () => {
        abortRef.current?.abort()
        abortRef.current = null
        readerRef.current = null
        setNfcListening(false)
        setNfcStatus('')
    }

    const startNfcListener = async () => {
        if (!NFC_SUPPORTED) {
            setNfcStatus('Web NFC not supported. Use Chrome on Android or enter ID manually.')
            return
        }
        try {
            const reader = new NDEFReader()
            readerRef.current = reader
            const controller = new AbortController()
            abortRef.current = controller

            await reader.scan({ signal: controller.signal })
            setNfcListening(true)
            setScanState(STATE.WAITING)
            setNfcStatus('📲 Hold patient\'s NFC card near the reader...')

            reader.onreading = ({ message, serialNumber }) => {
                // Try to read NDEF text record first, fall back to card UID
                let cardId = null
                for (const record of message.records) {
                    if (record.recordType === 'text') {
                        const decoder = new TextDecoder(record.encoding || 'utf-8')
                        cardId = decoder.decode(record.data).trim().toUpperCase()
                        break
                    }
                    if (record.recordType === 'url') {
                        // Extract NFC ID from URL like http://…/scanner?nfc=NFC001
                        const decoder = new TextDecoder()
                        const url = decoder.decode(record.data)
                        const match = url.match(/[?&]nfc=([^&]+)/i)
                        if (match) { cardId = match[1].toUpperCase(); break }
                    }
                }
                // Fall back to hardware serial number (card UID)
                if (!cardId && serialNumber) {
                    cardId = serialNumber.replace(/:/g, '').toUpperCase()
                }
                if (cardId) {
                    stopNfcListener()
                    setNfcId(cardId)
                    doScan(cardId)
                }
            }

            reader.onreadingerror = () => {
                setNfcStatus('Could not read card. Try again or enter ID manually.')
                setScanState(STATE.IDLE)
            }
        } catch (err) {
            if (err.name === 'AbortError') return
            setNfcStatus(err.message || 'NFC permission denied. Enter ID manually.')
            setScanState(STATE.IDLE)
            setNfcListening(false)
        }
    }

    const doScan = async (id) => {
        const searchId = id || nfcId
        if (!searchId?.trim()) return
        setScanState(STATE.SCANNING)
        setPatient(null)
        setErrorMsg('')
        try {
            const { data } = await api.get(`/patients/nfc/${searchId.trim()}`)
            setPatient(data)
            setScanState(STATE.SUCCESS)
        } catch (err) {
            if (err.response?.status === 403) {
                setErrorMsg('Patient has disabled data consent. Access denied.')
            } else if (err.response?.status === 404) {
                setErrorMsg(`No patient found for NFC ID: ${searchId}`)
            } else {
                setErrorMsg('Scan failed. Check backend connection.')
            }
            setScanState(STATE.ERROR)
        }
    }

    const handleManualScan = (e) => {
        e?.preventDefault()
        if (nfcListening) stopNfcListener()
        doScan(nfcId)
    }

    const handleReset = () => {
        stopNfcListener()
        setScanState(STATE.IDLE)
        setNfcId('')
        setPatient(null)
        setErrorMsg('')
    }

    const ringClass = {
        [STATE.IDLE]: '',
        [STATE.WAITING]: 'waiting',
        [STATE.SCANNING]: 'scanning',
        [STATE.SUCCESS]: 'success',
        [STATE.ERROR]: 'error',
    }[scanState]

    const scanIcon = {
        [STATE.IDLE]: '📡',
        [STATE.WAITING]: '📲',
        [STATE.SCANNING]: '🔄',
        [STATE.SUCCESS]: '✅',
        [STATE.ERROR]: '❌',
    }[scanState]

    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1>📡 NFC Scanner</h1>
                    <p>Tap a patient's NFC card or enter their ID manually</p>
                </div>

                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div className="card" style={{ flex: '0 0 360px' }}>
                        <div className="scanner-box">
                            {/* Animated ring */}
                            <div className={`scanner-ring ${ringClass}`}>
                                <span className={`scanner-icon ${scanState === STATE.SCANNING ? 'spinning' : ''}`}
                                    style={scanState === STATE.SCANNING ? { animation: 'spin 1s linear infinite' } : {}}>
                                    {scanIcon}
                                </span>
                            </div>

                            <div className="scanner-title">
                                {scanState === STATE.IDLE && 'Ready to Scan'}
                                {scanState === STATE.WAITING && 'Waiting for Card...'}
                                {scanState === STATE.SCANNING && 'Scanning...'}
                                {scanState === STATE.SUCCESS && 'Patient Found!'}
                                {scanState === STATE.ERROR && 'Scan Failed'}
                            </div>
                            <div className="scanner-sub">
                                {scanState === STATE.IDLE && 'Tap a card or enter NFC ID below'}
                                {scanState === STATE.WAITING && '📲 Hold card near NFC reader'}
                                {scanState === STATE.SCANNING && `Looking up: ${nfcId}`}
                                {scanState === STATE.SUCCESS && 'Profile loaded successfully'}
                                {scanState === STATE.ERROR && errorMsg}
                            </div>

                            {/* NFC status message */}
                            {nfcStatus && (
                                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, textAlign: 'center', padding: '6px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                                    {nfcStatus}
                                </div>
                            )}

                            {/* Physical NFC tap button */}
                            {NFC_SUPPORTED && scanState === STATE.IDLE && (
                                <button className="btn btn-primary" style={{ width: '100%', marginTop: 16, gap: 8 }}
                                    onClick={startNfcListener}>
                                    📲 Tap NFC Card
                                </button>
                            )}
                            {!NFC_SUPPORTED && scanState === STATE.IDLE && (
                                <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 8, padding: '6px 12px', background: 'rgba(255,165,0,0.08)', borderRadius: 8, border: '1px solid rgba(255,165,0,0.2)' }}>
                                    ⚠️ Web NFC requires Chrome on Android. Use manual entry below.
                                </div>
                            )}

                            {/* Stop listening button */}
                            {nfcListening && (
                                <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8 }}
                                    onClick={stopNfcListener}>
                                    ✋ Cancel NFC Listen
                                </button>
                            )}

                            {/* Manual input form */}
                            <form onSubmit={handleManualScan} style={{ marginTop: 12 }}>
                                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                                    Or enter NFC ID manually:
                                </div>
                                <div className="nfc-input-wrap">
                                    <input className="form-input" placeholder="e.g. NFC001"
                                        value={nfcId} onChange={e => setNfcId(e.target.value.toUpperCase())}
                                        disabled={scanState === STATE.SCANNING || scanState === STATE.WAITING}
                                        style={{ textTransform: 'uppercase', letterSpacing: 1 }} />
                                    <button className="btn btn-primary" type="submit"
                                        disabled={!nfcId.trim() || scanState === STATE.SCANNING || scanState === STATE.WAITING}>
                                        {scanState === STATE.SCANNING ? <span className="spinner" /> : '🔍'}
                                    </button>
                                </div>
                            </form>

                            {(scanState === STATE.SUCCESS || scanState === STATE.ERROR) && (
                                <button className="btn btn-ghost btn-sm" style={{ marginTop: 16, width: '100%' }} onClick={handleReset}>
                                    🔄 Scan Another Patient
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results panel */}
                    {patient && (
                        <div style={{ flex: 1, minWidth: 300 }}>
                            {/* Hero */}
                            <div className="patient-hero">
                                <div className="patient-avatar-lg">
                                    {patient.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="patient-meta">
                                    <h2>{patient.name}</h2>
                                    <p>NFC ID: <strong style={{ color: 'var(--accent2)' }}>{patient.nfcId}</strong></p>
                                    <div className="patient-meta-row">
                                        {patient.bloodGroup && <span className="pill pill-red">🩸 {patient.bloodGroup}</span>}
                                        {patient.age && <span className="pill pill-blue">Age {patient.age}</span>}
                                        {patient.dateOfBirth && <span className="pill pill-orange">DOB: {patient.dateOfBirth}</span>}
                                    </div>
                                </div>
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <button className="btn btn-primary btn-sm"
                                        onClick={() => navigate(`/patient/${patient.nfcId}`)}>
                                        Full Profile →
                                    </button>
                                    <button className="btn btn-ghost btn-sm"
                                        onClick={() => navigate(`/visit-notes/${patient.nfcId}`)}>
                                        📝 Add Note
                                    </button>
                                </div>
                            </div>

                            {/* Allergies — critical */}
                            {patient.allergies?.length > 0 && (
                                <div style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5', marginBottom: 8 }}>⚠️ CRITICAL ALLERGIES</div>
                                    <ul className="pill-list">
                                        {patient.allergies.map((a, i) => <li key={i} className="pill pill-red">{a}</li>)}
                                    </ul>
                                </div>
                            )}

                            {/* Conditions & Medications */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="card" style={{ padding: 16 }}>
                                    <div className="card-title" style={{ marginBottom: 12, fontSize: 13 }}>🫀 Conditions</div>
                                    {patient.medicalConditions?.length ? (
                                        <ul className="pill-list">
                                            {patient.medicalConditions.map((c, i) => <li key={i} className="pill pill-orange">{c}</li>)}
                                        </ul>
                                    ) : <span style={{ fontSize: 12, color: 'var(--muted)' }}>None recorded</span>}
                                </div>
                                <div className="card" style={{ padding: 16 }}>
                                    <div className="card-title" style={{ marginBottom: 12, fontSize: 13 }}>💊 Medications</div>
                                    {patient.currentMedications?.length ? (
                                        <ul className="pill-list">
                                            {patient.currentMedications.map((m, i) => <li key={i} className="pill pill-blue">{m}</li>)}
                                        </ul>
                                    ) : <span style={{ fontSize: 12, color: 'var(--muted)' }}>None recorded</span>}
                                </div>
                            </div>

                            {/* Insurance */}
                            {patient.insurance && (
                                <div className="card" style={{ marginTop: 12, padding: 16 }}>
                                    <div className="card-title" style={{ marginBottom: 12, fontSize: 13 }}>🛡️ Insurance</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                                        <div><span style={{ color: 'var(--muted)' }}>Provider:</span> {patient.insurance.provider || '—'}</div>
                                        <div><span style={{ color: 'var(--muted)' }}>Policy:</span> {patient.insurance.policyNumber || '—'}</div>
                                        <div><span style={{ color: 'var(--muted)' }}>Coverage:</span> {patient.insurance.coverage || '—'}</div>
                                        <div><span style={{ color: 'var(--muted)' }}>Expires:</span>{' '}
                                            {patient.insurance.expiryDate
                                                ? <span style={{ color: new Date(patient.insurance.expiryDate) < new Date() ? 'var(--danger)' : 'var(--success)' }}>
                                                    {patient.insurance.expiryDate}
                                                </span>
                                                : '—'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error state */}
                    {scanState === STATE.ERROR && !patient && (
                        <div className="card" style={{ flex: 1 }}>
                            <div className="empty">
                                <div className="empty-icon">🔍</div>
                                <h3>No Patient Found</h3>
                                <p>{errorMsg}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Setup guide */}
                <div className="card" style={{ marginTop: 24 }}>
                    <div className="card-title">📖 NFC Card Setup Guide</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 12 }}>
                        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, borderLeft: '3px solid var(--accent)' }}>
                            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>📱 Option A — Android Phone</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                                1. Install <strong>NFC Tools</strong> (free)<br />
                                2. Write Text record: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: 3 }}>NFC001</code><br />
                                3. Tap on the patient's card<br />
                                4. Link ID in Patient Portal → Settings
                            </div>
                        </div>
                        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, borderLeft: '3px solid var(--accent2)' }}>
                            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>🖥️ Option B — USB NFC Reader</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                                Use ACR122U or similar reader.<br />
                                Card UID is auto-detected and used as the NFC ID when you click<br />
                                <strong>"📲 Tap NFC Card"</strong> (Chrome on Android only)
                            </div>
                        </div>
                        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, borderLeft: '3px solid var(--success)' }}>
                            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>🌐 Option C — Write URL to Card</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                                Write URL: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: 3, wordBreak: 'break-all' }}>http://hospital:5174/scanner?nfc=NFC001</code><br />
                                Tapping opens the scanner pre-filled.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
