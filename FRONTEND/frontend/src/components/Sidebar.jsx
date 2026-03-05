import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const navItems = [
    { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { label: 'Medical Profile', icon: '🩺', path: '/profile' },
    { label: 'Register NFC Card', icon: '💳', path: '/link-nfc' },
    { label: 'Access Logs', icon: '📋', path: '/access-logs' },
    { label: 'Settings', icon: '⚙️', path: '/settings' },
]

export default function Sidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="sidebar-logo-icon">📡</span>
                <div>
                    <h2>NFC MedScan</h2>
                    <p>Patient Portal</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <button key={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div className="list-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user?.role}</div>
                    </div>
                </div>
                <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout}>
                    🚪 Sign Out
                </button>
            </div>
        </aside>
    )
}
