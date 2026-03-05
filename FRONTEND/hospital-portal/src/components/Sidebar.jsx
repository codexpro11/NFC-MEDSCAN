import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const navItems = [
    { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { label: 'NFC Scanner', icon: '📡', path: '/scanner' },
    { label: 'Visit Notes', icon: '📝', path: '/visit-notes' },
]

export default function Sidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const roleColors = { DOCTOR: 'pill-blue', NURSE: 'pill-green', RECEPTIONIST: 'pill-orange', ADMIN: 'pill-purple' }

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">🏥</div>
                <div>
                    <h2>NFC MedScan</h2>
                    <p>Hospital Portal</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <button key={item.path}
                        className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                {user && (
                    <div className="sidebar-hospital" style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <div className="list-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                                <span className={`pill ${roleColors[user.role] || 'pill-blue'}`} style={{ fontSize: 11 }}>{user.role}</span>
                            </div>
                        </div>
                    </div>
                )}
                <button className="btn btn-ghost btn-sm btn-full" onClick={() => { logout(); navigate('/login') }}>
                    🚪 Sign Out
                </button>
            </div>
        </aside>
    )
}
