import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Scanner from './pages/Scanner'
import PatientView from './pages/PatientView'
import VisitNotes from './pages/VisitNotes'
import './index.css'

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isLoggedIn } = useAuth()
  return !isLoggedIn ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
        <Route path="/patient/:nfcId" element={<ProtectedRoute><PatientView /></ProtectedRoute>} />
        <Route path="/visit-notes" element={<ProtectedRoute><VisitNotes /></ProtectedRoute>} />
        <Route path="/visit-notes/:nfcId" element={<ProtectedRoute><VisitNotes /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
